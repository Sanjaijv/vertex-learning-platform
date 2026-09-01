import { ArrowRight, BarChart3, Clock3, Folder, Search, Star } from "lucide-react";
import Link from "next/link";
import { SiteHeader } from "./components/SiteHeader";
import { MetaIcon } from "./components/ui";

const courses = [
  {
    slug: "nextjs-for-production",
    tile: <span className="course-tile course-tile-nextjs">N</span>,
    title: "Next.js for Production",
    description: "Build scalable, high-performance web applications with Next.js.",
    level: "Intermediate",
    duration: "18h 24m",
    modules: "12 modules",
  },
  {
    slug: "docker-essentials",
    tile: <span className="course-tile course-tile-docker" aria-hidden="true">🐳</span>,
    title: "Docker Essentials",
    description: "Containerize applications and streamline your development workflow.",
    level: "Beginner",
    duration: "10h 12m",
    modules: "8 modules",
  },
  {
    slug: "typescript-deep-dive",
    tile: <span className="course-tile course-tile-typescript">TS</span>,
    title: "TypeScript Deep Dive",
    description: "Go beyond the basics and write safer, more expressive code.",
    level: "Intermediate",
    duration: "14h 36m",
    modules: "10 modules",
  },
];

/**
 * Home page displaying hero section with search and featured courses
 */
export default function Home() {
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
          {courses.map((course) => <article className="sample-card home-course-card" key={course.slug}>
            {course.tile}
            <h3>{course.title}</h3>
            <p>{course.description}</p>
            <div className="card-meta">
              <MetaIcon icon={BarChart3}>{course.level}</MetaIcon>
              <MetaIcon icon={Clock3}>{course.duration}</MetaIcon>
              <MetaIcon icon={Folder}>{course.modules}</MetaIcon>
            </div>
          </article>)}
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
