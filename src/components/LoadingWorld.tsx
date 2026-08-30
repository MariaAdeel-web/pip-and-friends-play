import { useEffect, useState } from "react";
import { Character } from "@/components/characters/Character";

/** Gentle splash: Pip is sleeping, then wakes up and the world is ready. */
export function LoadingWorld({ onDone }: { onDone: () => void }) {
  const [awake, setAwake] = useState(false);

  useEffect(() => {
    const a = setTimeout(() => setAwake(true), 1100);
    const b = setTimeout(onDone, 2100);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, [onDone]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-cream px-8 text-center">
      <Character id="pip" state={awake ? "excited" : "sleeping"} size={170} />
      <p className="text-xl font-extrabold font-display">
        {awake ? "Let's learn!" : "Getting our learning world ready..."}
      </p>
      <div className="flex gap-2" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="size-3 animate-bob rounded-full bg-primary/60"
            style={{ animationDelay: `${i * 180}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
