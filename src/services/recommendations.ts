/**
 * Rule-based parent recommendations.
 * Swappable later for an AI engine behind a secure backend — the interface
 * (ProgressState in, Recommendation[] out) stays the same.
 */

import type { ProgressState, SkillKey } from "./progress";

export type Recommendation = { id: string; tone: "good" | "try"; text: string };

const LABEL: Record<SkillKey, string> = {
  colors: "colors",
  shapes: "shapes",
  letters: "letter recognition",
  numbers: "counting",
  memory: "memory",
  puzzle: "puzzles",
  drawing: "drawing",
};

export function getRecommendations(s: ProgressState): Recommendation[] {
  const out: Recommendation[] = [];
  const keys = Object.keys(s.skills) as SkillKey[];

  for (const k of keys) {
    const { attempts, correct } = s.skills[k];
    if (attempts >= 4) {
      const rate = correct / attempts;
      if (rate >= 0.8) out.push({ id: `good-${k}`, tone: "good", text: `Your child is doing well with ${LABEL[k]}.` });
      else if (rate < 0.55) out.push({ id: `try-${k}`, tone: "try", text: `Try 5 minutes of ${LABEL[k]} practice today.` });
    }
  }

  const untouched = keys.filter((k) => s.skills[k].attempts === 0 && s.skills[k].completed === 0);
  if (untouched.length) {
    out.push({ id: `new-${untouched[0]}`, tone: "try", text: `Not tried yet: ${LABEL[untouched[0]]}. It's a nice next step.` });
  }

  if (s.streak >= 3) out.push({ id: "streak", tone: "good", text: `${s.streak} days in a row — lovely routine!` });
  if (s.dailyPath.done.length < 5)
    out.push({ id: "path", tone: "try", text: "Finish Today's Adventure together for a bonus badge." });

  return out.slice(0, 5);
}

export function strengths(s: ProgressState): string[] {
  return (Object.keys(s.skills) as SkillKey[])
    .filter((k) => s.skills[k].attempts >= 3 && s.skills[k].correct / s.skills[k].attempts >= 0.75)
    .map((k) => LABEL[k]);
}

export function needsPractice(s: ProgressState): string[] {
  return (Object.keys(s.skills) as SkillKey[])
    .filter((k) => s.skills[k].attempts >= 3 && s.skills[k].correct / s.skills[k].attempts < 0.6)
    .map((k) => LABEL[k]);
}
