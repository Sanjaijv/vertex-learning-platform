import { SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs";
import { Bell } from "lucide-react";
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
        <Show when="signed-out">
          <SignInButton mode="modal">
            <button type="button" className="btn btn-tertiary">Sign in</button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button type="button" className="btn btn-primary">Sign up</button>
          </SignUpButton>
        </Show>
        <Show when="signed-in">
          <UserButton />
        </Show>
      </div>
    </div>
  </header>;
}
