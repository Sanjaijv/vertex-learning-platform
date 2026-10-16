"use client";

import { Bookmark } from "lucide-react";
import { useState } from "react";

export function LessonBookmark() {
  const [saved, setSaved] = useState(false);
  return <button
    type="button"
    className="lesson-bookmark"
    aria-pressed={saved}
    aria-label={saved ? "Remove lesson bookmark" : "Bookmark lesson"}
    onClick={() => setSaved((value) => !value)}
  ><Bookmark aria-hidden="true" fill={saved ? "currentColor" : "none"} /></button>;
}
