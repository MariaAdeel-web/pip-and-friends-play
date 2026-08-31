import { createFileRoute, Link } from "@tanstack/react-router";
import { ACTIVITIES, WORLDS } from "@/data/content";
import { Character } from "@/components/characters/Character";
import { ScreenTitle } from "@/components/ui/Kit";
import { useProgress } from "@/services/progress";
import { sounds } from "@/services/audio";

export const Route = createFileRoute("/worlds")({
  head: () => ({
    meta: [
      { title: "Worlds Map — TinyTales Learning World" },
      { name: "description", content: "Travel from the Learning Garden to Cloud Kingdom — new worlds unlock as your child plays." },
      { property: "og:title", content: "Worlds Map — TinyTales Learning World" },
      { property: "og:description", content: "Six gentle worlds to explore, unlocked step by step." },
    ],
  }),
  component: WorldsPage,
});

function WorldsPage() {
  const { state, hydrated } = useProgress();
  const unlocked = hydrated ? state.worldsUnlocked : 1;

  return (
    <div className="mx-auto w-full max-w-lg px-4 pb-6 pt-6">
      <ScreenTitle title="Worlds map" subtitle="Play activities to open new worlds." />

      <div className="relative mt-6">
        <svg viewBox="0 0 100 420" className="absolute inset-0 h-full w-full" aria-hidden="true">
          <path
            d="M22 30 C78 80, 22 120, 78 170 C22 220, 78 260, 22 310 C60 350, 50 380, 50 400"
            fill="none"
            stroke="var(--border)"
            strokeWidth="3"
            strokeDasharray="8 9"
            strokeLinecap="round"
          />
        </svg>

        <ol className="relative flex flex-col gap-4">
          {WORLDS.map((w, i) => {
            const open = i < unlocked;
            const activity = ACTIVITIES[i % ACTIVITIES.length];
            const content = (
              <>
                <span
                  className="flex size-16 shrink-0 items-center justify-center rounded-3xl text-3xl shadow-[var(--shadow-soft)]"
                  style={{ backgroundColor: w.token }}
                >
                  {open ? w.emoji : "🔒"}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-lg font-extrabold font-display">{w.name}</span>
                  <span className="block text-sm text-muted-foreground">
                    {open ? `Visit with ${w.character[0].toUpperCase() + w.character.slice(1)}` : `Play ${Math.max(1, (i + 1) * 3 - state.activityCount)} more activities to unlock`}
                  </span>
                </span>
                {open && <Character id={w.character} state={i % 2 ? "happy" : "walking"} size={54} />}
              </>
            );

            return (
              <li key={w.key} className={i % 2 ? "self-end" : "self-start"} style={{ width: "100%" }}>
                {open ? (
                  <Link
                    to="/game/$gameId"
                    params={{ gameId: activity.id }}
                    onClick={() => sounds.tap()}
                    className="tap-pop flex items-center gap-3 rounded-[1.75rem] bg-card p-4 shadow-[var(--shadow-soft)]"
                  >
                    {content}
                  </Link>
                ) : (
                  <div className="flex items-center gap-3 rounded-[1.75rem] bg-card/60 p-4 opacity-70">{content}</div>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
