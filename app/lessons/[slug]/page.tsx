import { PortableText, type PortableTextComponents } from "next-sanity";
import { ArrowLeft, ArrowRight, BarChart3, Check, Clock3, Download, ExternalLink, FileText, Lightbulb, Link2, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LessonBookmark } from "@/app/components/LessonBookmark";
import { LessonOutline, type OutlineModule } from "@/app/components/LessonOutline";
import { LessonTabs } from "@/app/components/LessonTabs";
import { LessonVideo } from "@/app/components/LessonVideo";
import { SiteHeader } from "@/app/components/SiteHeader";
import { MetaIcon } from "@/app/components/ui";
import { formatDuration } from "@/app/lib/format";
import { formatLevel } from "@/app/lib/level";
import { getYoutubeEmbedUrl, parseStartSeconds, safeExternalUrl } from "@/app/lib/lesson-video";
import { getCourseForLesson, getLessonBySlug } from "@/sanity/lib/data";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ start?: string | string[] }>;
};

const portableTextComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p>{children}</p>,
    h2: ({ children }) => <h2>{children}</h2>,
    h3: ({ children }) => <h3>{children}</h3>,
    h4: ({ children }) => <h4>{children}</h4>,
    blockquote: ({ children }) => <blockquote>{children}</blockquote>,
  },
  list: {
    bullet: ({ children }) => <ul>{children}</ul>,
    number: ({ children }) => <ol>{children}</ol>,
  },
  marks: {
    link: ({ children, value }) => {
      const href = safeExternalUrl(value?.href);
      return href ? <a href={href} target="_blank" rel="noopener noreferrer">{children}</a> : <>{children}</>;
    },
  },
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const lesson = await getLessonBySlug(slug);
  return lesson ? { title: `${lesson.title} — Vertex` } : {};
}

export default async function LessonPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const lesson = await getLessonBySlug(slug);
  if (!lesson) notFound();
  const course = await getCourseForLesson(lesson._id);
  if (!course) notFound();

  const modules: OutlineModule[] = (course.modules ?? []).map((module) => ({
    title: module.title,
    lessons: (module.lessons ?? []).filter((entry): entry is NonNullable<typeof entry> => Boolean(entry)),
  }));
  const orderedLessons = modules.flatMap((module) => module.lessons);
  const currentIndex = orderedLessons.findIndex((entry) => entry._id === lesson._id);
  const moduleIndex = modules.findIndex((module) => module.lessons.some((entry) => entry._id === lesson._id));
  if (currentIndex < 0 || moduleIndex < 0) notFound();
  const lessonIndex = modules[moduleIndex].lessons.findIndex((entry) => entry._id === lesson._id);
  const previous = orderedLessons[currentIndex - 1];
  const next = orderedLessons[currentIndex + 1];
  const startSeconds = parseStartSeconds((await searchParams).start, lesson.duration);
  const embedUrl = getYoutubeEmbedUrl(lesson.videoUrl, startSeconds);
  const notes = lesson.notes ?? [];
  const overview = lesson.notes?.find((block) => block.style === "normal" && !block.listItem)?.children
    ?.map((span) => span.text ?? "").join("");
  const resources = (lesson.resources ?? []).map((resource) => ({ ...resource, href: safeExternalUrl(resource.url) })).filter((resource) => resource.href);

  const content = <div className="lesson-detail-body">
    <section className="lesson-overview" aria-labelledby="lesson-overview-heading">
      <h2 id="lesson-overview-heading">Overview</h2>
      <p>{overview || lesson.title}</p>
    </section>
    {Boolean(lesson.keyPoints?.length) && <section className="lesson-key-points" aria-labelledby="lesson-key-points-heading">
      <h2 id="lesson-key-points-heading">In this lesson you will:</h2>
      <ul>{lesson.keyPoints?.map((point, index) => <li key={`${point}-${index}`}><Check aria-hidden="true" />{point}</li>)}</ul>
    </section>}
    {lesson.proTip && <aside className="lesson-pro-tip"><Lightbulb aria-hidden="true" /><div><h2>Pro Tip</h2><p>{lesson.proTip}</p></div></aside>}
    {resources.length > 0 && <section className="lesson-resources" aria-labelledby="lesson-resources-heading">
      <h2 id="lesson-resources-heading">Resources</h2>
      <div className="lesson-resource-grid">{resources.map((resource, index) => {
        const Icon = resource.type === "pdf" ? FileText : resource.type === "download" ? Download : Link2;
        return <a href={resource.href!} target="_blank" rel="noopener noreferrer" className="lesson-resource-card" key={`${resource.title}-${index}`}>
          <span className="lesson-resource-icon"><Icon aria-hidden="true" /></span>
          <span><strong>{resource.title}</strong><small>{resource.description}</small></span>
          <ExternalLink className="lesson-resource-external" aria-hidden="true" />
        </a>;
      })}</div>
    </section>}
  </div>;

  const notesContent = <div className="lesson-notes-content">
    {notes.length ? <PortableText value={notes} components={portableTextComponents} /> : <p>No notes are available for this lesson yet.</p>}
  </div>;

  return <>
    <SiteHeader />
    <div className="lesson-frame">
      <div className="lesson-layout">
        <LessonOutline courseTitle={course.title} courseSlug={course.slug} modules={modules} currentLessonId={lesson._id} currentModuleIndex={moduleIndex} />
        <main className="lesson-main">
          <nav className="lesson-breadcrumbs" aria-label="Breadcrumb">
            <Link href="/courses">All Courses</Link><span aria-hidden="true">›</span>
            {course.slug && <><Link href={`/courses/${course.slug}`}>{course.title}</Link><span aria-hidden="true">›</span></>}
            <span>{modules[moduleIndex].title}</span><span aria-hidden="true">›</span><span aria-current="page">{lesson.title}</span>
          </nav>
          <div className="lesson-heading-row">
            <div>
              <span className="lesson-eyebrow">LESSON {moduleIndex + 1}.{lessonIndex + 1}</span>
              <h1>{lesson.title}</h1>
              {overview && <p className="lesson-summary">{overview}</p>}
            </div>
            <LessonBookmark />
          </div>
          <div className="lesson-meta">
            <MetaIcon icon={Clock3}>{formatDuration(lesson.duration ?? 0)}</MetaIcon>
            {course.level && <MetaIcon icon={BarChart3}>{formatLevel(course.level)}</MetaIcon>}
            <MetaIcon icon={Users}>{(lesson.studentCount ?? 0).toLocaleString("en-US")} students</MetaIcon>
          </div>
          <div className="lesson-player">
            <LessonVideo
              embedUrl={embedUrl}
              courseSlug={course.slug}
              lessonSlug={lesson.slug ?? slug}
              startSeconds={startSeconds}
              durationSeconds={lesson.duration ?? 0}
            />
          </div>
          <LessonTabs content={content} notes={notesContent} courseSlug={course.slug} lessonSlug={lesson.slug ?? slug} />
        </main>
      </div>
      <nav className="lesson-footer" aria-label="Lesson navigation">
        {previous?.slug ? <a href={`/lessons/${previous.slug}`} className="lesson-footer-previous"><span className="lesson-footer-button"><ArrowLeft aria-hidden="true" />Previous Lesson</span><span className="lesson-footer-label">{previous.title}<small>{formatDuration(previous.duration ?? 0)}</small></span></a> : <span />}
        {next?.slug ? <a href={`/lessons/${next.slug}`} className="lesson-footer-next"><span className="lesson-footer-label">{next.title}<small>{formatDuration(next.duration ?? 0)}</small></span><span className="lesson-footer-button">Next Lesson<ArrowRight aria-hidden="true" /></span></a> : <span />}
      </nav>
    </div>
  </>;
}
