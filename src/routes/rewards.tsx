import { createFileRoute, Link } from "@tanstack/react-router";
import { Character } from "@/components/characters/Character";
import { Card, EmptyState, ScreenTitle } from "@/components/ui/Kit";
import { BADGES, useProgress } from "@/services/progress";

export const Route = createFileRoute("/rewards")({
  head: () => ({
    meta: [
      { title: "Rewards — TinyTales Learning World" },
      { name: "description", content: "Stars, gems and gentle badges your child collects by learning through play." },
      { property: "og:title", content: "Rewards — TinyTales Learning World" },
      { property: "og:description", content: "A calm, non-addictive reward shelf: stars, gems and badges." },
    ],
  }),
  component: RewardsPage,
});

function RewardsPage() {
  const { state, hydrated } = useProgress();
  const earned = new Set(state.badges);

  return (
    <div className="mx-auto w-full max-w-lg px-4 pb-6 pt-6">
      <ScreenTitle title="Your rewards" subtitle="Collected by playing and learning." />

      <div className="mt-5 grid grid-cols-3 gap-3">
        <Card className="bg-sunshine/60 text-center">
          <p className="text-2xl font-extrabold font-display">⭐ {state.stars}</p>
          <p className="text-xs font-bold opacity-70">Stars</p>
        </Card>
        <Card className="bg-lavender/60 text-center">
          <p className="text-2xl font-extrabold font-display">💎 {state.gems}</p>
          <p className="text-xs font-bold opacity-70">Gems</p>
        </Card>
        <Card className="bg-mint/60 text-center">
          <p className="text-2xl font-extrabold font-display">{state.xp}</p>
          <p className="text-xs font-bold opacity-70">XP</p>
        </Card>
      </div>

      <h2 className="mb-3 mt-7 text-lg font-extrabold">Badges</h2>
      {hydrated && earned.size === 0 ? (
        <EmptyState>
          <Character id="pip" state="happy" size={110} />
          <p className="text-lg font-bold font-display">Let's play a game and earn your first star!</p>
          <Link to="/play" className="tap-pop min-h-14 rounded-3xl bg-primary px-6 py-4 text-lg font-bold text-primary-foreground">
            Choose an activity
          </Link>
        </EmptyState>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {BADGES.map((b) => {
            const has = earned.has(b.id);
            return (
              <div
                key={b.id}
                className={`flex aspect-square flex-col items-center justify-center gap-1 rounded-[1.5rem] p-2 text-center shadow-[var(--shadow-soft)] ${
                  has ? "bg-card" : "bg-card/50"
                }`}
              >
                <span className={`text-4xl ${has ? "animate-bob" : "opacity-30 grayscale"}`}>{b.emoji}</span>
                <span className={`text-[0.7rem] font-bold ${has ? "" : "text-muted-foreground"}`}>{b.label}</span>
              </div>
            );
          })}
        </div>
      )}

      <h2 className="mb-3 mt-7 text-lg font-extrabold">Character friends</h2>
      <Card className="flex items-end justify-around bg-sky/40">
        {(["pip", "mimi", "bobo", "lulu", "tiko"] as const).map((id, i) => (
          <Character key={id} id={id} state={i % 2 ? "happy" : "excited"} size={54} />
        ))}
      </Card>
    </div>
  );
}
