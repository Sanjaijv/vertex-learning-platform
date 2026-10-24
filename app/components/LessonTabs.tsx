"use client";

import type { KeyboardEvent, ReactNode } from "react";
import { useState } from "react";
import posthog from "posthog-js";

export function LessonTabs({ content, notes, courseSlug, lessonSlug }: { content: ReactNode; notes: ReactNode; courseSlug: string | null; lessonSlug: string }) {
  const [active, setActive] = useState<"content" | "notes">("content");

  const selectTab = (next: "content" | "notes") => {
    setActive(next);
    if (next === "notes" && process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN && process.env.NEXT_PUBLIC_POSTHOG_HOST) {
      posthog.capture("lesson_notes_viewed", { course_slug: courseSlug, lesson_slug: lessonSlug });
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight" && event.key !== "Home" && event.key !== "End") return;
    event.preventDefault();
    const next = event.key === "ArrowLeft" || event.key === "Home" ? "content" : "notes";
    selectTab(next);
    document.getElementById(next === "content" ? "lesson-content-tab" : "lesson-notes-tab")?.focus();
  };

  return <section className="lesson-tabs-section" aria-label="Lesson details">
    <div className="lesson-tabs" role="tablist" aria-label="Lesson details">
      <button type="button" id="lesson-content-tab" role="tab" aria-selected={active === "content"} aria-controls="lesson-content-panel" tabIndex={active === "content" ? 0 : -1} onClick={() => selectTab("content")} onKeyDown={handleKeyDown}>Lesson Content</button>
      <button type="button" id="lesson-notes-tab" role="tab" aria-selected={active === "notes"} aria-controls="lesson-notes-panel" tabIndex={active === "notes" ? 0 : -1} onClick={() => selectTab("notes")} onKeyDown={handleKeyDown}>Notes</button>
    </div>
    <div id="lesson-content-panel" role="tabpanel" aria-labelledby="lesson-content-tab" hidden={active !== "content"}>{content}</div>
    <div id="lesson-notes-panel" role="tabpanel" aria-labelledby="lesson-notes-tab" hidden={active !== "notes"}>{notes}</div>
  </section>;
}
