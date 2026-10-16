'use client';

import { ArrowRight, ChevronDown, ChevronRight, CirclePlay, FileText, Folder, Search } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import posthog from 'posthog-js';
import { useEffect, useMemo, useState } from 'react';

import type { SearchResponse, SearchResult } from '@/app/lib/search-types';

type Sort = 'relevant' | 'course' | 'title';

function time(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  return `${String(minutes).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

function resultLink(result: SearchResult) {
  const path = `/lessons/${encodeURIComponent(result.lessonSlug)}`;
  return result.kind === 'video' ? `${path}?start=${result.startSeconds ?? 0}` : path;
}

function ResultCard({ result }: { result: SearchResult }) {
  const isVideo = result.kind === 'video';
  return <article className={`search-card search-card-${result.kind}`}>
    <div className={`search-card-image ${!isVideo ? 'search-card-points' : ''}`}>
      {isVideo ? <>
        {result.imageUrl ? <Image src={result.imageUrl} alt="" width={320} height={180} /> : <span className="search-image-fallback"><CirclePlay aria-hidden="true" /></span>}
        <CirclePlay className="search-image-play" aria-hidden="true" />
        <span className="search-image-time">{time(result.duration)}</span>
      </> : <>
        <FileText aria-hidden="true" />
        <ul>{result.keyPoints.slice(0, 3).map((point, index) => <li key={`${point}-${index}`}>{point}</li>)}</ul>
      </>}
    </div>
    <div className="search-card-content">
      <div className="search-card-course"><span className="search-course-icon" aria-hidden="true">{result.courseTitle.slice(0, 1)}</span>{result.courseTitle}</div>
      <h2>{result.lessonTitle}</h2>
      <p>{result.description}</p>
      <div className="search-card-meta"><FileText aria-hidden="true" />Lesson {result.moduleNumber}.{result.lessonNumber}<span>·</span><Folder aria-hidden="true" />{result.moduleTitle}</div>
    </div>
    <div className="search-card-side">
      <span className={`search-kind search-kind-${result.kind}`}>{isVideo ? 'VIDEO' : 'LESSON'}</span>
      <Link href={resultLink(result)} className="search-result-action">
        {isVideo ? <><CirclePlay aria-hidden="true" />Watch from {time(result.startSeconds ?? 0)}</> : 'View lesson'}
        <ChevronRight aria-hidden="true" />
      </Link>
    </div>
  </article>;
}

export function SearchResults({ query }: { query: string }) {
  const [response, setResponse] = useState<SearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(Boolean(query));
  const [sort, setSort] = useState<Sort>('relevant');

  useEffect(() => {
    if (!query) return;
    const controller = new AbortController();
    fetch('/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
      signal: controller.signal,
    }).then(async (result) => {
      const data = await result.json();
      if (!result.ok) throw new Error(data.error || 'Search is unavailable right now.');
      return data as SearchResponse;
    }).then((data) => {
      setResponse(data);
      setError(null);
      setLoading(false);
      posthog.capture('search_performed', { query, result_count: data.total, course_count: data.courseCount });
    }).catch((cause) => {
      if (controller.signal.aborted) return;
      setError(cause instanceof Error ? cause.message : 'Search is unavailable right now.');
      setLoading(false);
    });
    return () => controller.abort();
  }, [query]);

  const sorted = useMemo(() => {
    const items = [...(response?.results ?? [])];
    if (sort === 'course') items.sort((a, b) => a.courseTitle.localeCompare(b.courseTitle) || b.score - a.score);
    if (sort === 'title') items.sort((a, b) => a.lessonTitle.localeCompare(b.lessonTitle) || b.score - a.score);
    return items;
  }, [response, sort]);

  return <main className="search-page">
    <div className="search-heading">
      <span className="search-eyebrow">SEARCH RESULTS</span>
      <h1>{query ? <>Results for <em>“{query}”</em></> : 'Search your learning'}</h1>
      <p aria-live="polite">{loading ? 'Searching courses and lessons…' : response ? `Found ${response.total} results across ${response.courseCount} courses` : 'Find the lesson or video moment you need.'}</p>
    </div>
    <form action="/search" role="search" className="search-page-form">
      <Search aria-hidden="true" />
      <label className="sr-only" htmlFor="search-page-input">Search courses and lessons</label>
      <input id="search-page-input" name="q" type="search" defaultValue={query} minLength={2} maxLength={160} placeholder="Search courses and lessons" required />
      <button type="submit" aria-label="Search"><span>Search</span><ArrowRight aria-hidden="true" /></button>
    </form>

    {response?.total ? <div className="search-toolbar">
      <strong>{response.total} results</strong>
      <label className="search-sort"><span className="sr-only">Sort results</span>
        <select value={sort} onChange={(event) => setSort(event.target.value as Sort)}>
          <option value="relevant">Most Relevant</option>
          <option value="course">Course A–Z</option>
          <option value="title">Lesson A–Z</option>
        </select><ChevronDown aria-hidden="true" />
      </label>
    </div> : null}

    {loading ? <div className="search-status" role="status">Searching for relevant lessons and video moments…</div> : null}
    {error ? <div className="search-status search-status-error" role="alert"><h2>Search could not load</h2><p>{error}</p><button type="button" onClick={() => window.location.reload()}>Try again</button></div> : null}
    {!loading && !error && response?.total === 0 ? <div className="search-status"><h2>No results found</h2><p>Try different keywords or browse the full catalog.</p><Link href="/courses">Browse all courses <ArrowRight aria-hidden="true" /></Link></div> : null}
    {sorted.length ? <div className="search-results-list">{sorted.map((result) => <ResultCard result={result} key={result.id} />)}</div> : null}
    <div className="search-catalog-callout">
      <span className="search-callout-icon"><Search aria-hidden="true" /></span>
      <div><strong>Can’t find what you’re looking for?</strong><p>Try different keywords or browse our full course catalog.</p></div>
      <Link href="/courses">Browse all courses <ArrowRight aria-hidden="true" /></Link>
    </div>
  </main>;
}
