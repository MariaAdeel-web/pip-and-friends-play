import { useState } from "react";
import { AVATARS } from "@/data/content";
import { Character } from "@/components/characters/Character";
import { BigButton } from "@/components/ui/Kit";
import { sounds, say } from "@/services/audio";
import { bandForAge, setChild } from "@/services/progress";

const NAME_CHIPS = ["Explorer", "Sunny", "Star", "Buddy", "Bean", "Sprout"];

/** Parent-facing onboarding. Children never need to type. */
export function ProfileSetup() {
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [age, setAge] = useState(3);
  const [name, setName] = useState("");

  return (
    <div className="mx-auto w-full max-w-lg px-5 pb-28 pt-8">
      <div className="flex flex-col items-center text-center">
        <Character id="pip" state="wave" size={120} />
        <h1 className="mt-3 text-3xl font-extrabold">TinyTales Learning World</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Learn a little. Play a little. Smile a lot.
        </p>
      </div>

      <section className="mt-7">
        <h2 className="mb-3 text-lg font-extrabold">Choose your character</h2>
        <div className="grid grid-cols-4 gap-3">
          {AVATARS.map((a) => (
            <button
              key={a}
              type="button"
              aria-label={`Avatar ${a}`}
              onClick={() => {
                setAvatar(a);
                sounds.pop();
              }}
              className={`tap-pop flex aspect-square items-center justify-center rounded-3xl bg-card text-4xl shadow-[var(--shadow-soft)] ${
                avatar === a ? "ring-4 ring-primary" : ""
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-7">
        <h2 className="mb-3 text-lg font-extrabold">How old?</h2>
        <div className="grid grid-cols-4 gap-3">
          {[2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => {
                setAge(n);
                sounds.pop();
              }}
              className={`tap-pop min-h-16 rounded-3xl bg-card text-2xl font-extrabold shadow-[var(--shadow-soft)] ${
                age === n ? "ring-4 ring-primary" : ""
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-7">
        <h2 className="mb-1 text-lg font-extrabold">Nickname</h2>
        <p className="mb-3 text-xs text-muted-foreground">For grown-ups: a nickname is enough — no real names needed.</p>
        <input
          value={name}
          onChange={(e) => setName(e.target.value.slice(0, 14))}
          placeholder="Little Explorer"
          className="min-h-14 w-full rounded-3xl border border-border bg-card px-5 text-lg font-bold shadow-[var(--shadow-soft)] outline-none placeholder:text-muted-foreground focus:ring-4 focus:ring-ring/40"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {NAME_CHIPS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setName(c)}
              className="tap-pop rounded-2xl bg-muted px-4 py-2 text-sm font-bold"
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      <BigButton
        className="mt-8 w-full"
        onClick={() => {
          const finalName = name.trim() || "Little Explorer";
          setChild({ name: finalName, age, avatar, band: bandForAge(age) });
          sounds.celebrate();
          say(`Hi ${finalName}! Let's learn!`);
        }}
      >
        Start exploring →
      </BigButton>
    </div>
  );
}
