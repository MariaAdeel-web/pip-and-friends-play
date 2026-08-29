import { useEffect, useMemo, useState } from "react";
import { COLORS, pick, shuffle, type ColorItem } from "@/data/content";
import { CompleteScreen, GamePage, useGameRound } from "./GameShell";
import { say, sounds } from "@/services/audio";
import { useProgress } from "@/services/progress";

type Choice = { key: string; emoji: string; color: ColorItem };

const ROUNDS = 5;

export function ColorsGame() {
  const { state } = useProgress();
  const optionCount = state.child?.band === "little" ? 3 : 4;
  const { round, feedback, message, done, answer, restart } = useGameRound({ skill: "colors", rounds: ROUNDS });
  const [seed, setSeed] = useState(0);
  const [wobble, setWobble] = useState<string | null>(null);
  const [learned, setLearned] = useState<string[]>([]);

  const { target, choices } = useMemo(() => {
    void round;
    void seed;
    const picks = shuffle(COLORS).slice(0, optionCount);
    const t = pick(picks);
    return {
      target: t,
      choices: shuffle(
        picks.map((c) => ({ key: c.color, emoji: pick(c.objects).emoji, color: c })),
      ) as Choice[],
    };
  }, [round, seed, optionCount]);

  useEffect(() => {
    if (!done) say(`Can you find ${target.label}?`);
  }, [target, done]);

  if (done) {
    return (
      <CompleteScreen
        title="Colors"
        character="lulu"
        skill="colors"
        learned={{ colors: learned }}
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
      title="Colors"
      character="lulu"
      onPromptTap={() => say(`Can you find ${target.label}?`)}
      prompt={
        <>
          Can you find{" "}
          <span className="rounded-xl px-2 py-0.5 text-xl" style={{ backgroundColor: target.token, color: "white" }}>
            {target.label.toUpperCase()}
          </span>
          ?
        </>
      }
      feedback={feedback}
      message={message}
      rounds={ROUNDS}
      round={round}
    >
      <div className="grid grid-cols-2 gap-4">
        {choices.map((c) => (
          <button
            key={c.key}
            type="button"
            aria-label={c.color.label}
            onClick={() => {
              const correct = c.key === target.color;
              if (correct) {
                setLearned((l) => [...l, target.label]);
              } else {
                setWobble(c.key);
                setTimeout(() => setWobble(null), 600);
              }
              answer(correct, { praise: correct ? `Yay! ${target.label}!` : undefined });
            }}
            className={`tap-pop relative flex aspect-square items-center justify-center rounded-[1.75rem] text-6xl shadow-[var(--shadow-soft)] ${
              wobble === c.key ? "animate-wiggle" : ""
            }`}
            style={{ backgroundColor: c.color.token, opacity: 0.92 }}
          >
            <span className="drop-shadow-sm">{c.emoji}</span>
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={() => {
          sounds.pop();
          say(`${target.label} is here.`);
        }}
        className="tap-pop mx-auto mt-5 block rounded-2xl bg-card px-5 py-3 font-bold shadow-[var(--shadow-soft)]"
      >
        🔊 Say it again
      </button>
    </GamePage>
  );
}
