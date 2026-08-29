/**
 * Finger-friendly tracing pad.
 * A hidden mask canvas holds the glyph; the child's strokes are compared to it
 * so we can score "did the finger follow the letter?" without any library.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { BigButton } from "@/components/ui/Kit";
import { sounds } from "@/services/audio";

const SIZE = 300;
const STROKE = 34;

export function TracePad({
  glyph,
  onResult,
  label,
}: {
  glyph: string;
  onResult: (ok: boolean) => void;
  label?: string;
}) {
  const drawRef = useRef<HTMLCanvasElement | null>(null);
  const maskRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const [hasInk, setHasInk] = useState(false);

  const paintMask = useCallback(() => {
    const mask = maskRef.current;
    if (!mask) return;
    const ctx = mask.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    ctx.clearRect(0, 0, SIZE, SIZE);
    ctx.fillStyle = "#000";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `bold ${SIZE * 0.8}px "Baloo 2", system-ui, sans-serif`;
    ctx.fillText(glyph, SIZE / 2, SIZE / 2 + 8);
  }, [glyph]);

  const clear = useCallback(() => {
    const c = drawRef.current;
    const ctx = c?.getContext("2d", { willReadFrequently: true });
    if (ctx) ctx.clearRect(0, 0, SIZE, SIZE);
    setHasInk(false);
  }, []);

  useEffect(() => {
    paintMask();
    clear();
  }, [paintMask, clear, glyph]);

  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * SIZE,
      y: ((e.clientY - rect.top) / rect.height) * SIZE,
    };
  };

  const start = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = true;
    last.current = pos(e);
    setHasInk(true);
  };

  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const ctx = drawRef.current?.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    const p = pos(e);
    const l = last.current ?? p;
    ctx.strokeStyle = "oklch(0.72 0.14 275)";
    ctx.lineWidth = STROKE;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(l.x, l.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last.current = p;
  };

  const end = () => {
    drawing.current = false;
    last.current = null;
  };

  const check = () => {
    const dctx = drawRef.current?.getContext("2d", { willReadFrequently: true });
    const mctx = maskRef.current?.getContext("2d", { willReadFrequently: true });
    if (!dctx || !mctx) return;
    const d = dctx.getImageData(0, 0, SIZE, SIZE).data;
    const m = mctx.getImageData(0, 0, SIZE, SIZE).data;
    let maskPx = 0;
    let covered = 0;
    let inkPx = 0;
    for (let i = 3; i < d.length; i += 4 * 3) {
      const inMask = m[i] > 40;
      const inInk = d[i] > 40;
      if (inMask) maskPx++;
      if (inInk) inkPx++;
      if (inMask && inInk) covered++;
    }
    const coverage = maskPx ? covered / maskPx : 0;
    const precision = inkPx ? covered / inkPx : 0;
    const ok = coverage > 0.4 && precision > 0.3;
    if (ok) sounds.correct();
    onResult(ok);
    if (!ok) clear();
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative aspect-square w-full max-w-[320px] rounded-[1.75rem] bg-card p-2 shadow-[var(--shadow-soft)]">
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center text-[13rem] leading-none font-display text-muted/70"
          aria-hidden="true"
        >
          {glyph}
        </div>
        <canvas
          ref={drawRef}
          width={SIZE}
          height={SIZE}
          className="relative size-full touch-none rounded-[1.5rem]"
          aria-label={label ?? `Trace the letter ${glyph}`}
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerCancel={end}
        />
        <canvas ref={maskRef} width={SIZE} height={SIZE} className="hidden" aria-hidden="true" />
      </div>
      <div className="flex gap-3">
        <button type="button" onClick={clear} className="tap-pop min-h-12 rounded-2xl bg-card px-5 font-bold shadow-[var(--shadow-soft)]">
          ↺ Clear
        </button>
        <BigButton onClick={check} disabled={!hasInk} className="disabled:opacity-40">
          Done!
        </BigButton>
      </div>
    </div>
  );
}
