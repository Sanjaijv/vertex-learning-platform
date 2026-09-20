"use client";

import { Bookmark as BookmarkIcon } from "lucide-react";
import posthog from "posthog-js";
import { useState } from "react";

export function Bookmark({ courseSlug }: { courseSlug: string }) {
  const [bookmarked, setBookmarked] = useState(false);

  const handleClick = () => {
    const willBeBookmarked = !bookmarked;
    setBookmarked(willBeBookmarked);

    if (process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN && process.env.NEXT_PUBLIC_POSTHOG_HOST) {
      posthog.capture("course_bookmark_toggled", {
        course_slug: courseSlug,
        action: willBeBookmarked ? "added" : "removed",
      });
    }
  };

  return (
    <button
      type="button"
      className="btn btn-tertiary"
      aria-pressed={bookmarked}
      aria-label={bookmarked ? "Remove bookmark" : "Bookmark this course"}
      onClick={handleClick}
    >
      <BookmarkIcon fill={bookmarked ? "currentColor" : "none"} />
      Bookmark
    </button>
  );
}
