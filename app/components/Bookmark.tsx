"use client";

import { Bookmark as BookmarkIcon } from "lucide-react";
import { useState } from "react";

export function Bookmark() {
  const [bookmarked, setBookmarked] = useState(false);

  return (
    <button
      type="button"
      className="btn btn-tertiary"
      aria-pressed={bookmarked}
      aria-label={bookmarked ? "Remove bookmark" : "Bookmark this course"}
      onClick={() => setBookmarked((value) => !value)}
    >
      <BookmarkIcon fill={bookmarked ? "currentColor" : "none"} />
      Bookmark
    </button>
  );
}
