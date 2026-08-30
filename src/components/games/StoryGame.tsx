import { useEffect, useState } from "react";
import { STORIES, shuffle, type Story } from "@/data/content";
import { BackBar, BigButton, Card, Confetti } from "@/components/ui/Kit";
import { Character } from "@/components/characters/Character";
import { say, sounds } from "@/services/audio";
import { completeActivity, recordAttempt } from "@/services/progress";

export function StoryGame() {
  const [story, setStory] = useState<Story | null>(null);
  const [page, setPage] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [wobble, setWobble] = useState<string | null>(null);

  useEffect(() => {
    if (story && page < story.pages.length) say(story.pages[page].text);
  }, [story, page]);

  if (!story) {
    return (
      <div className="mx-auto w-full max-w-lg px-4 pb-8">
        <BackBar title="Story Time" />
        <Card className="mb-4 flex items-center gap-3">
          <Character id="mimi" state="happy" size={70} />
          <p className="text-lg font-bold font-display">Pick a story to hear!</p>
        </Card>
        <div className="flex flex-col gap-3">
          {STORIES.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => {
                sounds.tap();
                setStory(s);
                setPage(0);
                setAnswered(false);
              }}
              className="tap-pop flex items-center gap-3 rounded-[1.75rem] bg-card p-4 text-left shadow-[var(--shadow-soft)]"
            >
              <Character id={s.hero} state="idle" size={58} />
              <span className="text-base font-bold leading-tight font-display">{s.title}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const atQuestion = page >= story.pages.length;

  if (answered) {
    return (
      <div className="relative mx-auto flex min-h-[70vh] w-full max-w-lg flex-col items-center justify-center gap-4 px-6 text-center">
        <Confetti show />
        <Character id={story.hero} state="celebrate" size={140} />
        <h2 className="text-2xl font-extrabold">The End. Lovely listening!</h2>
        <BigButton
          onClick={() => {
            setStory(null);
            setAnswered(false);
          }}
        >
          Another story
        </BigButton>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-lg px-4 pb-8">
      <BackBar title="Story Time" />

      <Card className="min-h-[46vh]">
        <div className="flex flex-col items-center gap-4 text-center">
          <Character id={story.hero} state={atQuestion ? "thinking" : "happy"} size={110} />
          {!atQuestion ? (
            <>
              <span className="animate-pop-in text-6xl">{story.pages[page].emoji}</span>
              <p className="text-lg font-bold leading-snug font-display">{story.pages[page].text}</p>
            </>
          ) : (
            <>
              <p className="text-lg font-bold font-display">{story.question.prompt}</p>
              <div className="flex w-full flex-col gap-3">
                {shuffle(story.question.options).map((o) => (
                  <button
                    key={o}
                    type="button"
                    onClick={() => {
                      const correct = o === story.question.answer;
                      recordAttempt("memory", correct);
                      if (correct) {
                        sounds.celebrate();
                        say("That's right!");
                        completeActivity({ skill: "memory", xp: 12, stars: 2 });
                        setAnswered(true);
                      } else {
                        sounds.retry();
                        say("Let's try again!");
                        setWobble(o);
                        setTimeout(() => setWobble(null), 600);
                      }
                    }}
                    className={`tap-pop min-h-14 rounded-3xl bg-muted px-5 text-lg font-bold font-display ${
                      wobble === o ? "animate-wiggle" : ""
                    }`}
                  >
                    {o}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </Card>

      {!atQuestion && (
        <div className="mt-4 flex items-center gap-3">
          <BigButton tone="soft" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="disabled:opacity-40">
            ←
          </BigButton>
          <BigButton className="flex-1" onClick={() => setPage((p) => p + 1)}>
            {page === story.pages.length - 1 ? "One question →" : "Next →"}
          </BigButton>
        </div>
      )}
    </div>
  );
}
