import type { LucideIcon } from "lucide-react";

/**
 * Renders the Vertex brand logo with optional compact mode.
 * @param compact - If true, displays a smaller version of the brand name
 * @returns Vertex logo component with SVG mark and text
 */
export function VertexLogo({ compact = false }: { compact?: boolean }) {
  return <div className="brand" aria-label="Vertex">
    <svg className="brand-mark" viewBox="0 0 44 42" aria-hidden="true"><path d="M2 4h40L22 40 2 4Z" fill="currentColor" /><path d="M12 10h8l2 4 2-4h8L22 29 12 10Z" fill="white" /></svg>
    <span className={compact ? "brand-name brand-name-small" : "brand-name"}>Vertex</span>
  </div>;
}

/**
 * Renders a styled badge with different visual variants.
 * @param kind - Badge variant type (video, lesson, or popular)
 * @param children - Content to display inside the badge
 * @returns Badge component with appropriate styling
 */
export function Badge({ kind, children }: { kind: "video" | "lesson" | "popular"; children: React.ReactNode }) {
  return <span className={`badge badge-${kind}`}>{children}</span>;
}

/**
 * Renders an icon with accompanying text in a consistent meta information layout.
 * @param icon - Lucide icon component to display
 * @param children - Text or content to display next to the icon
 * @returns Meta item component with icon and text
 */
export function MetaIcon({ icon: Icon, children }: { icon: LucideIcon; children: React.ReactNode }) {
  return <span className="meta-item"><Icon aria-hidden="true" />{children}</span>;
}
