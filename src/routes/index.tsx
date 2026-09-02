import { createFileRoute, Link } from "@tanstack/react-router";
import { ACTIVITIES, DAILY_PATH } from "@/data/content";
import { Character } from "@/components/characters/Character";
import { Card, Confetti } from "@/components/ui/Kit";
import { ProfileSetup } from "@/components/profile/ProfileSetup";
import { isSoundOn, setSoundOn, sounds } from "@/services/audio";
import { todayKey, useProgress } from "@/services/progress";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TinyTales Learning World — Playful Learning for Ages 2–5" },
      {
        name: "description",
        content:
          "A gentle, colorful learning world for toddlers: colors, shapes, ABC, counting, memory, puzzles and drawing games.",
      },
      { property: "og:title", content: "TinyTales Learning World" },
      {
        property: "og:description",
        content: "Learn a little. Play a little. Smile a lot. Original toddler learning games for ages 2–5.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { state, hydrated } = useProgress();
  const [sound, setSound] = useState(true);
  const [celebrate, setCelebrate] = useState(false);
  const pathDone = state.dailyPath.date === todayKey() ? state.dailyPath.done.length : 0;
  const wasComplete = useRef(false);

  useEffect(() => setSound(isSoundOn()), []);

  // Celebrate the moment the last adventure step is actually finished.
  useEffect(() => {
    const complete = pathDone >= DAILY_PATH.length;
    if (complete && !wasComplete.current) setCelebrate(true);
    wasComplete.current = complete;
  }, [pathDone]);

  if (!hydrated) return <div className="min-h-screen" />;
  if (!state.child) return <ProfileSetup />;

  const path = state.dailyPath.date === todayKey() ? state.dailyPath.done : [];
  const pathComplete = path.length >= DAILY_PATH.length;


  return (
    <div className="mx-auto w-full max-w-lg px-4 pb-6">
      <Confetti show={celebrate} />

      <header className="safe-top flex items-center gap-3 pt-3">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-card text-3xl shadow-[var(--shadow-soft)]">
          {state.child.avatar}
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-extrabold">Hi, {state.child.name}! 🌟</h1>
          <p className="text-xs text-muted-foreground">
            {state.child.band === "little" ? "Little" : state.child.band === "smart" ? "Smart" : "Super"} Explorer
          </p>
        </div>
        <button
          type="button"
          aria-label={sound ? "Turn sound off" : "Turn sound on"}
          onClick={() => {
            const next = !sound;
            setSoundOn(next);
            setSound(next);
            if (next) sounds.pop();
          }}
          className="tap-pop flex size-12 items-center justify-center rounded-2xl bg-card text-xl shadow-[var(--shadow-soft)]"
        >
          {sound ? "🔊" : "🔇"}
        </button>
      </header>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <Stat label="XP" value={state.xp} tone="var(--sunshine)" />
        <Stat label="Stars" value={`⭐ ${state.stars}`} tone="var(--mint)" />
        <Stat label="Streak" value={`🔥 ${state.streak}`} tone="var(--peach)" />
      </div>

      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-extrabold">Today's Adventure</h2>
          <span className="text-sm font-bold text-muted-foreground">
            {path.length}/{DAILY_PATH.length}
          </span>
        </div>
        <Card className="bg-lavender/40">
          {pathComplete ? (
            <div className="flex flex-col items-center gap-2 text-center">
              <Character id="pip" state="celebrate" size={90} />
              <p className="text-lg font-extrabold font-display">Amazing! You completed today's adventure!</p>
              <p className="text-sm font-bold">+50 XP · 🏆 Adventure Champ</p>
            </div>
          ) : (
            <ol className="flex flex-col gap-2">
              {DAILY_PATH.map((s) => {
                const done = path.includes(s.step);
                return (
                  <li key={s.step}>
                    <Link
                      to="/game/$gameId"
                      params={{ gameId: s.gameId }}
                      onClick={() => sounds.tap()}
                      className="tap-pop flex min-h-14 items-center gap-3 rounded-2xl bg-card px-4 py-2 shadow-[var(--shadow-soft)]"
                    >
                      <span className="text-2xl" aria-hidden="true">{done ? "✅" : "⭐"}</span>
                      <span className={`font-bold ${done ? "text-muted-foreground line-through" : ""}`}>
                        Step {s.step} — {s.label}
                      </span>
                      <span className="sr-only">{done ? "completed" : "not finished yet"}</span>
                    </Link>
                  </li>
                );
              })}
            </ol>

          )}
        </Card>
      </section>

      <section className="mt-7">
        <h2 className="mb-3 text-lg font-extrabold">Explore & Learn</h2>
        <div className="grid grid-cols-2 gap-4">
          {ACTIVITIES.map((a) => (
            <Link
              key={a.id}
              to="/game/$gameId"
              params={{ gameId: a.id }}
              onClick={() => sounds.tap()}
              className="tap-pop flex aspect-square flex-col items-center justify-center gap-1 rounded-[1.75rem] p-3 text-center shadow-[var(--shadow-soft)]"
              style={{ backgroundColor: a.color, opacity: 0.95 }}
            >
              <Character id={a.character} state="idle" size={62} />
              <span className="text-3xl leading-none">{a.emoji}</span>
              <span className="text-sm font-extrabold font-display">{a.title}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string | number; tone: string }) {
  return (
    <div className="rounded-3xl p-3 text-center shadow-[var(--shadow-soft)]" style={{ backgroundColor: tone }}>
      <p className="text-lg font-extrabold font-display">{value}</p>
      <p className="text-[0.7rem] font-bold uppercase tracking-wide opacity-70">{label}</p>
    </div>
  );
}
