import { useEffect, useMemo, useState } from "react";
import { ANIMALS, shuffle } from "@/data/content";
import { CHARACTER_LIST } from "@/components/characters/Character";
import { CompleteScreen, GamePage } from "./GameShell";
import { say, sounds } from "@/services/audio";
import { recordAttempt, useProgress } from "@/services/progress";

type Card = { id: number; face: string; matched: boolean };

const FACES = [...ANIMALS.map((a) => a.emoji), "🌟", "☁️", "🦋", "🤖"];

export function MemoryGame() {
  const { state } = useProgress();
  const basePairs = state.child?.band === "super" ? 4 : state.child?.band === "smart" ? 3 : 2;
  const [level, setLevel] = useState(0);
  const pairs = Math.min(6, basePairs + level);
  const [seed, setSeed] = useState(0);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [lock, setLock] = useState(false);
  const [done, setDone] = useState(false);

  const deck = useMemo(() => {
    const faces = shuffle(FACES).slice(0, pairs);
    return shuffle([...faces, ...faces]).map((face, id) => ({ id, face, matched: false }));
  }, [pairs, seed]);

  useEffect(() => {
    setCards(deck);
    setFlipped([]);
    setLock(false);
  }, [deck]);

  useEffect(() => {
    if (!cards.length || !cards.every((c) => c.matched)) return undefined;
    const t = setTimeout(() => {
      if (level < 2) {
        sounds.celebrate();
        say("Great! Let's try more cards.");
        setLevel((l) => l + 1);
      } else {
        setDone(true);
      }
    }, 700);
    return () => clearTimeout(t);
  }, [cards, level]);

  const flip = (id: number) => {
    if (lock) return;
    const card = cards.find((c) => c.id === id);
    if (!card || card.matched || flipped.includes(id)) return;
    sounds.tap();
    const next = [...flipped, id];
    setFlipped(next);
    if (next.length === 2) {
      setLock(true);
      const [a, b] = next.map((i) => cards.find((c) => c.id === i)!);
      const match = a.face === b.face;
      recordAttempt("memory", match);
      setTimeout(() => {
        if (match) {
          sounds.correct();
          say("A match!");
          setCards((cs) => cs.map((c) => (c.face === a.face ? { ...c, matched: true } : c)));
        } else {
          sounds.retry();
        }
        setFlipped([]);
        setLock(false);
      }, match ? 500 : 900);
    }
  };

  if (done) {
    return (
      <CompleteScreen
        title="Memory Magic"
        character="bobo"
        skill="memory"
        xp={15}
        onPlayAgain={() => {
          setLevel(0);
          setDone(false);
          setSeed((s) => s + 1);
        }}
      />
    );
  }

  const cols = pairs <= 2 ? 2 : pairs <= 4 ? 4 : 4;
  const matchedPairs = cards.filter((c) => c.matched).length / 2;

  return (
    <GamePage
      title="Memory Magic"
      character="bobo"
      onPromptTap={() => say("Find the matching pairs!")}
      prompt={`Find the pairs! (${pairs} pairs)`}
      rounds={pairs}
      round={matchedPairs}
    >
      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))` }}>
        {cards.map((c) => {
          const open = c.matched || flipped.includes(c.id);
          return (
            <button
              key={c.id}
              type="button"
              aria-label={open ? c.face : "Hidden card"}
              onClick={() => flip(c.id)}
              className={`tap-pop flex aspect-square items-center justify-center rounded-[1.5rem] text-5xl shadow-[var(--shadow-soft)] transition-all duration-300 ${
                open ? "bg-card" : "bg-primary"
              } ${c.matched ? "animate-bounce-soft ring-4 ring-mint" : ""}`}
              style={{ transform: open ? "rotateY(0deg)" : "rotateY(0deg)" }}
            >
              {open ? c.face : <span className="text-3xl opacity-80">✨</span>}
            </button>
          );
        })}
      </div>
      <p className="mt-4 text-center text-sm text-muted-foreground">Round {level + 1} of 3</p>
      <div className="mt-4 flex justify-center gap-2">
        {CHARACTER_LIST.slice(0, 3).map((ch) => (
          <span key={ch.id} className="text-xs text-muted-foreground">
            {ch.name}
          </span>
        ))}
      </div>
    </GamePage>
  );
}
