import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const playfairDisplay = Playfair_Display({ variable: "--font-playfair", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Vertex",
  description: "Search your learning in plain English.",
};

/**
 * Root layout component that wraps all pages with fonts and authentication provider.
 * @param children - Page content to render
 * @returns HTML document structure with Clerk provider and custom fonts
 */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return <html lang="en" className={`${inter.variable} ${playfairDisplay.variable}`}><body><ClerkProvider>{children}</ClerkProvider></body></html>;
}