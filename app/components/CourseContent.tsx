"use client";

import { ChevronDown, Clock3, LockKeyhole, Play } from "lucide-react";
import Link from "next/link";
import posthog from "posthog-js";
import { useState } from "react";
import { formatDuration } from "../lib/format";

type ModuleLesson = {
  _id: string;
  title: string | null;
  slug: string | null;
  duration: number | null;
  freePreview: boolean | null;
};

type CourseModule = {
  title: string | null;
  summary: string | null;
  lessons: ModuleLesson[];
};

const VISIBLE_LIMIT = 6;

export function CourseContent({ courseSlug, modules }: { courseSlug: string; modules: CourseModule[] }) {
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [showAll, setShowAll] = useState(false);

  const visibleModules = showAll ? modules : modules.slice(0, VISIBLE_LIMIT);
  const hasMore = modules.length > VISIBLE_LIMIT;

  const handleModuleToggle = (index: number, isOpen: boolean, lessonCount: number) => {
    setExpanded((current) => ({ ...current, [index]: !isOpen }));

    if (process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN && process.env.NEXT_PUBLIC_POSTHOG_HOST) {
      posthog.capture("course_module_toggled", {
        course_slug: courseSlug,
        module_position: index + 1,
        lesson_count: lessonCount,
        action: isOpen ? "collapsed" : "expanded",
      });
    }
  };

  const handleModulesListToggle = () => {
    const willShowAll = !showAll;
    setShowAll(willShowAll);

    if (process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN && process.env.NEXT_PUBLIC_POSTHOG_HOST) {
      posthog.capture("course_modules_list_toggled", {
        course_slug: courseSlug,
        module_count: modules.length,
        action: willShowAll ? "shown" : "hidden",
      });
    }
  };

  return (
    <div className="course-content-list">
      {visibleModules.map((module, index) => {
        const isOpen = Boolean(expanded[index]);
        const moduleSeconds = module.lessons.reduce((total, lesson) => total + (lesson.duration ?? 0), 0);

        return (
          <div className="course-content-row" key={`${module.title}-${index}`}>
            <button
              type="button"
              className="course-content-row-head"
              aria-expanded={isOpen}
              onClick={() => handleModuleToggle(index, isOpen, module.lessons.length)}
            >
              <span className="course-content-number">{index + 1}</span>
              <span className="course-content-row-text">
                <strong>{module.title}</strong>
                <span>{module.summary}</span>
              </span>
              <span className="course-content-duration">
                <Clock3 aria-hidden="true" />
                {formatDuration(moduleSeconds)}
              </span>
              <ChevronDown className={isOpen ? "chevron-open" : undefined} aria-hidden="true" />
            </button>
            {isOpen && (
              <ul className="course-content-lessons">
                {module.lessons.map((lesson) => (
                  <li key={lesson._id}>
                    <Link href={`/lessons/${lesson.slug}`}>
                      {lesson.freePreview ? <Play aria-hidden="true" /> : <LockKeyhole aria-hidden="true" />}
                      <span>{lesson.title}</span>
                      <em>{formatDuration(lesson.duration ?? 0)}</em>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
      {hasMore && (
        <button type="button" className="btn btn-tertiary course-content-toggle" onClick={handleModulesListToggle}>
          {showAll ? "Show less" : `Show all ${modules.length} modules`}
          <ChevronDown className={showAll ? "chevron-open" : undefined} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
