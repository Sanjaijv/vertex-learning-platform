import type { LucideIcon } from "lucide-react";

/**
 * Vertex brand logo component with optional compact mode
 * @param compact - Whether to render the compact version of the logo
 */
export function VertexLogo({ compact = false }: { compact?: boolean }) {
  return <div className="brand" aria-label="Vertex">
    <svg className="brand-mark" viewBox="0 0 44 42" aria-hidden="true"><path d="M2 4h40L22 40 2 4Z" fill="currentColor" /><path d="M12 10h8l2 4 2-4h8L22 29 12 10Z" fill="white" /></svg>
    <span className={compact ? "brand-name brand-name-small" : "brand-name"}>Vertex</span>
  </div>;
}

/**
 * Badge component for labeling content types
 * @param kind - Badge variant (video, lesson, or popular)
 * @param children - Badge content
 */
export function Badge({ kind, children }: { kind: "video" | "lesson" | "popular"; children: React.ReactNode }) {
  return <span className={`badge badge-${kind}`}>{children}</span>;
}

/**
 * Icon-text pair component for displaying metadata
 * @param icon - Lucide icon component
 * @param children - Text content to display alongside icon
 */
export function MetaIcon({ icon: Icon, children }: { icon: LucideIcon; children: React.ReactNode }) {
  return <span className="meta-item"><Icon aria-hidden="true" />{children}</span>;
}
