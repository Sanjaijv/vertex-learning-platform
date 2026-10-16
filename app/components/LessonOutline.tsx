"use client";

import { ChevronDown, Play } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { formatDuration } from "../lib/format";

export type OutlineModule = {
  title: string | null;
  lessons: { _id: string; title: string | null; slug: string | null; duration: number | null }[];
};

export function LessonOutline({
  courseTitle,
  courseSlug,
  modules,
  currentLessonId,
  currentModuleIndex,
}: {
  courseTitle: string | null;
  courseSlug: string | null;
  modules: OutlineModule[];
  currentLessonId: string;
  currentModuleIndex: number;
}) {
  const [openModule, setOpenModule] = useState<number | null>(currentModuleIndex);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <aside className={`lesson-sidebar${mobileOpen ? " lesson-sidebar-open" : ""}`} aria-label="Course outline">
      <button
        type="button"
        className="lesson-sidebar-mobile-toggle"
        aria-expanded={mobileOpen}
        aria-controls="lesson-sidebar-content"
        onClick={() => setMobileOpen((open) => !open)}
      >
        Course outline <ChevronDown aria-hidden="true" />
      </button>
      <div id="lesson-sidebar-content" className="lesson-sidebar-content">
        {courseSlug && <Link className="lesson-back" href={`/courses/${courseSlug}`}><span aria-hidden="true">←</span> Back to course</Link>}
        <div className="lesson-sidebar-course">
          <span className="lesson-course-mark" aria-hidden="true">{courseTitle?.slice(0, 1) || "V"}</span>
          <div><strong>{courseTitle}</strong><span>{modules.length} modules</span></div>
        </div>
        <div className="lesson-outline-modules">
          {modules.map((module, moduleIndex) => {
            const isOpen = openModule === moduleIndex;
            const isCurrent = moduleIndex === currentModuleIndex;
            return (
              <section className={`lesson-outline-module${isCurrent ? " is-current" : ""}`} key={`${module.title}-${moduleIndex}`}>
                <button
                  type="button"
                  className="lesson-outline-module-button"
                  aria-expanded={isOpen}
                  aria-controls={`lesson-module-${moduleIndex}`}
                  onClick={() => setOpenModule(isOpen ? null : moduleIndex)}
                >
                  <span className="lesson-outline-number">{moduleIndex + 1}</span>
                  <span className="lesson-outline-module-label"><strong>{module.title}</strong><small>{formatDuration(module.lessons.reduce((sum, lesson) => sum + (lesson.duration ?? 0), 0))}</small></span>
                  <ChevronDown aria-hidden="true" className={isOpen ? "is-open" : ""} />
                </button>
                {isOpen && (
                  <ol id={`lesson-module-${moduleIndex}`} className="lesson-outline-lessons">
                    {module.lessons.map((lesson) => {
                      const current = lesson._id === currentLessonId;
                      return <li key={lesson._id} className={current ? "is-current" : ""}>
                        {lesson.slug ? <Link href={`/lessons/${lesson.slug}`} aria-current={current ? "page" : undefined}>
                          <span className="lesson-outline-node" aria-hidden="true">{current ? <Play fill="currentColor" /> : null}</span>
                          <span><strong>{lesson.title}</strong><small>{current ? "Now playing" : formatDuration(lesson.duration ?? 0)}</small></span>
                        </Link> : <span className="lesson-outline-unlinked"><span className="lesson-outline-node" /><span>{lesson.title}</span></span>}
                      </li>;
                    })}
                  </ol>
                )}
              </section>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
