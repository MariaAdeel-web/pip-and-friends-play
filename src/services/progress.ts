/**
 * Offline-first progress service.
 * All child data lives in localStorage — no personal data leaves the device.
 * The shape mirrors a future database model (child / progress / rewards).
 */

import { useCallback, useEffect, useState } from "react";

export type AgeBand = "little" | "smart" | "super";

export type ChildProfile = {
  name: string;
  age: number;
  avatar: string;
  band: AgeBand;
};

export type SkillKey = "colors" | "shapes" | "letters" | "numbers" | "memory" | "puzzle" | "drawing";

export type ProgressState = {
  child: ChildProfile | null;
  xp: number;
  stars: number;
  gems: number;
  badges: string[];
  stickers: string[];
  streak: number;
  lastPlayedDate: string | null;
  minutes: number;
  activityCount: number;
  skills: Record<SkillKey, { correct: number; attempts: number; completed: number }>;
  learned: { colors: string[]; letters: string[]; numbers: number[]; shapes: string[] };
  dailyPath: { date: string; done: number[] };
  worldsUnlocked: number;
};

const KEY = "tinytales.progress.v1";

const emptySkill = () => ({ correct: 0, attempts: 0, completed: 0 });

export const DEFAULT_STATE: ProgressState = {
  child: null,
  xp: 0,
  stars: 0,
  gems: 0,
  badges: [],
  stickers: [],
  streak: 0,
  lastPlayedDate: null,
  minutes: 0,
  activityCount: 0,
  skills: {
    colors: emptySkill(),
    shapes: emptySkill(),
    letters: emptySkill(),
    numbers: emptySkill(),
    memory: emptySkill(),
    puzzle: emptySkill(),
    drawing: emptySkill(),
  },
  learned: { colors: [], letters: [], numbers: [], shapes: [] },
  dailyPath: { date: "", done: [] },
  worldsUnlocked: 1,
};

export const todayKey = () => new Date().toISOString().slice(0, 10);

function read(): ProgressState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<ProgressState>;
    return {
      ...DEFAULT_STATE,
      ...parsed,
      skills: { ...DEFAULT_STATE.skills, ...(parsed.skills ?? {}) },
      learned: { ...DEFAULT_STATE.learned, ...(parsed.learned ?? {}) },
      dailyPath: parsed.dailyPath ?? DEFAULT_STATE.dailyPath,
    };
  } catch {
    return DEFAULT_STATE;
  }
}

function write(state: ProgressState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(state));
  window.dispatchEvent(new Event("tinytales:progress"));
}

export function update(fn: (s: ProgressState) => ProgressState) {
  write(fn(read()));
}

export function bandForAge(age: number): AgeBand {
  if (age <= 3) return "little";
  if (age === 4) return "smart";
  return "super";
}

export function setChild(child: ChildProfile) {
  update((s) => ({ ...s, child }));
}

export function resetAll() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("tinytales:progress"));
}

const uniq = <T,>(arr: T[]) => Array.from(new Set(arr));

export const BADGES: { id: string; label: string; emoji: string; test: (s: ProgressState) => boolean }[] = [
  { id: "first-star", label: "First Star", emoji: "⭐", test: (s) => s.stars >= 1 },
  { id: "five-activities", label: "Busy Explorer", emoji: "🏅", test: (s) => s.activityCount >= 5 },
  { id: "color-friend", label: "Color Friend", emoji: "🌈", test: (s) => s.learned.colors.length >= 4 },
  { id: "shape-master", label: "Shape Buddy", emoji: "🔷", test: (s) => s.learned.shapes.length >= 4 },
  { id: "letter-hero", label: "Letter Hero", emoji: "🔤", test: (s) => s.learned.letters.length >= 5 },
  { id: "number-gardener", label: "Number Gardener", emoji: "🌻", test: (s) => s.learned.numbers.length >= 5 },
  { id: "memory-magic", label: "Memory Magic", emoji: "🧠", test: (s) => s.skills.memory.completed >= 2 },
  { id: "puzzle-pilot", label: "Puzzle Pilot", emoji: "🧩", test: (s) => s.skills.puzzle.completed >= 2 },
  { id: "artist", label: "Little Artist", emoji: "🎨", test: (s) => s.skills.drawing.completed >= 1 },
  { id: "adventure-done", label: "Adventure Champ", emoji: "🏆", test: (s) => s.dailyPath.done.length >= 5 },
];

function refreshBadges(s: ProgressState): ProgressState {
  const earned = BADGES.filter((b) => b.test(s)).map((b) => b.id);
  return { ...s, badges: uniq([...s.badges, ...earned]) };
}

function touchStreak(s: ProgressState): ProgressState {
  const today = todayKey();
  if (s.lastPlayedDate === today) return s;
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const streak = s.lastPlayedDate === yesterday ? s.streak + 1 : 1;
  return { ...s, streak, lastPlayedDate: today };
}

export type Learned = { colors?: string[]; letters?: string[]; numbers?: number[]; shapes?: string[] };

export function recordAttempt(skill: SkillKey, correct: boolean) {
  update((s) => {
    const cur = s.skills[skill];
    return touchStreak({
      ...s,
      skills: {
        ...s.skills,
        [skill]: { ...cur, attempts: cur.attempts + 1, correct: cur.correct + (correct ? 1 : 0) },
      },
      stars: s.stars + (correct ? 1 : 0),
      xp: s.xp + (correct ? 2 : 0),
    });
  });
}

export function completeActivity(opts: {
  skill: SkillKey;
  xp?: number;
  stars?: number;
  gems?: number;
  learned?: Learned;
  minutes?: number;
}) {
  update((s) => {
    const cur = s.skills[opts.skill];
    let next: ProgressState = touchStreak({
      ...s,
      xp: s.xp + (opts.xp ?? 10),
      stars: s.stars + (opts.stars ?? 1),
      gems: s.gems + (opts.gems ?? 1),
      minutes: s.minutes + (opts.minutes ?? 2),
      activityCount: s.activityCount + 1,
      skills: { ...s.skills, [opts.skill]: { ...cur, completed: cur.completed + 1 } },
      learned: {
        colors: uniq([...s.learned.colors, ...(opts.learned?.colors ?? [])]),
        letters: uniq([...s.learned.letters, ...(opts.learned?.letters ?? [])]),
        numbers: uniq([...s.learned.numbers, ...(opts.learned?.numbers ?? [])]),
        shapes: uniq([...s.learned.shapes, ...(opts.learned?.shapes ?? [])]),
      },
    });
    next = { ...next, worldsUnlocked: Math.min(6, 1 + Math.floor(next.activityCount / 3)) };
    return refreshBadges(next);
  });
}

export function completePathStep(step: number) {
  update((s) => {
    const today = todayKey();
    const path = s.dailyPath.date === today ? s.dailyPath : { date: today, done: [] };
    if (path.done.includes(step)) return s;
    const done = [...path.done, step];
    const finishedAll = done.length === 5;
    return refreshBadges({
      ...s,
      dailyPath: { date: today, done },
      xp: s.xp + (finishedAll ? 50 : 0),
    });
  });
}

/** React binding — subscribes to in-tab progress updates and storage events. */
export function useProgress() {
  const [state, setState] = useState<ProgressState>(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);

  const sync = useCallback(() => setState(read()), []);

  useEffect(() => {
    sync();
    setHydrated(true);
    window.addEventListener("tinytales:progress", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("tinytales:progress", sync);
      window.removeEventListener("storage", sync);
    };
  }, [sync]);

  return { state, hydrated };
}
