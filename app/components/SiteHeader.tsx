import { Bell, UserRound } from "lucide-react";
import Link from "next/link";
import { VertexLogo } from "./ui";

export function SiteHeader() {
  return <header className="site-header">
    <div className="site-header-inner">
      <Link href="/" aria-label="Vertex home"><VertexLogo compact /></Link>
      <nav className="site-nav" aria-label="Main">
        <Link href="/courses">Courses</Link>
        <Link href="/my-learning">My Learning</Link>
      </nav>
      <div className="site-header-actions">
        <button type="button" className="icon-button" aria-label="Notifications"><Bell /></button>
        <span className="avatar" aria-label="Account" role="img"><UserRound /></span>
      </div>
    </div>
  </header>;
}
