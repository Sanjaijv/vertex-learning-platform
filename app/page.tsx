import { ArrowRight, BarChart3, Clock3, Folder, Search, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "./components/SiteHeader";
import { MetaIcon } from "./components/ui";
import { formatDuration } from "./lib/format";
import { formatLevel } from "./lib/level";
import { getCourses } from "@/sanity/lib/data";
import { urlFor } from "@/sanity/lib/image";

export default async function Home() {
  const courses = (await getCourses()).slice(0, 3);

  return <>
    <SiteHeader />
    <main className="home-page">
      <section className="hero" aria-labelledby="hero-title">
        <span className="hero-pill">INTELLIGENT LEARNING</span>
        <h1 id="hero-title" className="hero-title">Search your learning<br />in plain English.</h1>
        <p className="hero-subhead">Vertex understands what you want to learn and finds the exact lessons across all your courses.</p>
        <Link href="/courses" className="btn btn-primary hero-cta">Explore Courses <ArrowRight /></Link>
        <form className="hero-search" role="search" action="/search">
          <label className="sr-only" htmlFor="hero-search-input">Ask anything about your learning</label>
          <Search aria-hidden="true" />
          <input id="hero-search-input" name="q" type="search" placeholder="Ask anything about your learning..." />
          <kbd>⌘ K</kbd>
        </form>
      </section>

      <section className="courses-section" aria-labelledby="courses-title">
        <div className="courses-section-head">
          <h2 id="courses-title">All Courses</h2>
          <Link href="/courses" className="btn btn-text">View all courses <ArrowRight /></Link>
        </div>
        <div className="home-cards-grid">
          {courses.map((course) => <Link href={`/courses/${course.slug}`} className="sample-card home-course-card" key={course._id}>
            {course.coverImage ? (
              <Image
                className="home-course-thumb"
                src={urlFor(course.coverImage).width(112).height(112).url()}
                alt=""
                width={56}
                height={56}
              />
            ) : null}
            <h3>{course.title}</h3>
            <p>{course.summary}</p>
            <div className="card-meta">
              <MetaIcon icon={BarChart3}>{formatLevel(course.level)}</MetaIcon>
              <MetaIcon icon={Clock3}>{formatDuration(course.totalSeconds ?? 0)}</MetaIcon>
              <MetaIcon icon={Folder}>{course.moduleCount ?? 0} modules</MetaIcon>
            </div>
          </Link>)}
        </div>
      </section>

      <section className="home-banner" aria-label="New content notice">
        <div className="home-banner-text">
          <Star aria-hidden="true" />
          <p>New courses and lessons added every week.</p>
        </div>
        <div className="home-banner-bars" aria-hidden="true">
          {[62, 38, 78, 48, 30, 70, 42, 58, 90, 36, 66, 50].map((height, index) => (
            <span key={index} style={{ height: `${height}%` }} />
          ))}
        </div>
      </section>
    </main>
  </>;
}
