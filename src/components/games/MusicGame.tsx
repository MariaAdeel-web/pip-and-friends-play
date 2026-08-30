import { useEffect, useRef, useState } from "react";
import { BackBar, BigButton, Card } from "@/components/ui/Kit";
import { Character } from "@/components/characters/Character";
import { NOTES, say, sounds } from "@/services/audio";
import { completeActivity } from "@/services/progress";

const INSTRUMENTS = [
  { key: "drum", label: "Drum", emoji: "🥁", play: () => sounds.drum() },
  { key: "piano", label: "Piano", emoji: "🎹", play: () => sounds.note("C5") },
  { key: "guitar", label: "Guitar", emoji: "🎸", play: () => sounds.note("G4") },
  { key: "xylo", label: "Xylophone", emoji: "🎵", play: () => sounds.note("E5") },
  { key: "bell", label: "Bells", emoji: "🔔", play: () => sounds.bell() },
];

const PADS = [
  { note: "C5", color: "var(--coral)" },
  { note: "D5", color: "var(--peach)" },
  { note: "E5", color: "var(--sunshine)" },
  { note: "F5", color: "var(--mint)" },
  { note: "G5", color: "var(--sky)" },
  { note: "A5", color: "var(--lavender)" },
] as const;

export function MusicGame() {
  const [active, setActive] = useState<string | null>(null);
  const [pattern, setPattern] = useState<number[]>([]);
  const [input, setInput] = useState<number[]>([]);
  const [playing, setPlaying] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [wins, setWins] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const playPattern = (p: number[]) => {
    setPlaying(true);
    p.forEach((idx, i) => {
      timers.current.push(
        setTimeout(() => {
          sounds.note(PADS[idx].note);
          setActive(PADS[idx].note);
          timers.current.push(setTimeout(() => setActive(null), 280));
          if (i === p.length - 1) timers.current.push(setTimeout(() => setPlaying(false), 350));
        }, i * 620),
      );
    });
  };

  const newPattern = () => {
    const len = Math.min(4, 2 + wins);
    const p = Array.from({ length: len }, () => Math.floor(Math.random() * PADS.length));
    setPattern(p);
    setInput([]);
    setStatus(null);
    say("Listen, then repeat!");
    setTimeout(() => playPattern(p), 900);
  };

  const tapPad = (i: number) => {
    sounds.note(PADS[i].note);
    setActive(PADS[i].note);
    setTimeout(() => setActive(null), 200);
    if (!pattern.length || playing) return;
    const next = [...input, i];
    setInput(next);
    const ok = next.every((v, k) => v === pattern[k]);
    if (!ok) {
      setStatus("Let's try again!");
      say("Let's try again!");
      setInput([]);
      setTimeout(() => playPattern(pattern), 800);
      return;
    }
    if (next.length === pattern.length) {
      sounds.celebrate();
      setStatus("You did it! 🎉");
      say("You did it!");
      const w = wins + 1;
      setWins(w);
      setPattern([]);
      if (w === 3) completeActivity({ skill: "memory", xp: 12, stars: 2 });
    }
  };

  return (
    <div className="mx-auto w-full max-w-lg px-4 pb-8">
      <BackBar title="Music Garden" />

      <Card className="flex items-center gap-3">
        <Character id="mimi" state={playing ? "excited" : "idle"} size={70} />
        <p className="text-lg font-bold font-display">{status ?? (pattern.length ? "Now you play it!" : "Tap to make music!")}</p>
      </Card>

      <div className="mt-4 grid grid-cols-3 gap-3">
        {PADS.map((p, i) => (
          <button
            key={p.note}
            type="button"
            aria-label={`Play note ${p.note}`}
            onClick={() => tapPad(i)}
            className={`tap-pop h-24 rounded-[1.5rem] shadow-[var(--shadow-soft)] transition-transform ${
              active === p.note ? "scale-95 ring-4 ring-primary" : ""
            }`}
            style={{ backgroundColor: p.color }}
          />
        ))}
      </div>

      <div className="mt-4 flex gap-3">
        <BigButton className="flex-1" onClick={newPattern} disabled={playing}>
          🎶 Copy my rhythm
        </BigButton>
      </div>

      <p className="mb-2 mt-6 text-sm font-bold text-muted-foreground">Instruments</p>
      <div className="grid grid-cols-3 gap-3">
        {INSTRUMENTS.map((ins) => (
          <button
            key={ins.key}
            type="button"
            aria-label={ins.label}
            onClick={() => {
              ins.play();
              setActive(ins.key);
              setTimeout(() => setActive(null), 250);
            }}
            className={`tap-pop flex h-24 flex-col items-center justify-center gap-1 rounded-[1.5rem] bg-card text-4xl shadow-[var(--shadow-soft)] ${
              active === ins.key ? "animate-bounce-soft" : ""
            }`}
          >
            <span>{ins.emoji}</span>
            <span className="text-xs font-bold text-muted-foreground">{ins.label}</span>
          </button>
        ))}
      </div>
      <p className="mt-4 text-center text-xs text-muted-foreground">Notes: {Object.keys(NOTES).length} gentle tones</p>
    </div>
  );
}
