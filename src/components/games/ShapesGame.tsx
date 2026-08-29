import { useEffect, useMemo, useState } from "react";
import { SHAPES, pick, shuffle, type ShapeKey } from "@/data/content";
import { ShapeGlyph } from "./ShapeGlyph";
import { CompleteScreen, GamePage, useGameRound } from "./GameShell";
import { say } from "@/services/audio";

const ROUNDS = 6;

/** Rounds alternate: shape hunt (tap) and shape match (drop into outline). */
export function ShapesGame() {
  const { round, feedback, message, done, answer, restart } = useGameRound({ skill: "shapes", rounds: ROUNDS });
  const [seed, setSeed] = useState(0);
  const [wobble, setWobble] = useState<string | null>(null);
  const [held, setHeld] = useState<ShapeKey | null>(null);
  const [learned, setLearned] = useState<string[]>([]);

  const mode = round % 2 === 0 ? "hunt" : "match";

  const { target, choices } = useMemo(() => {
    void seed;
    const picks = shuffle(SHAPES).slice(0, 4);
    return { target: pick(picks), choices: shuffle(picks) };
  }, [round, seed]);

  useEffect(() => {
    setHeld(null);
    if (!done) say(mode === "hunt" ? `Find the ${target.label}!` : `Put the ${target.label} in its home.`);
  }, [target, mode, done]);

  const handle = (key: ShapeKey) => {
    const correct = key === target.key;
    if (correct) setLearned((l) => [...l, target.label]);
    else {
      setWobble(key);
      setTimeout(() => setWobble(null), 600);
    }
    answer(correct, { praise: correct ? `Yes! A ${target.label}!` : undefined });
  };

  if (done) {
    return (
      <CompleteScreen
        title="Shapes"
        character="tiko"
        skill="shapes"
        learned={{ shapes: learned }}
        xp={12}
        onPlayAgain={() => {
          restart();
          setSeed((s) => s + 1);
          setLearned([]);
        }}
      />
    );
  }

  return (
    <GamePage
      title="Shapes"
      character="tiko"
      onPromptTap={() => say(mode === "hunt" ? `Find the ${target.label}!` : `Put the ${target.label} in its home.`)}
      prompt={mode === "hunt" ? `Find the ${target.label}!` : `Drag the ${target.label} into its outline!`}
      feedback={feedback}
      message={message}
      rounds={ROUNDS}
      round={round}
    >
      {mode === "match" && (
        <div className="mb-5 flex flex-col items-center gap-2">
          <button
            type="button"
            aria-label={`Outline of ${target.label}`}
            onClick={() => held && handle(held)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const key = e.dataTransfer.getData("text/shape") as ShapeKey;
              if (key) handle(key);
            }}
            className="flex size-36 items-center justify-center rounded-[1.75rem] bg-card shadow-[var(--shadow-soft)]"
          >
            <ShapeGlyph shape={target.key} outline size={104} />
          </button>
          <p className="text-xs text-muted-foreground">Tap a shape, then tap the outline</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {choices.map((s) => (
          <button
            key={s.key}
            type="button"
            aria-label={s.label}
            draggable={mode === "match"}
            onDragStart={(e) => e.dataTransfer.setData("text/shape", s.key)}
            onClick={() => (mode === "hunt" ? handle(s.key) : setHeld(s.key))}
            className={`tap-pop flex aspect-square items-center justify-center rounded-[1.75rem] bg-card shadow-[var(--shadow-soft)] ${
              wobble === s.key ? "animate-wiggle" : ""
            } ${held === s.key ? "ring-4 ring-primary" : ""}`}
          >
            <ShapeGlyph shape={s.key} fill={s.token} size={94} />
          </button>
        ))}
      </div>
    </GamePage>
  );
}
