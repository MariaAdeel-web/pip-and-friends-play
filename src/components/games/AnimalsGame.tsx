import { useEffect, useMemo, useState } from "react";
import { ANIMALS, pick, shuffle } from "@/data/content";
import { CompleteScreen, GamePage, useGameRound } from "./GameShell";
import { say, sounds } from "@/services/audio";

const ROUNDS = 5;

type Mode = "find" | "sound" | "home";

export function AnimalsGame() {
  const { round, feedback, message, done, answer, restart } = useGameRound({ skill: "memory", rounds: ROUNDS });
  const [seed, setSeed] = useState(0);
  const [wobble, setWobble] = useState<string | null>(null);
  const [reacting, setReacting] = useState<string | null>(null);

  const mode: Mode = round % 3 === 0 ? "find" : round % 3 === 1 ? "sound" : "home";

  const { target, choices } = useMemo(() => {
    void seed;
    const picks = shuffle(ANIMALS).slice(0, 4);
    return { target: pick(picks), choices: shuffle(picks) };
  }, [round, seed]);

  const prompt =
    mode === "find"
      ? `Where is the ${target.name}?`
      : mode === "sound"
        ? `Who says "${target.sound}"?`
        : `Who lives in the ${target.home}?`;

  useEffect(() => {
    if (!done) say(prompt);
  }, [prompt, done]);

  if (done) {
    return (
      <CompleteScreen
        title="Animal Friends"
        character="pip"
        skill="memory"
        xp={12}
        onPlayAgain={() => {
          restart();
          setSeed((s) => s + 1);
        }}
      />
    );
  }

  return (
    <GamePage
      title="Animal Friends"
      character="pip"
      onPromptTap={() => say(prompt)}
      prompt={prompt}
      feedback={feedback}
      message={message}
      rounds={ROUNDS}
      round={round}
    >
      <div className="grid grid-cols-2 gap-4">
        {choices.map((a) => (
          <button
            key={a.key}
            type="button"
            aria-label={a.name}
            onClick={() => {
              const correct = a.key === target.key;
              setReacting(a.key);
              setTimeout(() => setReacting(null), 700);
              if (!correct) {
                setWobble(a.key);
                setTimeout(() => setWobble(null), 600);
              } else {
                sounds.pop();
                say(a.sound);
              }
              answer(correct, { praise: correct ? `Yes! The ${a.name}!` : undefined });
            }}
            className={`tap-pop flex aspect-square flex-col items-center justify-center gap-1 rounded-[1.75rem] bg-card shadow-[var(--shadow-soft)] ${
              wobble === a.key ? "animate-wiggle" : ""
            }`}
          >
            <span className={`text-6xl ${reacting === a.key ? "animate-bounce-soft" : ""}`}>{a.emoji}</span>
            <span className="text-sm font-bold text-muted-foreground">{a.name}</span>
          </button>
        ))}
      </div>
    </GamePage>
  );
}
