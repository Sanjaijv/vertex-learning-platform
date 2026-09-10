import { BarChart3, Clock3, Folder } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/app/components/SiteHeader";
import { Badge, MetaIcon } from "@/app/components/ui";
import { formatDuration } from "@/app/lib/format";
import { formatLevel } from "@/app/lib/level";
import { getCourses } from "@/sanity/lib/data";
import { urlFor } from "@/sanity/lib/image";

export const metadata: Metadata = {
  title: "All Courses — Vertex",
  description: "Browse every course available on Vertex.",
};

export default async function CoursesPage() {
  const courses = await getCourses();

  return (
    <>
      <SiteHeader />
      <main className="catalog-page">
        <header className="catalog-header">
          <div>
            <p className="catalog-eyebrow">THE VERTEX LIBRARY</p>
            <h1>All Courses</h1>
            <p className="catalog-intro">Build practical skills with focused courses from experienced instructors.</p>
          </div>
          <span className="catalog-count">{courses.length} courses</span>
        </header>

        {courses.length > 0 ? (
          <div className="catalog-grid">
            {courses.map((course) => {
              const level = formatLevel(course.level);
              return (
                <Link href={`/courses/${course.slug}`} className="catalog-card" key={course._id}>
                  <div className="catalog-card-image">
                    {course.coverImage ? (
                      <Image
                        src={urlFor(course.coverImage).width(720).height(420).url()}
                        alt={course.title ?? ""}
                        fill
                        sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw"
                      />
                    ) : null}
                  </div>
                  <div className="catalog-card-body">
                    <div className="catalog-card-topline">
                      {course.popular ? <Badge kind="popular">POPULAR</Badge> : null}
                      {course.category?.title ? <span>{course.category.title}</span> : null}
                    </div>
                    <h2>{course.title}</h2>
                    <p>{course.summary}</p>
                    <div className="card-meta catalog-card-meta">
                      {level ? <MetaIcon icon={BarChart3}>{level}</MetaIcon> : null}
                      <MetaIcon icon={Clock3}>{formatDuration(course.totalSeconds ?? 0)}</MetaIcon>
                      <MetaIcon icon={Folder}>{course.moduleCount ?? 0} modules</MetaIcon>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="catalog-empty panel">
            <h2>No courses yet</h2>
            <p>New learning is on the way. Check back soon.</p>
          </div>
        )}
      </main>
    </>
  );
}