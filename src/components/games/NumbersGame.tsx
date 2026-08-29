import { useEffect, useMemo, useState } from "react";
import { COUNT_OBJECTS, pick } from "@/data/content";
import { CompleteScreen, GamePage, useGameRound } from "./GameShell";
import { say, sounds } from "@/services/audio";
import { useProgress } from "@/services/progress";

const ROUNDS = 5;

export function NumbersGame() {
  const { state } = useProgress();
  const max = state.child?.band === "super" ? 10 : state.child?.band === "smart" ? 7 : 5;
  const { round, feedback, message, done, answer, restart } = useGameRound({ skill: "numbers", rounds: ROUNDS });
  const [seed, setSeed] = useState(0);
  const [tapped, setTapped] = useState<number[]>([]);
  const [learned, setLearned] = useState<number[]>([]);
  const [wobble, setWobble] = useState<number | null>(null);

  const { count, object, options } = useMemo(() => {
    void seed;
    const c = 1 + Math.floor(Math.random() * max);
    const opts = new Set<number>([c]);
    while (opts.size < 3) opts.add(1 + Math.floor(Math.random() * max));
    return { count: c, object: pick(COUNT_OBJECTS), options: [...opts].sort(() => Math.random() - 0.5) };
  }, [round, seed, max]);

  useEffect(() => {
    setTapped([]);
    if (!done) say(`Let's count the ${object.name}!`);
  }, [count, object, done]);

  const allTapped = tapped.length === count;

  if (done) {
    return (
      <CompleteScreen
        title="Number Garden"
        character="bobo"
        skill="numbers"
        learned={{ numbers: learned }}
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
      title="Number Garden"
      character="bobo"
      onPromptTap={() => say(`Let's count the ${object.name}!`)}
      prompt={allTapped ? `How many ${object.name}?` : `Tap each one and count the ${object.name}!`}
      feedback={feedback}
      message={message}
      rounds={ROUNDS}
      round={round}
    >
      <div className="rounded-[1.75rem] bg-leaf/40 p-5">
        <div className="flex flex-wrap justify-center gap-3">
          {Array.from({ length: count }).map((_, i) => {
            const isOn = tapped.includes(i);
            return (
              <button
                key={i}
                type="button"
                aria-label={`${object.name} ${i + 1}`}
                onClick={() => {
                  if (isOn) return;
                  const next = [...tapped, i];
                  setTapped(next);
                  sounds.pop();
                  say(String(next.length));
                }}
                className={`tap-pop flex size-20 items-center justify-center rounded-3xl bg-card text-4xl shadow-[var(--shadow-soft)] ${
                  isOn ? "animate-bounce-soft ring-4 ring-primary" : ""
                }`}
              >
                {object.emoji}
              </button>
            );
          })}
        </div>
        <p className="mt-4 text-center text-lg font-bold font-display">Counted: {tapped.length}</p>
      </div>

      <div className="mt-5">
        <p className="mb-3 text-center font-bold">How many altogether?</p>
        <div className="grid grid-cols-3 gap-3">
          {options.map((n) => (
            <button
              key={n}
              type="button"
              disabled={!allTapped}
              onClick={() => {
                const correct = n === count;
                if (correct) setLearned((l) => [...l, count]);
                else {
                  setWobble(n);
                  setTimeout(() => setWobble(null), 600);
                }
                answer(correct, { praise: correct ? `You counted ${count} ${object.name}!` : undefined });
              }}
              className={`tap-pop flex h-24 items-center justify-center rounded-[1.5rem] bg-card text-4xl font-extrabold shadow-[var(--shadow-soft)] disabled:opacity-40 ${
                wobble === n ? "animate-wiggle" : ""
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
    </GamePage>
  );
}
