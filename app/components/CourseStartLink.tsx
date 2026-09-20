"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import posthog from "posthog-js";

export function CourseStartLink({ courseSlug, href }: { courseSlug: string; href: string }) {
  const handleClick = () => {
    if (process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN && process.env.NEXT_PUBLIC_POSTHOG_HOST) {
      posthog.capture("course_started", {
        course_slug: courseSlug,
        has_available_lesson: href !== "#",
      });
    }
  };

  return (
    <Link href={href} className="btn btn-primary" onClick={handleClick}>
      Start Course <ArrowRight />
    </Link>
  );
}
