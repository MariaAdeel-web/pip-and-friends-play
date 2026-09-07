import { useEffect, useMemo, useState } from "react";
import { LETTERS, shuffle } from "@/data/content";
import { CompleteScreen, GamePage, useGameRound } from "./GameShell";
import { TracePad } from "./TracePad";
import { prefetchSay, say, sounds } from "@/services/audio";
import { recordLetter, useProgress } from "@/services/progress";


const ROUNDS = 5;

type Phase = "meet" | "match" | "trace";

export function AbcGame() {
  const { state } = useProgress();
  const canTrace = state.child?.band !== "little";
  const knownLetters = state.learned.letters;
  const { round, feedback, message, done, answer, restart } = useGameRound({ skill: "letters", rounds: ROUNDS });
  const [seed, setSeed] = useState(0);
  const [phase, setPhase] = useState<Phase>("meet");
  const [learned, setLearned] = useState<string[]>([]);
  const [wobble, setWobble] = useState<string | null>(null);

  // Build a session deck that always reaches for letters this child hasn't met
  // yet, so play walks through the whole alphabet instead of repeating A–E.
  const deck = useMemo(() => {
    void seed;
    const fresh = shuffle(LETTERS.filter((l) => !knownLetters.includes(l.letter)));
    const seen = shuffle(LETTERS.filter((l) => knownLetters.includes(l.letter)));
    return [...fresh, ...seen].slice(0, ROUNDS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed]);

  const item = deck[Math.min(round, deck.length - 1)];

  const options = useMemo(() => {
    const others = shuffle(LETTERS.filter((l) => l.letter !== item.letter)).slice(0, 2);
    return shuffle([item, ...others]);
  }, [item]);

  useEffect(() => {
    setPhase("meet");
    if (!done) {
      say(`${item.letter} says ${item.sound}`);
      // Warm up the next voice lines so play never waits.
      prefetchSay(
        `${item.letter} says ${item.sound}. ${item.letter} for ${item.word}`,
        `Which one starts with ${item.letter}?`,
        `Trace the letter ${item.letter}!`,
      );
    }
  }, [item, done]);


  const totalKnown = new Set([...knownLetters, ...learned]).size;

  if (done) {
    return (
      <CompleteScreen
        title="ABC Adventure"
        character="pip"
        skill="letters"
        learned={{ letters: learned }}
        xp={14}
        onPlayAgain={() => {
          restart();
          setSeed((s) => s + 1);
          setLearned([]);
        }}
      />
    );
  }

  const prompt =
    phase === "meet"
      ? `${item.letter} says "${item.sound}"`
      : phase === "match"
        ? `Which one starts with ${item.letter}?`
        : `Trace the letter ${item.letter}!`;

  return (
    <GamePage
      title="ABC Adventure"
      character="pip"
      onPromptTap={() => say(prompt)}
      prompt={prompt}
      feedback={feedback}
      message={message}
      rounds={ROUNDS}
      round={round}
    >
      {phase === "meet" && (
        <div className="flex flex-col items-center gap-5">
          <button
            type="button"
            aria-label={`Hear the letter ${item.letter}`}
            onClick={() => {
              sounds.pop();
              say(`${item.letter} says ${item.sound}. ${item.letter} for ${item.word}`);
            }}
            className="tap-pop animate-pop-in flex size-56 items-center justify-center rounded-[2.5rem] bg-lavender/70 text-[9rem] leading-none font-display shadow-[var(--shadow-pop)]"
          >
            {item.letter}
          </button>
          <div className="flex items-center gap-3 rounded-3xl bg-card px-6 py-4 shadow-[var(--shadow-soft)]">
            <span className="animate-bob text-5xl">{item.emoji}</span>
            <span className="text-xl font-bold font-display">{item.word}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              sounds.tap();
              setPhase("match");
            }}
            className="tap-pop min-h-14 rounded-3xl bg-primary px-8 text-lg font-bold text-primary-foreground font-display shadow-[var(--shadow-pop)]"
          >
            Let's play →
          </button>
        </div>
      )}

      {phase === "match" && (
        <div className="grid grid-cols-3 gap-3">
          {options.map((o) => (
            <button
              key={o.letter}
              type="button"
              aria-label={o.word}
              onClick={() => {
                const correct = o.letter === item.letter;
                if (correct) {
                  setLearned((l) => (l.includes(item.letter) ? l : [...l, item.letter]));
                  sounds.correct();
                  if (canTrace) {
                    say(`Yes! ${item.word}. Now trace it!`);
                    setPhase("trace");
                    return;
                  }
                  answer(true, { praise: `Yes! ${item.word}!` });
                } else {
                  setWobble(o.letter);
                  setTimeout(() => setWobble(null), 600);
                  answer(false);
                }
              }}
              className={`tap-pop flex aspect-square flex-col items-center justify-center gap-1 rounded-[1.5rem] bg-card text-5xl shadow-[var(--shadow-soft)] ${
                wobble === o.letter ? "animate-wiggle" : ""
              }`}
            >
              <span>{o.emoji}</span>
              <span className="text-xs font-bold text-muted-foreground">{o.word}</span>
            </button>
          ))}
        </div>
      )}

      {phase === "trace" && (
        <TracePad
          glyph={item.letter}
          onResult={(ok) => {
            if (ok) answer(true, { praise: `Beautiful ${item.letter}!` });
            else answer(false);
          }}
        />
      )}

      <section className="mt-6 rounded-[1.5rem] bg-card p-4 shadow-[var(--shadow-soft)]">
        <p className="mb-2 text-sm font-bold text-muted-foreground">
          Alphabet journey: {totalKnown} of {LETTERS.length} letters
        </p>
        <ul className="flex flex-wrap gap-1.5" aria-label={`${totalKnown} of ${LETTERS.length} letters learned`}>
          {LETTERS.map((l) => {
            const met = knownLetters.includes(l.letter) || learned.includes(l.letter);
            return (
              <li
                key={l.letter}
                aria-label={met ? `${l.letter} learned` : `${l.letter} not yet`}
                className={`flex size-7 items-center justify-center rounded-lg text-xs font-bold font-display ${
                  met ? "bg-mint text-foreground" : "bg-muted/50 text-muted-foreground"
                } ${l.letter === item.letter ? "ring-2 ring-primary" : ""}`}
              >
                {l.letter}
              </li>
            );
          })}
        </ul>
      </section>
    </GamePage>
  );
}
