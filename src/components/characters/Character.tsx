/**
 * Original mascot family for TinyTales Learning World.
 * Each character is a pure inline SVG (tiny, crisp at any size, animatable via CSS)
 * driven by a shared animation-state contract so new AI-generated art can be
 * swapped in later behind the same <Character /> API.
 */

import { memo } from "react";

export type CharacterId = "pip" | "mimi" | "bobo" | "lulu" | "tiko";

export type AnimationState =
  | "idle"
  | "happy"
  | "excited"
  | "thinking"
  | "walking"
  | "jumping"
  | "celebrate"
  | "sleeping"
  | "wave"
  | "surprised"
  | "sad";

export type CharacterMeta = {
  id: CharacterId;
  name: string;
  category: "character";
  blurb: string;
  animationStates: AnimationState[];
};

const ALL_STATES: AnimationState[] = [
  "idle", "happy", "excited", "thinking", "walking",
  "jumping", "celebrate", "sleeping", "wave", "surprised", "sad",
];

export const CHARACTERS: Record<CharacterId, CharacterMeta> = {
  pip: { id: "pip", name: "Pip", category: "character", blurb: "A tiny fluffy explorer with a little backpack.", animationStates: ALL_STATES },
  mimi: { id: "mimi", name: "Mimi", category: "character", blurb: "A cheerful little star who loves to shine.", animationStates: ALL_STATES },
  bobo: { id: "bobo", name: "Bobo", category: "character", blurb: "A soft cloud friend full of gentle surprises.", animationStates: ALL_STATES },
  lulu: { id: "lulu", name: "Lulu", category: "character", blurb: "A colorful flutter-friend from Rainbow Valley.", animationStates: ALL_STATES },
  tiko: { id: "tiko", name: "Tiko", category: "character", blurb: "A small friendly robot built for learning.", animationStates: ALL_STATES },
};

export const CHARACTER_LIST = Object.values(CHARACTERS);

const stateClass: Record<AnimationState, string> = {
  idle: "animate-bob",
  happy: "animate-bob",
  excited: "animate-dance",
  thinking: "animate-drift",
  walking: "animate-bob",
  jumping: "animate-bounce-soft",
  celebrate: "animate-dance",
  sleeping: "",
  wave: "animate-bob",
  surprised: "animate-wiggle",
  sad: "",
};

type Props = {
  id: CharacterId;
  state?: AnimationState;
  size?: number;
  className?: string;
};

function Eyes({ sleeping, surprised, cx1 = 40, cx2 = 60, cy = 46 }: { sleeping?: boolean; surprised?: boolean; cx1?: number; cx2?: number; cy?: number }) {
  if (sleeping) {
    return (
      <g stroke="var(--ink)" strokeWidth="3" strokeLinecap="round" fill="none">
        <path d={`M${cx1 - 6} ${cy} q6 6 12 0`} />
        <path d={`M${cx2 - 6} ${cy} q6 6 12 0`} />
      </g>
    );
  }
  const r = surprised ? 9 : 7;
  return (
    <g className="animate-blink" style={{ transformOrigin: `${(cx1 + cx2) / 2}px ${cy}px` }}>
      <ellipse cx={cx1} cy={cy} rx={r} ry={r + 1} fill="var(--ink)" />
      <ellipse cx={cx2} cy={cy} rx={r} ry={r + 1} fill="var(--ink)" />
      <circle cx={cx1 + 2.5} cy={cy - 3} r="2.4" fill="white" />
      <circle cx={cx2 + 2.5} cy={cy - 3} r="2.4" fill="white" />
    </g>
  );
}

function Mouth({ state }: { state: AnimationState }) {
  if (state === "sad") return <path d="M42 64 q8 -6 16 0" stroke="var(--ink)" strokeWidth="3" fill="none" strokeLinecap="round" />;
  if (state === "surprised") return <ellipse cx="50" cy="63" rx="6" ry="7" fill="var(--ink)" opacity="0.85" />;
  if (state === "sleeping") return <ellipse cx="50" cy="63" rx="4" ry="5" fill="var(--ink)" opacity="0.6" />;
  const wide = state === "celebrate" || state === "excited" || state === "happy" || state === "jumping";
  return <path d={`M${wide ? 40 : 43} 61 q${wide ? 10 : 7} ${wide ? 12 : 8} ${wide ? 20 : 14} 0`} stroke="var(--ink)" strokeWidth="3.2" fill="none" strokeLinecap="round" />;
}

const PipBody = ({ state }: { state: AnimationState }) => (
  <g>
    <ellipse cx="50" cy="88" rx="26" ry="5" fill="var(--ink)" opacity="0.09" />
    <rect x="22" y="52" width="56" height="18" rx="9" fill="oklch(0.72 0.12 40)" opacity="0.9" />
    <path d="M28 30 q-6 -16 6 -14 q6 1 8 10 Z" fill="oklch(0.84 0.09 60)" />
    <path d="M72 30 q6 -16 -6 -14 q-6 1 -8 10 Z" fill="oklch(0.84 0.09 60)" />
    <ellipse cx="50" cy="52" rx="32" ry="30" fill="oklch(0.9 0.07 60)" />
    <ellipse cx="50" cy="60" rx="20" ry="16" fill="oklch(0.96 0.04 70)" />
    <circle cx="30" cy="60" r="6" fill="oklch(0.85 0.11 30)" opacity="0.55" />
    <circle cx="70" cy="60" r="6" fill="oklch(0.85 0.11 30)" opacity="0.55" />
    <ellipse cx="20" cy="62" rx="7" ry="6" fill="oklch(0.88 0.08 60)" />
    <ellipse cx="80" cy="62" rx="7" ry="6" fill="oklch(0.88 0.08 60)" />
    <ellipse cx="40" cy="82" rx="9" ry="5" fill="oklch(0.8 0.1 45)" />
    <ellipse cx="60" cy="82" rx="9" ry="5" fill="oklch(0.8 0.1 45)" />
    <Eyes sleeping={state === "sleeping"} surprised={state === "surprised"} />
    <Mouth state={state} />
    {state === "sleeping" && <text x="76" y="26" fontSize="16" fill="var(--ink)" opacity="0.5">z</text>}
  </g>
);

const MimiBody = ({ state }: { state: AnimationState }) => (
  <g>
    <ellipse cx="50" cy="90" rx="22" ry="4" fill="var(--ink)" opacity="0.08" />
    <path
      d="M50 12 L61 40 L92 44 L69 63 L76 92 L50 77 L24 92 L31 63 L8 44 L39 40 Z"
      fill="oklch(0.91 0.13 95)"
      stroke="oklch(0.82 0.14 85)"
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
    <Eyes sleeping={state === "sleeping"} surprised={state === "surprised"} cy={50} />
    <Mouth state={state} />
    <circle cx="34" cy="62" r="5" fill="oklch(0.85 0.11 30)" opacity="0.45" />
    <circle cx="66" cy="62" r="5" fill="oklch(0.85 0.11 30)" opacity="0.45" />
  </g>
);

const BoboBody = ({ state }: { state: AnimationState }) => (
  <g>
    <ellipse cx="50" cy="90" rx="24" ry="4" fill="var(--ink)" opacity="0.08" />
    <g fill="oklch(0.93 0.05 230)">
      <circle cx="34" cy="56" r="20" />
      <circle cx="62" cy="52" r="24" />
      <circle cx="50" cy="40" r="20" />
      <rect x="20" y="56" width="60" height="22" rx="11" />
    </g>
    <Eyes sleeping={state === "sleeping"} surprised={state === "surprised"} cy={50} />
    <Mouth state={state} />
    <circle cx="32" cy="62" r="5" fill="oklch(0.85 0.1 240)" opacity="0.5" />
    <circle cx="70" cy="62" r="5" fill="oklch(0.85 0.1 240)" opacity="0.5" />
  </g>
);

const LuluBody = ({ state }: { state: AnimationState }) => (
  <g>
    <ellipse cx="50" cy="90" rx="20" ry="4" fill="var(--ink)" opacity="0.08" />
    <g className={state === "sleeping" ? "" : "animate-drift"}>
      <ellipse cx="24" cy="44" rx="20" ry="22" fill="oklch(0.86 0.08 300)" transform="rotate(-18 24 44)" />
      <ellipse cx="76" cy="44" rx="20" ry="22" fill="oklch(0.89 0.09 165)" transform="rotate(18 76 44)" />
      <ellipse cx="28" cy="70" rx="14" ry="13" fill="oklch(0.88 0.09 340)" />
      <ellipse cx="72" cy="70" rx="14" ry="13" fill="oklch(0.9 0.1 95)" />
    </g>
    <rect x="42" y="30" width="16" height="52" rx="8" fill="oklch(0.78 0.09 290)" />
    <circle cx="50" cy="34" r="15" fill="oklch(0.84 0.08 290)" />
    <path d="M44 20 q-2 -10 4 -12" stroke="oklch(0.78 0.09 290)" strokeWidth="3" fill="none" strokeLinecap="round" />
    <path d="M56 20 q2 -10 -4 -12" stroke="oklch(0.78 0.09 290)" strokeWidth="3" fill="none" strokeLinecap="round" />
    <Eyes sleeping={state === "sleeping"} surprised={state === "surprised"} cx1={45} cx2={55} cy={33} />
    <g transform="translate(0,-22) scale(1)">
      <Mouth state={state} />
    </g>
  </g>
);

const TikoBody = ({ state }: { state: AnimationState }) => (
  <g>
    <ellipse cx="50" cy="90" rx="24" ry="4" fill="var(--ink)" opacity="0.08" />
    <line x1="50" y1="16" x2="50" y2="26" stroke="oklch(0.7 0.09 200)" strokeWidth="3" />
    <circle cx="50" cy="13" r="5" fill="oklch(0.78 0.13 25)" />
    <rect x="22" y="26" width="56" height="46" rx="18" fill="oklch(0.9 0.05 200)" stroke="oklch(0.78 0.07 205)" strokeWidth="2.5" />
    <rect x="30" y="36" width="40" height="26" rx="13" fill="oklch(0.4 0.06 250)" />
    <g fill="oklch(0.92 0.13 190)">
      {state === "sleeping" ? (
        <>
          <rect x="38" y="48" width="10" height="3" rx="1.5" />
          <rect x="54" y="48" width="10" height="3" rx="1.5" />
        </>
      ) : (
        <>
          <circle cx="43" cy="48" r={state === "surprised" ? 7 : 5.5} />
          <circle cx="59" cy="48" r={state === "surprised" ? 7 : 5.5} />
        </>
      )}
    </g>
    <rect x="14" y="42" width="9" height="20" rx="4.5" fill="oklch(0.82 0.06 205)" />
    <rect x="77" y="42" width="9" height="20" rx="4.5" fill="oklch(0.82 0.06 205)" />
    <rect x="34" y="72" width="12" height="12" rx="5" fill="oklch(0.78 0.07 205)" />
    <rect x="54" y="72" width="12" height="12" rx="5" fill="oklch(0.78 0.07 205)" />
    {state !== "sleeping" && state !== "sad" && (
      <path d="M42 64 q8 6 16 0" stroke="oklch(0.92 0.13 190)" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.8" />
    )}
  </g>
);

const BODIES: Record<CharacterId, (p: { state: AnimationState }) => React.JSX.Element> = {
  pip: PipBody,
  mimi: MimiBody,
  bobo: BoboBody,
  lulu: LuluBody,
  tiko: TikoBody,
};

function CharacterImpl({ id, state = "idle", size = 96, className = "" }: Props) {
  const Body = BODIES[id];
  const meta = CHARACTERS[id];
  return (
    <span
      className={`inline-block no-select ${stateClass[state]} ${className}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${meta.name}, ${state}`}
    >
      <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true">
        <Body state={state} />
      </svg>
    </span>
  );
}

export const Character = memo(CharacterImpl);
