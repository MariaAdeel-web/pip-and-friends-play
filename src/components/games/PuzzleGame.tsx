import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { PUZZLES, pick } from "@/data/content";
import { CompleteScreen, GamePage } from "./GameShell";
import { say, sounds } from "@/services/audio";
import { recordAttempt, useProgress } from "@/services/progress";

type Piece = { i: number; x: number; y: number; placed: boolean };

const SNAP = 46;

export function PuzzleGame() {
  const { state } = useProgress();
  const baseCols = state.child?.band === "super" ? 3 : 2;
  const [level, setLevel] = useState(0);
  const cols = baseCols;
  const rows = level === 0 ? 2 : baseCols === 3 ? 2 : 2;
  const total = level === 0 ? 2 : cols * rows;
  const [theme, setTheme] = useState(() => pick(PUZZLES));
  const [done, setDone] = useState(false);

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [board, setBoard] = useState(280);
  const [pieces, setPieces] = useState<Piece[]>([]);
  const drag = useRef<{ i: number; dx: number; dy: number } | null>(null);

  const gridCols = total === 2 ? 2 : cols;
  const gridRows = total === 2 ? 1 : rows;
  const pw = board / gridCols;
  const ph = board / gridRows;

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const measure = () => setBoard(Math.min(el.clientWidth, 340));
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    const scatter = Array.from({ length: total }).map((_, i) => ({
      i,
      x: 10 + (i % 3) * (board / 3.2),
      y: board + 20 + Math.floor(i / 3) * (ph * 0.6),
      placed: false,
    }));
    setPieces(scatter);
    say(`Build the ${theme.title}!`);
  }, [total, board, theme, ph]);

  useEffect(() => {
    if (pieces.length && pieces.every((p) => p.placed)) {
      const t = setTimeout(() => {
        sounds.celebrate();
        if (level < 1) {
          say("Wonderful! One more puzzle.");
          setLevel((l) => l + 1);
          setTheme(pick(PUZZLES));
        } else setDone(true);
      }, 600);
      return () => clearTimeout(t);
    }
  }, [pieces, level]);

  const slotFor = (i: number) => ({ x: (i % gridCols) * pw, y: Math.floor(i / gridCols) * ph });

  const onDown = (e: React.PointerEvent, i: number) => {
    const p = pieces.find((q) => q.i === i);
    if (!p || p.placed) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const rect = wrapRef.current!.getBoundingClientRect();
    drag.current = { i, dx: e.clientX - rect.left - p.x, dy: e.clientY - rect.top - p.y };
    sounds.tap();
  };

  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const rect = wrapRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left - d.dx;
    const y = e.clientY - rect.top - d.dy;
    setPieces((ps) => ps.map((p) => (p.i === d.i ? { ...p, x, y } : p)));
  };

  const onUp = () => {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    setPieces((ps) =>
      ps.map((p) => {
        if (p.i !== d.i) return p;
        const slot = slotFor(p.i);
        const near = Math.hypot(p.x - slot.x, p.y - slot.y) < SNAP;
        recordAttempt("puzzle", near);
        if (near) {
          sounds.correct();
          return { ...p, x: slot.x, y: slot.y, placed: true };
        }
        return p;
      }),
    );
  };

  if (done) {
    return (
      <CompleteScreen
        title="Puzzle Planet"
        character="tiko"
        skill="puzzle"
        xp={15}
        onPlayAgain={() => {
          setDone(false);
          setLevel(0);
          setTheme(pick(PUZZLES));
        }}
      />
    );
  }

  return (
    <GamePage
      title="Puzzle Planet"
      character="tiko"
      onPromptTap={() => say(`Build the ${theme.title}!`)}
      prompt={`Drag the pieces to build the ${theme.title}!`}
      rounds={total}
      round={pieces.filter((p) => p.placed).length}
    >
      <div
        ref={wrapRef}
        className="relative mx-auto w-full touch-none no-select"
        style={{ height: board * 1.6 }}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        <div
          className="absolute left-0 top-0 grid rounded-[1.5rem] border-4 border-dashed border-border/80"
          style={{
            width: board,
            height: board,
            backgroundColor: theme.bg,
            gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
            gridTemplateRows: `repeat(${gridRows}, 1fr)`,
            opacity: 0.5,
          }}
          aria-hidden="true"
        >
          {Array.from({ length: total }).map((_, i) => (
            <div key={i} className="border border-white/40" />
          ))}
        </div>

        {pieces.map((p) => {
          const c = p.i % gridCols;
          const r = Math.floor(p.i / gridCols);
          return (
            <div
              key={p.i}
              role="button"
              tabIndex={0}
              aria-label={`Puzzle piece ${p.i + 1}`}
              onPointerDown={(e) => onDown(e, p.i)}
              className={`absolute overflow-hidden rounded-2xl shadow-[var(--shadow-soft)] transition-shadow ${
                p.placed ? "" : "cursor-grab ring-2 ring-white/70"
              }`}
              style={{
                left: p.x,
                top: p.y,
                width: pw,
                height: ph,
                backgroundColor: theme.bg,
                transition: p.placed ? "left 160ms ease, top 160ms ease" : undefined,
                zIndex: p.placed ? 1 : 3,
              }}
            >
              <span
                className="pointer-events-none absolute flex items-center justify-center"
                style={{
                  width: board,
                  height: board,
                  left: -c * pw,
                  top: -r * ph,
                  fontSize: board * 0.62,
                  lineHeight: `${board}px`,
                }}
              >
                {theme.emoji}
              </span>
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-center text-sm text-muted-foreground">Puzzle {level + 1} of 2</p>
    </GamePage>
  );
}
