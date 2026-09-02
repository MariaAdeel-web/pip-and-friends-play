/**
 * Shared game chrome + feedback plumbing so every mini-game behaves the same:
 * prompt from a character, gentle right/wrong feedback, round progress, and a
 * short celebration on completion.
 */

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useParams } from "@tanstack/react-router";
import { Character, type CharacterId, type AnimationState } from "@/components/characters/Character";
import { BackBar, BigButton, Confetti, ProgressDots, Sparkles } from "@/components/ui/Kit";
import { DAILY_PATH } from "@/data/content";
import { randomEncourage, randomPraise, say, sounds } from "@/services/audio";
import { completeActivity, completePathStep, recordAttempt, type Learned, type SkillKey } from "@/services/progress";


export type Feedback = "none" | "correct" | "retry";

export function useGameRound(opts: {
  skill: SkillKey;
  rounds: number;
  onFinishLearned?: () => Learned;
}) {
  const { skill, rounds } = opts;
  const [round, setRound] = useState(0);
  const [feedback, setFeedback] = useState<Feedback>("none");
  const [message, setMessage] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  };

  const answer = useCallback(
    (correct: boolean, opts2?: { praise?: string; onAdvance?: () => void }) => {
      recordAttempt(skill, correct);
      if (correct) {
        sounds.correct();
        const praise = opts2?.praise ?? randomPraise();
        setMessage(praise);
        setFeedback("correct");
        say(praise);
        later(() => {
          setFeedback("none");
          setMessage(null);
          setRound((r) => {
            const next = r + 1;
            if (next >= rounds) setDone(true);
            return next;
          });
          opts2?.onAdvance?.();
        }, 1300);
      } else {
        sounds.retry();
        const enc = randomEncourage();
        setMessage(enc);
        setFeedback("retry");
        say(enc);
        later(() => {
          setFeedback("none");
          setMessage(null);
        }, 1100);
      }
    },
    [rounds, skill],
  );

  const restart = useCallback(() => {
    setRound(0);
    setDone(false);
    setFeedback("none");
    setMessage(null);
  }, []);

  return { round, feedback, message, done, answer, restart, setDone };
}

export function GamePage({
  title,
  character,
  prompt,
  characterState = "idle",
  feedback = "none",
  message,
  rounds,
  round,
  children,
  onPromptTap,
}: {
  title: string;
  character: CharacterId;
  prompt: ReactNode;
  characterState?: AnimationState;
  feedback?: Feedback;
  message?: string | null;
  rounds?: number;
  round?: number;
  children: ReactNode;
  onPromptTap?: () => void;
}) {
  const state: AnimationState =
    feedback === "correct" ? "celebrate" : feedback === "retry" ? "thinking" : characterState;

  return (
    <div className="relative mx-auto w-full max-w-lg px-4 pb-6">
      <BackBar title={title} />
      <div className="relative flex items-center gap-3 rounded-[1.75rem] bg-card p-4 shadow-[var(--shadow-soft)]">
        <button
          type="button"
          onClick={onPromptTap}
          aria-label="Hear the instruction again"
          className="tap-pop shrink-0"
        >
          <Character id={character} state={state} size={76} />
        </button>
        <div className="min-w-0 flex-1">
          <div className="text-lg font-bold leading-snug font-display">{message ?? prompt}</div>
          {rounds != null && round != null && (
            <div className="mt-2">
              <ProgressDots total={rounds} done={round} />
            </div>
          )}
        </div>
        <Sparkles show={feedback === "correct"} />
      </div>
      <div className="mt-5">{children}</div>
    </div>
  );
}

export function CompleteScreen({
  title,
  character,
  skill,
  learned,
  xp = 10,
  onPlayAgain,
}: {
  title: string;
  character: CharacterId;
  skill: SkillKey;
  learned?: Learned;
  xp?: number;
  onPlayAgain: () => void;
}) {
  const params = useParams({ strict: false }) as { gameId?: string };
  const gameId = params.gameId;
  const saved = useRef(false);
  useEffect(() => {
    if (saved.current) return;
    saved.current = true;
    completeActivity({ skill, xp, learned, stars: 3, gems: 1 });
    // Today's adventure only ticks when the matching activity is truly finished.
    const step = DAILY_PATH.find((s) => s.gameId === gameId);
    if (step) completePathStep(step.step);
    sounds.celebrate();
    say("Amazing! You did it!");
  }, [gameId, learned, skill, xp]);


  return (
    <div className="relative mx-auto flex min-h-[70vh] w-full max-w-lg flex-col items-center justify-center gap-4 px-6 text-center">
      <Confetti show />
      <Character id={character} state="celebrate" size={150} />
      <h2 className="text-2xl font-extrabold">Amazing! {title} complete!</h2>
      <div className="flex gap-2 text-lg font-bold">
        <span className="rounded-full bg-sunshine/60 px-4 py-2">+{xp} XP</span>
        <span className="rounded-full bg-mint/60 px-4 py-2">⭐ 3</span>
        <span className="rounded-full bg-lavender/60 px-4 py-2">💎 1</span>
      </div>
      <div className="mt-2 flex w-full flex-col gap-3">
        <BigButton onClick={onPlayAgain}>Play again</BigButton>
        <Link to="/play" className="tap-pop min-h-14 rounded-3xl bg-card px-6 py-4 text-lg font-bold font-display shadow-[var(--shadow-soft)]">
          More activities
        </Link>
      </div>
    </div>
  );
}
