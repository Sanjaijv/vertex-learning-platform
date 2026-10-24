"use client";

import posthog from "posthog-js";
import { useEffect, useRef } from "react";

declare global {
  interface Window {
    YT?: {
      Player: new (element: HTMLIFrameElement, options: {
        events: {
          onReady: (event: { target: { getCurrentTime: () => number; getDuration: () => number } }) => void;
          onStateChange: (event: { data: number }) => void;
        };
      }) => { getCurrentTime: () => number; getDuration: () => number; destroy: () => void };
      PlayerState: { PLAYING: number; ENDED: number };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

const DEPTHS = [25, 50, 75, 100] as const;

export function LessonVideo({
  embedUrl,
  courseSlug,
  lessonSlug,
  startSeconds,
  durationSeconds,
}: {
  embedUrl: string | null;
  courseSlug: string | null;
  lessonSlug: string;
  startSeconds: number;
  durationSeconds: number;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerRef = useRef<{ getCurrentTime: () => number; getDuration: () => number; destroy: () => void } | null>(null);
  const maxWatchedRef = useRef(0);
  const trackedDepthsRef = useRef(new Set<number>());
  const playedRef = useRef(false);
  const resumedRef = useRef(false);

  useEffect(() => {
    if (!embedUrl || !iframeRef.current || !process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN || !process.env.NEXT_PUBLIC_POSTHOG_HOST) return;

    let interval: ReturnType<typeof setInterval> | undefined;
    let cancelled = false;
    const capture = (event: string, properties: Record<string, string | number | boolean | null>) => {
      posthog.capture(event, properties);
    };
    const observeProgress = () => {
      const player = playerRef.current;
      if (!player) return;
      const current = Math.max(0, player.getCurrentTime());
      const duration = Math.max(0, player.getDuration() || durationSeconds);
      if (!duration) return;
      maxWatchedRef.current = Math.max(maxWatchedRef.current, current);
      const depth = (maxWatchedRef.current / duration) * 100;
      for (const milestone of DEPTHS) {
        if (depth < milestone || trackedDepthsRef.current.has(milestone)) continue;
        trackedDepthsRef.current.add(milestone);
        capture("video_watch_depth_reached", {
          course_slug: courseSlug,
          lesson_slug: lessonSlug,
          depth_percent: milestone,
          watched_seconds: Math.floor(maxWatchedRef.current),
          duration_seconds: Math.floor(duration),
        });
        if (milestone === 100) {
          capture("lesson_completed", {
            course_slug: courseSlug,
            lesson_slug: lessonSlug,
            duration_seconds: Math.floor(duration),
          });
        }
      }
    };
    const createPlayer = () => {
      if (cancelled || !window.YT || !iframeRef.current) return;
      playerRef.current = new window.YT.Player(iframeRef.current, {
        events: {
          onReady: (event) => {
            if (startSeconds > 0 && !resumedRef.current) {
              resumedRef.current = true;
              capture("lesson_resume_used", { course_slug: courseSlug, lesson_slug: lessonSlug, resume_seconds: startSeconds });
            }
            interval = setInterval(observeProgress, 1000);
            event.target.getCurrentTime();
          },
          onStateChange: (event) => {
            if (event.data === window.YT?.PlayerState.PLAYING && !playedRef.current) {
              playedRef.current = true;
              capture("video_played", {
                course_slug: courseSlug,
                lesson_slug: lessonSlug,
                start_seconds: startSeconds,
                resume_used: startSeconds > 0,
              });
            }
            if (event.data === window.YT?.PlayerState.ENDED) observeProgress();
          },
        },
      });
    };

    if (window.YT) {
      createPlayer();
    } else {
      const previousReady = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        previousReady?.();
        createPlayer();
      };
      const script = document.querySelector<HTMLScriptElement>('script[src="https://www.youtube.com/iframe_api"]');
      if (!script) {
        const newScript = document.createElement("script");
        newScript.src = "https://www.youtube.com/iframe_api";
        newScript.async = true;
        document.head.appendChild(newScript);
      }
    }

    return () => {
      cancelled = true;
      if (interval) clearInterval(interval);
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, [courseSlug, durationSeconds, embedUrl, lessonSlug, startSeconds]);

  if (!embedUrl) return <div className="lesson-player-unavailable">Video playback is unavailable for this lesson.</div>;
  return <iframe
    ref={iframeRef}
    src={`${embedUrl}${embedUrl.includes("?") ? "&" : "?"}enablejsapi=1`}
    title={`${lessonSlug} video`}
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    referrerPolicy="strict-origin-when-cross-origin"
    allowFullScreen
  />;
}
