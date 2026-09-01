import { clerkMiddleware } from "@clerk/nextjs/server";

/**
 * Clerk authentication middleware for Next.js
 * Handles authentication state across all routes
 */
export default clerkMiddleware();

/**
 * Middleware configuration specifying which routes to apply Clerk authentication to
 */
export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
};
