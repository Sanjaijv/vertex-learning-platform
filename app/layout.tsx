import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const playfairDisplay = Playfair_Display({ variable: "--font-playfair", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Vertex Design System",
  description: "The design language for the Vertex learning platform.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return <html lang="en" className={`${inter.variable} ${playfairDisplay.variable}`}><body>{children}</body></html>;
}
