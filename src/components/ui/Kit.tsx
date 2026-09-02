/**
 * Shared toddler-friendly UI primitives: big targets, soft shadows, gentle motion.
 */

import { useEffect, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { sounds } from "@/services/audio";

export function BigButton({
  children,
  tone = "primary",
  className = "",
  onClick,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: "primary" | "soft" | "ghost" }) {
  const tones = {
    primary: "bg-primary text-primary-foreground shadow-[var(--shadow-pop)]",
    soft: "bg-card text-card-foreground shadow-[var(--shadow-soft)] border border-border",
    ghost: "bg-transparent text-foreground",
  } as const;
  return (
    <button
      {...rest}
      onClick={(e) => {
        sounds.tap();
        onClick?.(e);
      }}
      className={`tap-pop no-select min-h-14 rounded-3xl px-6 text-lg font-bold font-display ${tones[tone]} ${className}`}
    >
      {children}
    </button>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-[1.75rem] bg-card p-5 shadow-[var(--shadow-soft)] ${className}`}>{children}</div>
  );
}

export function ScreenTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="px-1">
      <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
    </header>
  );
}

export function BackBar({ title }: { title: string }) {
  return (
    <div className="safe-top sticky top-0 z-20 -mx-4 mb-3 flex items-center gap-3 bg-background/85 px-4 pb-2 backdrop-blur">
      <Link
        to="/play"
        onClick={() => sounds.tap()}
        aria-label="Back to activities"
        className="tap-pop flex size-12 shrink-0 items-center justify-center rounded-2xl bg-card text-xl shadow-[var(--shadow-soft)]"
      >
        <span aria-hidden="true">←</span>
      </Link>
      <h1 className="min-w-0 truncate text-xl font-extrabold">{title}</h1>
    </div>
  );
}


export function Sparkles({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div className="pointer-events-none absolute inset-0 overflow-visible" aria-hidden="true">
      {Array.from({ length: 8 }).map((_, i) => (
        <span
          key={i}
          className="absolute animate-sparkle text-xl"
          style={{
            left: `${10 + i * 11}%`,
            top: `${15 + ((i * 37) % 60)}%`,
            animationDelay: `${i * 60}ms`,
          }}
        >
          ✨
        </span>
      ))}
    </div>
  );
}

const CONFETTI_COLORS = ["var(--coral)", "var(--sunshine)", "var(--mint)", "var(--sky)", "var(--lavender)", "var(--peach)"];

export function Confetti({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden="true">
      {Array.from({ length: 36 }).map((_, i) => (
        <span
          key={i}
          className="absolute block size-2.5 rounded-[2px]"
          style={{
            left: `${(i * 2.8) % 100}%`,
            backgroundColor: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
            animation: `confetti-fall ${1.6 + (i % 5) * 0.25}s linear ${(i % 8) * 90}ms forwards`,
          }}
        />
      ))}
    </div>
  );
}

export function FloatingStars({ trigger }: { trigger: number }) {
  const [items, setItems] = useState<number[]>([]);
  const idRef = useRef(0);
  useEffect(() => {
    if (!trigger) return;
    const id = idRef.current++;
    setItems((s) => [...s, id]);
    const t = setTimeout(() => setItems((s) => s.filter((x) => x !== id)), 1200);
    return () => clearTimeout(t);
  }, [trigger]);
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center" aria-hidden="true">
      {items.map((i) => (
        <span key={i} className="absolute animate-float-up text-3xl">⭐</span>
      ))}
    </div>
  );
}

export function ProgressDots({ total, done }: { total: number; done: number }) {
  return (
    <div className="flex items-center gap-1.5" aria-label={`${done} of ${total} complete`}>
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`h-2.5 rounded-full transition-all ${i < done ? "w-7 bg-primary" : "w-2.5 bg-border"}`}
        />
      ))}
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <div className="flex flex-col items-center gap-3 rounded-[1.75rem] bg-card/70 p-8 text-center">{children}</div>;
}
