import { createFileRoute, Link } from "@tanstack/react-router";
import { ACTIVITIES, WORLDS, worldUnlockAt } from "@/data/content";
import { Character } from "@/components/characters/Character";
import { ScreenTitle } from "@/components/ui/Kit";
import { useProgress } from "@/services/progress";
import { sounds } from "@/services/audio";

export const Route = createFileRoute("/worlds")({
  head: () => ({
    meta: [
      { title: "Worlds Map — Tiny Tales Learning World" },
      { name: "description", content: "Travel from the Learning Garden to Cloud Kingdom — new worlds unlock as your child plays." },
      { property: "og:title", content: "Worlds Map — Tiny Tales Learning World" },
      { property: "og:description", content: "Six gentle worlds to explore, unlocked step by step." },
    ],
  }),
  component: WorldsPage,
});

function WorldsPage() {
  const { state, hydrated } = useProgress();
  const done = hydrated ? state.activityCount : 0;

  return (
    <div className="mx-auto w-full max-w-lg px-4 pb-6 pt-6">
      <ScreenTitle title="Worlds map" subtitle="Finish activities to open new worlds." />

      <ol className="mt-6 flex flex-col gap-4">
        {WORLDS.map((w, i) => {
          const needed = worldUnlockAt(i);
          const open = done >= needed;
          const lessons = w.lessons
            .map((id) => ACTIVITIES.find((a) => a.id === id))
            .filter((a): a is (typeof ACTIVITIES)[number] => Boolean(a));

          return (
            <li
              key={w.key}
              className={`rounded-[1.75rem] p-4 shadow-[var(--shadow-soft)] ${open ? "bg-card" : "bg-card/60"}`}
            >
              <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
                <span
                  className="flex size-14 shrink-0 items-center justify-center rounded-3xl text-3xl"
                  style={{ backgroundColor: w.token, opacity: open ? 1 : 0.5 }}
                  aria-hidden="true"
                >
                  {open ? w.emoji : "🔒"}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-lg font-extrabold font-display">{w.name}</span>
                  <span className="block text-sm text-muted-foreground">
                    {open
                      ? `${lessons.length} lessons with ${w.character[0]!.toUpperCase()}${w.character.slice(1)}`
                      : `${needed - done} more ${needed - done === 1 ? "activity" : "activities"} to unlock`}
                  </span>
                </span>
                {open && <Character id={w.character} state={i % 2 ? "happy" : "walking"} size={52} />}
              </div>

              {open && (
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {lessons.map((a) => {
                    const skill = a.skill as keyof typeof state.skills;
                    const finished = hydrated && (state.skills[skill]?.completed ?? 0) > 0;
                    return (
                      <Link
                        key={a.id}
                        to="/game/$gameId"
                        params={{ gameId: a.id }}
                        onClick={() => sounds.tap()}
                        aria-label={`${a.title} lesson${finished ? " — completed" : ""}`}
                        className="tap-pop flex min-h-[5.5rem] flex-col items-center justify-center gap-1 rounded-2xl p-2 text-center"
                        style={{ backgroundColor: a.color, opacity: 0.95 }}
                      >
                        <span className="text-2xl leading-none" aria-hidden="true">
                          {finished ? "✅" : a.emoji}
                        </span>
                        <span className="text-xs font-extrabold leading-tight font-display">{a.title}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
