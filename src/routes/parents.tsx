import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Card, BigButton, ScreenTitle } from "@/components/ui/Kit";
import { Character } from "@/components/characters/Character";
import { LETTERS } from "@/data/content";

import { resetAll, useProgress, type SkillKey } from "@/services/progress";
import { getRecommendations, needsPractice, strengths } from "@/services/recommendations";
import { isSoundOn, setSoundOn } from "@/services/audio";

export const Route = createFileRoute("/parents")({
  head: () => ({
    meta: [
      { title: "Parent Dashboard — TinyTales Learning World" },
      { name: "description", content: "A private, ad-free progress view for grown-ups: learning time, skills practiced and simple next steps." },
      { property: "og:title", content: "Parent Dashboard — TinyTales Learning World" },
      { property: "og:description", content: "Track progress and get gentle, rule-based suggestions — no child data leaves the device." },
    ],
  }),
  component: ParentsPage,
});

const SKILL_LABELS: Record<SkillKey, string> = {
  colors: "Colors",
  shapes: "Shapes",
  letters: "Letters",
  numbers: "Numbers",
  memory: "Memory",
  puzzle: "Puzzles",
  drawing: "Drawing",
};

/** Simple arithmetic parent gate — keeps the area out of reach of little fingers. */
function ParentGate({ onPass }: { onPass: () => void }) {
  // Generated after mount so server and client markup stay identical.
  const [q, setQ] = useState<{ a: number; b: number } | null>(null);
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    setQ({ a: 3 + Math.floor(Math.random() * 6), b: 2 + Math.floor(Math.random() * 7) });
  }, []);

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-lg flex-col items-center justify-center gap-4 px-6 text-center">
      <Character id="tiko" state="thinking" size={110} />
      <h1 className="text-xl font-extrabold">Grown-ups only</h1>
      <p className="text-sm text-muted-foreground">
        {q ? `To continue, answer: what is ${q.a} × ${q.b}?` : "Loading a quick question…"}
      </p>
      <input
        inputMode="numeric"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setError(false);
        }}
        className="min-h-14 w-40 rounded-3xl border border-border bg-card text-center text-2xl font-extrabold outline-none focus:ring-4 focus:ring-ring/40"
        aria-label="Parent gate answer"
      />
      {error && <p className="text-sm font-bold text-destructive" role="alert">Not quite — try again.</p>}
      <BigButton disabled={!q} onClick={() => (q && Number(value) === q.a * q.b ? onPass() : setError(true))}>
        Continue
      </BigButton>
    </div>
  );
}


function ParentsPage() {
  const [unlocked, setUnlocked] = useState(false);
  const { state, hydrated } = useProgress();
  const [sound, setSound] = useState(() => (typeof window === "undefined" ? true : isSoundOn()));

  const recs = useMemo(() => getRecommendations(state), [state]);
  const good = useMemo(() => strengths(state), [state]);
  const practice = useMemo(() => needsPractice(state), [state]);

  if (!unlocked) return <ParentGate onPass={() => setUnlocked(true)} />;
  if (!hydrated) return <div className="min-h-screen" />;

  return (
    <div className="mx-auto w-full max-w-lg px-4 pb-6 pt-6">
      <ScreenTitle title="Parent dashboard" subtitle="Private to this device. No ads, no chat, no tracking." />

      <div className="mt-5 grid grid-cols-2 gap-3">
        <Metric label="Child" value={state.child?.name ?? "—"} />
        <Metric label="Level" value={state.child ? `${state.child.band === "little" ? "Little" : state.child.band === "smart" ? "Smart" : "Super"} Explorer` : "—"} />
        <Metric label="Learning time" value={`${state.minutes} min`} />
        <Metric label="Activities" value={state.activityCount} />
        <Metric label="Daily streak" value={`${state.streak} days`} />
        <Metric label="Badges" value={state.badges.length} />
      </div>

      <h2 className="mb-3 mt-7 text-lg font-extrabold">Skills practised</h2>
      <Card className="flex flex-col gap-3">
        {(Object.keys(SKILL_LABELS) as SkillKey[]).map((k) => {
          const s = state.skills[k];
          const pct = s.attempts ? Math.round((s.correct / s.attempts) * 100) : 0;
          return (
            <div key={k}>
              <div className="mb-1 flex justify-between text-sm font-bold">
                <span>{SKILL_LABELS[k]}</span>
                <span className="text-muted-foreground">
                  {s.attempts ? `${pct}% · ${s.completed} finished` : "Not started"}
                </span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </Card>

      <h2 className="mb-3 mt-7 text-lg font-extrabold">What's been learned</h2>
      <div className="grid grid-cols-2 gap-3">
        <Metric label="Colors" value={state.learned.colors.length} />
        <Metric label="Shapes" value={state.learned.shapes.length} />
        <Metric label="Letters" value={state.learned.letters.length} />
        <Metric label="Numbers" value={state.learned.numbers.length} />
      </div>

      <AbcPath state={state} />


      <h2 className="mb-3 mt-7 text-lg font-extrabold">Suggestions</h2>
      <Card className="flex flex-col gap-2">
        {recs.length === 0 && <p className="text-sm text-muted-foreground">Play a few activities to see personalised suggestions.</p>}
        {recs.map((r) => (
          <p key={r.id} className="flex gap-2 text-sm font-medium">
            <span>{r.tone === "good" ? "✅" : "💡"}</span>
            {r.text}
          </p>
        ))}
        {good.length > 0 && <p className="mt-2 text-sm"><strong>Strengths:</strong> {good.join(", ")}</p>}
        {practice.length > 0 && <p className="text-sm"><strong>Needs practice:</strong> {practice.join(", ")}</p>}
      </Card>

      <h2 className="mb-3 mt-7 text-lg font-extrabold">Settings</h2>
      <Card className="flex flex-col gap-3">
        <label className="flex min-h-14 items-center justify-between gap-3 text-base font-bold">
          Sounds & voice
          <input
            type="checkbox"
            checked={sound}
            onChange={(e) => {
              setSound(e.target.checked);
              setSoundOn(e.target.checked);
            }}
            className="size-7 accent-[var(--primary)]"
          />
        </label>
        <BigButton
          tone="soft"
          onClick={() => {
            if (window.confirm("Reset all progress and the child profile on this device?")) resetAll();
          }}
        >
          Reset progress
        </BigButton>
        <p className="text-xs text-muted-foreground">
          Progress is stored only on this device. The app has no ads, no chat, no external links for children and no
          third-party tracking.
        </p>
      </Card>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-3xl bg-card p-4 shadow-[var(--shadow-soft)]">
      <p className="truncate text-xl font-extrabold font-display">{value}</p>
      <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
    </div>
  );
}

type LetterStatus = "mastered" | "practising" | "new";

function letterStatus(
  letter: string,
  state: ReturnType<typeof useProgress>["state"],
): { status: LetterStatus; attempts: number; correct: number; traced: number } {
  const stat = state.letters[letter] ?? { correct: 0, attempts: 0, traced: 0 };
  const known = state.learned.letters.includes(letter);
  const rate = stat.attempts ? stat.correct / stat.attempts : 0;
  const status: LetterStatus =
    (known && stat.attempts === 0) || (stat.attempts >= 2 && rate >= 0.75)
      ? "mastered"
      : stat.attempts > 0
        ? "practising"
        : "new";
  return { status, ...stat };
}

const STATUS_STYLE: Record<LetterStatus, string> = {
  mastered: "bg-mint text-foreground border-transparent",
  practising: "bg-peach text-foreground border-transparent",
  new: "bg-muted/40 text-muted-foreground border-border",
};

const STATUS_LABEL: Record<LetterStatus, string> = {
  mastered: "knows it",
  practising: "still practising",
  new: "not met yet",
};

/** A–Z learning path so grown-ups can see exactly which letters need work. */
function AbcPath({ state }: { state: ReturnType<typeof useProgress>["state"] }) {
  const rows = LETTERS.map((l) => ({ ...l, ...letterStatus(l.letter, state) }));
  const mastered = rows.filter((r) => r.status === "mastered");
  const practising = rows.filter((r) => r.status === "practising");
  const notMet = rows.filter((r) => r.status === "new");
  const pct = Math.round((mastered.length / LETTERS.length) * 100);

  return (
    <>
      <h2 className="mb-3 mt-7 text-lg font-extrabold">ABC learning path</h2>
      <Card className="flex flex-col gap-4">
        <div>
          <div className="mb-1 flex justify-between text-sm font-bold">
            <span>{mastered.length} of 26 letters secure</span>
            <span className="text-muted-foreground">{pct}%</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <ul className="grid grid-cols-7 gap-1.5 sm:grid-cols-9" aria-label="Progress for each letter A to Z">
          {rows.map((r) => (
            <li
              key={r.letter}
              title={`${r.letter} — ${STATUS_LABEL[r.status]}`}
              aria-label={`${r.letter}: ${STATUS_LABEL[r.status]}${r.attempts ? `, ${r.correct} of ${r.attempts} correct` : ""}`}
              className={`flex aspect-square flex-col items-center justify-center rounded-xl border text-sm font-extrabold font-display ${STATUS_STYLE[r.status]}`}
            >
              {r.letter}
              <span className="text-[9px] font-bold opacity-70">
                {r.attempts ? `${r.correct}/${r.attempts}` : "—"}
              </span>
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap gap-3 text-xs font-bold text-muted-foreground">
          <span className="flex items-center gap-1.5"><i className="size-3 rounded bg-mint" /> Knows it</span>
          <span className="flex items-center gap-1.5"><i className="size-3 rounded bg-peach" /> Practising</span>
          <span className="flex items-center gap-1.5"><i className="size-3 rounded border border-border bg-muted/40" /> Not met yet</span>
        </div>

        <div className="flex flex-col gap-1 text-sm">
          <p>
            <strong>Needs practice:</strong>{" "}
            {practising.length ? practising.map((r) => r.letter).join(" ") : "nothing yet — great going!"}
          </p>
          <p>
            <strong>Coming up next:</strong>{" "}
            {notMet.length ? notMet.slice(0, 8).map((r) => r.letter).join(" ") : "every letter has been met!"}
          </p>
          <p className="text-xs text-muted-foreground">
            Each letter is practised with its sound, a picture word, matching and tracing in ABC Adventure.
          </p>
        </div>
      </Card>
    </>
  );
}

