import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ACTIVITIES } from "@/data/content";
import { ColorsGame } from "@/components/games/ColorsGame";
import { ShapesGame } from "@/components/games/ShapesGame";
import { AbcGame } from "@/components/games/AbcGame";
import { NumbersGame } from "@/components/games/NumbersGame";
import { MemoryGame } from "@/components/games/MemoryGame";
import { PuzzleGame } from "@/components/games/PuzzleGame";
import { DrawingGame } from "@/components/games/DrawingGame";
import { AnimalsGame } from "@/components/games/AnimalsGame";
import { MusicGame } from "@/components/games/MusicGame";
import { StoryGame } from "@/components/games/StoryGame";
import { Character } from "@/components/characters/Character";

const GAMES: Record<string, () => React.JSX.Element> = {
  colors: ColorsGame,
  shapes: ShapesGame,
  abc: AbcGame,
  numbers: NumbersGame,
  memory: MemoryGame,
  puzzle: PuzzleGame,
  drawing: DrawingGame,
  animals: AnimalsGame,
  music: MusicGame,
  story: StoryGame,
};

export const Route = createFileRoute("/game/$gameId")({
  head: ({ params }) => {
    const activity = ACTIVITIES.find((a) => a.id === params.gameId);
    const title = activity ? `${activity.title} — TinyTales Learning World` : "Activity — TinyTales Learning World";
    const description = activity
      ? `${activity.blurb}. A gentle, hands-on activity for ages 2–5.`
      : "A gentle, hands-on learning activity for ages 2–5.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: GameRoute,
});

function GameRoute() {
  const { gameId } = Route.useParams();
  const Game = GAMES[gameId];

  if (!Game) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center gap-4 px-6 text-center">
        <Character id="bobo" state="thinking" size={120} />
        <p className="text-lg font-extrabold font-display">This activity is still growing!</p>
        <Link to="/play" className="tap-pop min-h-14 rounded-3xl bg-primary px-6 py-4 text-lg font-bold text-primary-foreground">
          Back to activities
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-2">
      <Game />
    </div>
  );
}
