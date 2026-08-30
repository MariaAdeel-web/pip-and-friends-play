import { createFileRoute, Link } from "@tanstack/react-router";
import { ACTIVITIES } from "@/data/content";
import { Character } from "@/components/characters/Character";
import { ScreenTitle } from "@/components/ui/Kit";
import { sounds } from "@/services/audio";

export const Route = createFileRoute("/play")({
  head: () => ({
    meta: [
      { title: "Play — TinyTales Learning World" },
      { name: "description", content: "Ten toddler activities: colors, shapes, ABC, numbers, animals, puzzles, music, memory, drawing and stories." },
      { property: "og:title", content: "Play — TinyTales Learning World" },
      { property: "og:description", content: "Pick a mini-game and start learning through play." },
    ],
  }),
  component: PlayPage,
});

function PlayPage() {
  return (
    <div className="mx-auto w-full max-w-lg px-4 pb-6 pt-6">
      <ScreenTitle title="Let's play!" subtitle="Tap any card to start an activity." />
      <div className="mt-5 flex flex-col gap-4">
        {ACTIVITIES.map((a) => (
          <Link
            key={a.id}
            to="/game/$gameId"
            params={{ gameId: a.id }}
            onClick={() => sounds.tap()}
            className="tap-pop flex items-center gap-4 rounded-[1.75rem] p-4 shadow-[var(--shadow-soft)]"
            style={{ backgroundColor: a.color, opacity: 0.95 }}
          >
            <Character id={a.character} state="idle" size={68} />
            <span className="min-w-0 flex-1">
              <span className="block text-lg font-extrabold font-display">
                {a.emoji} {a.title}
              </span>
              <span className="block text-sm opacity-75">{a.blurb}</span>
            </span>
            <span className="text-2xl">›</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
