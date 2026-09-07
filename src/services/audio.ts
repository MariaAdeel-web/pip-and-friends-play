/**
 * Child-friendly sound service.
 * Uses the WebAudio API for gentle synthesized tones (no heavy audio files)
 * and the SpeechSynthesis API for optional voice feedback.
 */

type Tone = { freq: number; dur: number; delay: number; type?: OscillatorType };

const STORAGE_KEY = "tinytales.sound";

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export function isSoundOn(): boolean {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(STORAGE_KEY) !== "off";
}

export function setSoundOn(on: boolean) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, on ? "on" : "off");
  window.dispatchEvent(new Event("tinytales:sound"));
}

function playTones(tones: Tone[], volume = 0.14) {
  if (!isSoundOn()) return;
  const audio = getCtx();
  if (!audio) return;
  const now = audio.currentTime;
  for (const t of tones) {
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = t.type ?? "sine";
    osc.frequency.value = t.freq;
    gain.gain.setValueAtTime(0.0001, now + t.delay);
    gain.gain.exponentialRampToValueAtTime(volume, now + t.delay + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + t.delay + t.dur);
    osc.connect(gain);
    gain.connect(audio.destination);
    osc.start(now + t.delay);
    osc.stop(now + t.delay + t.dur + 0.05);
  }
}

const NOTES: Record<string, number> = {
  C4: 261.6, D4: 293.7, E4: 329.6, F4: 349.2, G4: 392.0, A4: 440.0, B4: 493.9,
  C5: 523.3, D5: 587.3, E5: 659.3, F5: 698.5, G5: 784.0, A5: 880.0, C6: 1046.5,
};

export const sounds = {
  tap: () => playTones([{ freq: NOTES.E5, dur: 0.08, delay: 0 }], 0.09),
  pop: () => playTones([{ freq: NOTES.G5, dur: 0.1, delay: 0 }], 0.1),
  correct: () =>
    playTones([
      { freq: NOTES.E5, dur: 0.14, delay: 0 },
      { freq: NOTES.G5, dur: 0.14, delay: 0.1 },
      { freq: NOTES.C6, dur: 0.24, delay: 0.2 },
    ]),
  retry: () =>
    playTones([
      { freq: NOTES.D4, dur: 0.16, delay: 0 },
      { freq: NOTES.C4, dur: 0.2, delay: 0.12 },
    ], 0.1),
  celebrate: () =>
    playTones([
      { freq: NOTES.C5, dur: 0.14, delay: 0 },
      { freq: NOTES.E5, dur: 0.14, delay: 0.12 },
      { freq: NOTES.G5, dur: 0.14, delay: 0.24 },
      { freq: NOTES.C6, dur: 0.4, delay: 0.36 },
    ], 0.15),
  star: () => playTones([{ freq: NOTES.A5, dur: 0.12, delay: 0 }, { freq: NOTES.C6, dur: 0.2, delay: 0.08 }], 0.11),
  note: (name: keyof typeof NOTES | number) =>
    playTones([{ freq: typeof name === "number" ? name : NOTES[name] ?? 440, dur: 0.35, delay: 0, type: "triangle" }], 0.13),
  drum: () => playTones([{ freq: 90, dur: 0.18, delay: 0, type: "sine" }], 0.3),
  bell: () => playTones([{ freq: 1200, dur: 0.5, delay: 0, type: "sine" }], 0.08),
};

export { NOTES };

/* ---------------- Voice narration ----------------
 * Real AI voice (Lovable AI) with the device's built-in speech as a fallback.
 * Each phrase is fetched once and reused, so repeated prompts are instant. */

const voiceCache = new Map<string, Promise<string>>();
let aiVoiceAvailable = true;
let currentAudio: HTMLAudioElement | null = null;
let sayToken = 0;

async function fetchVoice(text: string): Promise<string> {
  const cached = voiceCache.get(text);
  if (cached) return cached;
  const p = (async () => {
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) throw new Error(`voice ${res.status}`);
    const blob = await res.blob();
    if (!blob.size) throw new Error("empty voice");
    return URL.createObjectURL(blob);
  })();
  voiceCache.set(text, p);
  p.catch(() => voiceCache.delete(text));
  return p;
}

function speakFallback(text: string, opts: { rate?: number; pitch?: number }) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = opts.rate ?? 0.85;
    utter.pitch = opts.pitch ?? 1.35;
    utter.volume = 0.9;
    window.speechSynthesis.speak(utter);
  } catch {
    /* voice is a progressive enhancement */
  }
}

/** Warm the cache so a phrase plays instantly when it is needed. */
export function prefetchSay(...texts: string[]) {
  if (typeof window === "undefined" || !aiVoiceAvailable || !isSoundOn()) return;
  for (const t of texts) if (t) void fetchVoice(t).catch(() => undefined);
}

/** Gentle voice feedback. Silently no-ops where unsupported. */
export function say(text: string, opts: { rate?: number; pitch?: number } = {}) {
  if (!isSoundOn()) return;
  if (typeof window === "undefined") return;

  const token = ++sayToken;
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();

  if (!aiVoiceAvailable) {
    speakFallback(text, opts);
    return;
  }

  void fetchVoice(text)
    .then((url) => {
      if (token !== sayToken || !isSoundOn()) return;
      const audio = new Audio(url);
      audio.volume = 0.95;
      currentAudio = audio;
      return audio.play().catch(() => {
        // Autoplay blocked before the first tap — fall back quietly.
        speakFallback(text, opts);
      });
    })
    .catch(() => {
      aiVoiceAvailable = false;
      if (token === sayToken) speakFallback(text, opts);
    });
}


export const PRAISE = ["Great job!", "Wonderful!", "You found it!", "Super!", "Amazing!"];
export const ENCOURAGE = ["Let's try again!", "Almost! Try another one.", "Keep going!"];

export const randomPraise = () => PRAISE[Math.floor(Math.random() * PRAISE.length)];
export const randomEncourage = () => ENCOURAGE[Math.floor(Math.random() * ENCOURAGE.length)];
