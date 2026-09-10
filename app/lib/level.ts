const LEVEL_LABEL: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export function formatLevel(level: string | null): string | null {
  return level ? (LEVEL_LABEL[level] ?? level) : null;
}
