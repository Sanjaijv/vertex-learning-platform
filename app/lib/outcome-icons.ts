import { Code, Gauge, Layers, Puzzle, Rocket, Shield, Sparkles, Workflow } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const OUTCOME_ICONS: Record<string, LucideIcon> = {
  code: Code,
  gauge: Gauge,
  layers: Layers,
  puzzle: Puzzle,
  rocket: Rocket,
  shield: Shield,
  sparkles: Sparkles,
  workflow: Workflow,
};

export function getOutcomeIcon(name: string | null): LucideIcon {
  return (name && OUTCOME_ICONS[name]) || Sparkles;
}
