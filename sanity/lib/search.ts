import 'server-only';

import type { SearchResponse, SearchResult } from '@/app/lib/search-types';
import { getYoutubeEmbedUrl } from '@/app/lib/lesson-video';
import { urlFor } from './image';
import { client } from './client';
import { expandSearchTerms } from './search-context';

type SearchLesson = {
  _id: string;
  title: string;
  slug: string | null;
  videoUrl: string | null;
  poster: Parameters<typeof urlFor>[0] | null;
  duration: number | null;
  keyPoints: string[] | null;
  notesText: string | null;
};
type SearchCourse = {
  _id: string;
  title: string;
  slug: string | null;
  summary: string | null;
  modules: { title: string; summary: string | null; lessons: (SearchLesson | null)[] | null }[] | null;
};
type VideoMatch = {
  _id: string;
  url: string;
  chapters: { startSeconds: number; label: string }[] | null;
  chunks: { startSeconds: number; text: string }[] | null;
};

const COURSES = /* groq */ `*[_type == "course" && defined(slug.current) && !(_id in path("drafts.**"))]{
  _id, title, "slug": slug.current, summary,
  modules[]{title, summary, lessons[]->{
    _id, title, "slug": slug.current, videoUrl, poster, duration, keyPoints,
    "notesText": pt::text(notes)
  }}
}`;

function patterns(query: string, expanded: string[]) {
  const words = [query, ...expanded]
    .flatMap((value) => value.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [])
    .filter((word) => word.length >= 2 && word.length <= 32);
  return [...new Set(words)].slice(0, 12);
}

function matchExpression(fields: string[], words: string[], params: Record<string, string>) {
  return words.flatMap((word, index) => {
    params[`term${index}`] = `${word}*`;
    return fields.map((field) => `${field} match $term${index}`);
  }).join(' || ');
}

function videoQuery(words: string[]) {
  const params: Record<string, string> = {};
  const chapterMatch = matchExpression(['label'], words, params);
  const chunkMatch = matchExpression(['text'], words, params);
  const query = /* groq */ `*[_type == "video" && !(_id in path("drafts.**")) &&
    (count(chapters[${chapterMatch}]) > 0 || count(chunks[${chunkMatch}]) > 0)
  ]{
    _id, url,
    "chapters": chapters[${chapterMatch}][0...5]{startSeconds, label},
    "chunks": chunks[${chunkMatch}][0...5]{startSeconds, text}
  }`;
  return { query, params };
}

function youtubeId(value: string | null) {
  if (!value) return null;
  const embed = getYoutubeEmbedUrl(value, 0);
  return embed ? new URL(embed).pathname.split('/').at(-1) : null;
}

function score(value: string, words: string[], exactQuery: string) {
  const lowered = value.toLowerCase();
  const exact = lowered.includes(exactQuery) ? 6 : 0;
  return exact + words.reduce((sum, word) => sum + (new RegExp(`(^|[^\\p{L}\\p{N}])${word}`, 'u').test(lowered) ? 1 : 0), 0);
}

function description(lesson: SearchLesson, fallback: string | null) {
  return (lesson.notesText?.replace(/\s+/g, ' ').trim() || fallback || lesson.keyPoints?.[0] || lesson.title).slice(0, 210);
}

function poster(lesson: SearchLesson) {
  return lesson.poster ? urlFor(lesson.poster).width(640).height(360).url() : null;
}

/** Search content authoritatively after the MCP agent has interpreted the query. */
export async function searchContent(query: string): Promise<SearchResponse> {
  const expanded = await expandSearchTerms(query);
  const words = patterns(query, expanded);
  if (!words.length) return { query, total: 0, courseCount: 0, results: [] };

  const videoSearch = videoQuery(words);
  const [courses, videos] = await Promise.all([
    client.fetch<SearchCourse[]>(COURSES, {}, { cache: 'no-store' }),
    client.fetch<VideoMatch[]>(videoSearch.query, videoSearch.params, { cache: 'no-store' }),
  ]);
  const videoById = new Map<string, VideoMatch[]>();
  for (const video of videos) {
    const id = youtubeId(video.url);
    if (!id) continue;
    videoById.set(id, [...(videoById.get(id) ?? []), video]);
  }

  const results: SearchResult[] = [];
  const seen = new Set<string>();
  const normalizedQuery = query.toLowerCase().trim();
  for (const course of courses) {
    if (!course.slug) continue;
    for (const [moduleIndex, module] of (course.modules ?? []).entries()) {
      for (const [lessonIndex, lesson] of (module.lessons ?? []).entries()) {
        if (!lesson?.slug || !lesson.title) continue;
        const base = {
          courseId: course._id,
          courseTitle: course.title,
          courseSlug: course.slug,
          moduleTitle: module.title,
          moduleNumber: moduleIndex + 1,
          lessonNumber: lessonIndex + 1,
          lessonTitle: lesson.title,
          lessonSlug: lesson.slug,
          imageUrl: poster(lesson),
          duration: Math.max(0, Math.floor(lesson.duration ?? 0)),
          keyPoints: lesson.keyPoints ?? [],
        };
        const titleScore = score(lesson.title, words, normalizedQuery);
        const notesScore = score(lesson.notesText ?? '', words, normalizedQuery);
        const moduleScore = score(`${module.title} ${module.summary ?? ''}`, words, normalizedQuery);
        const courseScore = score(`${course.title} ${course.summary ?? ''}`, words, normalizedQuery);
        const pointsScore = score((lesson.keyPoints ?? []).join(' '), words, normalizedQuery);
        if (titleScore || notesScore || pointsScore || moduleScore || courseScore) {
          const id = `lesson:${course._id}:${lesson._id}`;
          if (!seen.has(id)) {
            seen.add(id);
            results.push({
              ...base, id, kind: 'lesson', description: description(lesson, module.summary),
              startSeconds: null,
              score: titleScore * 10 + pointsScore * 4 + notesScore * 2 + moduleScore + courseScore * 0.5,
            });
          }
        }

        const id = youtubeId(lesson.videoUrl);
        if (!id) continue;
        for (const video of videoById.get(id) ?? []) {
          const moments = video.chapters?.length ? video.chapters.map((chapter) => ({ second: chapter.startSeconds, text: chapter.label, chapter: true }))
            : (video.chunks ?? []).map((chunk) => ({ second: chunk.startSeconds, text: chunk.text, chapter: false }));
          for (const moment of moments) {
            const second = Math.floor(moment.second);
            if (!Number.isSafeInteger(second) || second < 0 || second > base.duration) continue;
            const resultId = `video:${course._id}:${lesson._id}:${second}`;
            if (seen.has(resultId)) continue;
            seen.add(resultId);
            results.push({
              ...base, id: resultId, kind: 'video', startSeconds: second,
              description: moment.chapter ? `${moment.text}. ${description(lesson, module.summary)}`.slice(0, 210) : moment.text.slice(0, 210),
              score: (moment.chapter ? 30 : 17) + score(moment.text, words, normalizedQuery) * 5 + titleScore * 4,
            });
          }
        }
      }
    }
  }
  results.sort((a, b) => b.score - a.score || a.courseTitle.localeCompare(b.courseTitle) || a.lessonTitle.localeCompare(b.lessonTitle));
  return { query, total: results.length, courseCount: new Set(results.map((result) => result.courseId)).size, results };
}
