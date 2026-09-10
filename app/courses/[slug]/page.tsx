import { ArrowRight, BarChart3, Clock3, Folder, Users } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Bookmark } from "@/app/components/Bookmark";
import { CourseContent } from "@/app/components/CourseContent";
import { SiteHeader } from "@/app/components/SiteHeader";
import { Badge, MetaIcon } from "@/app/components/ui";
import { formatDuration, formatStudentCount } from "@/app/lib/format";
import { formatLevel } from "@/app/lib/level";
import { getOutcomeIcon } from "@/app/lib/outcome-icons";
import { getCourseBySlug, getCourseSlugs } from "@/sanity/lib/data";
import { urlFor } from "@/sanity/lib/image";

export async function generateStaticParams() {
  const slugs = await getCourseSlugs();
  return slugs.filter((slug): slug is string => Boolean(slug)).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) return {};
  return { title: `${course.title} — Vertex`, description: course.summary ?? undefined };
}

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) notFound();

  const modules = (course.modules ?? []).map((module) => ({
    title: module.title,
    summary: module.summary,
    lessons: (module.lessons ?? []).filter((lesson): lesson is NonNullable<typeof lesson> => Boolean(lesson)),
  }));

  const totalSeconds = modules.reduce(
    (total, module) => total + module.lessons.reduce((sum, lesson) => sum + (lesson.duration ?? 0), 0),
    0,
  );
  const firstLessonSlug = modules[0]?.lessons[0]?.slug;
  const outcomes = course.learningOutcomes ?? [];

  return (
    <>
      <SiteHeader />
      <main className="course-page">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href="/courses">All Courses</Link>
          <span aria-hidden="true">&gt;</span>
          <span>{course.title}</span>
        </nav>

        <section className="course-hero" aria-labelledby="course-title">
          <div className="course-hero-image">
            {course.coverImage ? (
              <Image
                src={urlFor(course.coverImage).width(700).height(700).url()}
                alt={course.title ?? ""}
                width={700}
                height={700}
              />
            ) : null}
          </div>
          <div className="course-hero-body">
            {course.popular ? <Badge kind="popular">POPULAR</Badge> : null}
            <h1 id="course-title">{course.title}</h1>
            <p className="course-summary">{course.summary}</p>
            <div className="card-meta course-hero-meta">
              <MetaIcon icon={BarChart3}>{formatLevel(course.level)}</MetaIcon>
              <MetaIcon icon={Clock3}>{formatDuration(totalSeconds)}</MetaIcon>
              <MetaIcon icon={Folder}>{modules.length} modules</MetaIcon>
              <MetaIcon icon={Users}>{formatStudentCount(course.studentCount ?? 0)} students</MetaIcon>
            </div>
            <div className="course-hero-actions">
              <Link
                href={firstLessonSlug ? `/lessons/${firstLessonSlug}` : "#"}
                className="btn btn-primary"
              >
                Start Course <ArrowRight />
              </Link>
              <Bookmark />
            </div>
          </div>
        </section>

        <section className="panel outcomes-panel" aria-labelledby="outcomes-title">
          <h2 id="outcomes-title">What you&apos;ll learn</h2>
          <div className="outcomes-grid">
            {outcomes.map((outcome, index) => {
              const Icon = getOutcomeIcon(outcome.icon);
              return (
                <div className="outcome-card" key={index}>
                  <span className="outcome-icon">
                    <Icon aria-hidden="true" />
                  </span>
                  <div>
                    <h3>{outcome.title}</h3>
                    <p>{outcome.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="panel course-content-panel" aria-labelledby="course-content-title">
          <div className="course-content-head">
            <h2 id="course-content-title">Course Content</h2>
            <span>
              {modules.length} modules &bull; {formatDuration(totalSeconds)}
            </span>
          </div>
          <CourseContent modules={modules} />
        </section>
      </main>
    </>
  );
}
