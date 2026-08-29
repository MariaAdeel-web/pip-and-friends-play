import { useEffect, useMemo, useState } from "react";
import { COLORING, COLORS } from "@/data/content";
import { BackBar, BigButton, Confetti } from "@/components/ui/Kit";
import { Character } from "@/components/characters/Character";
import { say, sounds } from "@/services/audio";
import { completeActivity } from "@/services/progress";

const STICKERS = ["⭐", "🌈", "💛", "🌸", "☁️", "🎈"];

const rewardClass: Record<string, string> = {
  fly: "animate-drift",
  launch: "animate-bounce-soft",
  shine: "animate-dance",
  swim: "animate-bob",
};

export function DrawingGame() {
  const [index, setIndex] = useState(0);
  const picture = COLORING[index];
  const [brush, setBrush] = useState(COLORS[0]);
  const [fills, setFills] = useState<Record<number, string>>({});
  const [history, setHistory] = useState<Record<number, string>[]>([]);
  const [stickers, setStickers] = useState<{ id: number; emoji: string; x: number; y: number }[]>([]);
  const [activeSticker, setActiveSticker] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);

  const complete = useMemo(
    () => picture.paths.every((_, i) => fills[i]),
    [fills, picture],
  );

  useEffect(() => {
    setFills({});
    setHistory([]);
    setStickers([]);
    setFinished(false);
  }, [index]);

  useEffect(() => {
    if (complete && !finished) {
      setFinished(true);
      sounds.celebrate();
      say("Beautiful! Watch it move!");
      completeActivity({ skill: "drawing", xp: 12, stars: 2 });
    }
  }, [complete, finished]);

  const paint = (i: number) => {
    setHistory((h) => [...h, fills]);
    setFills((f) => ({ ...f, [i]: brush.token }));
    sounds.pop();
  };

  return (
    <div className="relative mx-auto w-full max-w-lg px-4 pb-8">
      <BackBar title="Drawing Fun" />
      <Confetti show={finished} />

      <div className="flex gap-2 overflow-x-auto pb-2">
        {COLORING.map((p, i) => (
          <button
            key={p.key}
            type="button"
            onClick={() => {
              sounds.tap();
              setIndex(i);
            }}
            className={`tap-pop shrink-0 rounded-2xl px-4 py-2 text-sm font-bold shadow-[var(--shadow-soft)] ${
              i === index ? "bg-primary text-primary-foreground" : "bg-card"
            }`}
          >
            {p.title}
          </button>
        ))}
      </div>

      <div
        className="relative mt-3 rounded-[1.75rem] bg-card p-3 shadow-[var(--shadow-soft)]"
        onClick={(e) => {
          if (!activeSticker) return;
          const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
          setStickers((s) => [
            ...s,
            { id: Date.now(), emoji: activeSticker, x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 },
          ]);
          sounds.star();
          setActiveSticker(null);
        }}
      >
        <svg viewBox="0 0 200 200" className={`w-full ${finished ? rewardClass[picture.reward] : ""}`} role="img" aria-label={`Color the ${picture.title}`}>
          {picture.paths.map((p, i) => (
            <path
              key={i}
              d={p.d}
              fill={fills[i] ?? "var(--muted)"}
              stroke="var(--ink)"
              strokeWidth="3"
              strokeLinejoin="round"
              className="cursor-pointer transition-[fill] duration-200"
              onClick={(e) => {
                e.stopPropagation();
                paint(i);
              }}
            />
          ))}
        </svg>
        {stickers.map((s) => (
          <span key={s.id} className="pointer-events-none absolute text-3xl" style={{ left: `${s.x}%`, top: `${s.y}%`, transform: "translate(-50%,-50%)" }}>
            {s.emoji}
          </span>
        ))}
        {finished && (
          <div className="absolute inset-x-0 bottom-2 flex items-center justify-center gap-2">
            <Character id="lulu" state="celebrate" size={56} />
            <span className="rounded-full bg-mint/70 px-3 py-1 text-sm font-bold">Your {picture.title} came alive!</span>
          </div>
        )}
      </div>

      <div className="mt-4 rounded-[1.75rem] bg-card p-4 shadow-[var(--shadow-soft)]">
        <p className="mb-2 text-sm font-bold text-muted-foreground">Crayons</p>
        <div className="flex flex-wrap gap-3">
          {COLORS.map((c) => (
            <button
              key={c.color}
              type="button"
              aria-label={c.label}
              onClick={() => {
                setBrush(c);
                sounds.tap();
                say(c.label);
              }}
              className={`tap-pop size-12 rounded-2xl shadow-[var(--shadow-soft)] ${brush.color === c.color ? "ring-4 ring-primary" : ""}`}
              style={{ backgroundColor: c.token }}
            />
          ))}
        </div>

        <p className="mb-2 mt-4 text-sm font-bold text-muted-foreground">Stickers</p>
        <div className="flex flex-wrap gap-2">
          {STICKERS.map((s) => (
            <button
              key={s}
              type="button"
              aria-label={`Sticker ${s}`}
              onClick={() => {
                setActiveSticker(s);
                sounds.tap();
              }}
              className={`tap-pop size-12 rounded-2xl bg-muted text-2xl ${activeSticker === s ? "ring-4 ring-primary" : ""}`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="mt-4 flex gap-3">
          <BigButton
            tone="soft"
            className="flex-1"
            onClick={() => {
              setFills(history[history.length - 1] ?? {});
              setHistory((h) => h.slice(0, -1));
            }}
          >
            ↺ Undo
          </BigButton>
          <BigButton
            tone="soft"
            className="flex-1"
            onClick={() => {
              setFills({});
              setHistory([]);
              setStickers([]);
              setFinished(false);
            }}
          >
            🧽 Clear
          </BigButton>
        </div>
      </div>
    </div>
  );
}
