import { createFileRoute } from "@tanstack/react-router";

/**
 * Short child-friendly voice lines, generated with Lovable AI.
 * Returns a small MP3 the browser can cache and replay.
 */
export const Route = createFileRoute("/api/tts")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env["LOVABLE_API_KEY"];
        if (!key) return new Response("Voice is not configured", { status: 500 });

        let text = "";
        let voice = "shimmer";
        try {
          const body = (await request.json()) as { text?: unknown; voice?: unknown };
          if (typeof body.text === "string") text = body.text.trim().slice(0, 300);
          if (typeof body.voice === "string") voice = body.voice;
        } catch {
          return new Response("Invalid request", { status: 400 });
        }
        if (!text) return new Response("Missing text", { status: 400 });

        const res = await fetch("https://ai.gateway.lovable.dev/v1/audio/speech", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "openai/gpt-4o-mini-tts",
            input: text,
            voice,
            response_format: "mp3",
            instructions:
              "Speak like a warm, cheerful preschool teacher talking to a 3-year-old: slow, clear, playful and encouraging.",
          }),
        });

        if (!res.ok) {
          const detail = await res.text().catch(() => "");
          return new Response(detail || "Voice failed", { status: res.status });
        }

        return new Response(res.body, {
          headers: {
            "Content-Type": "audio/mpeg",
            "Cache-Control": "public, max-age=86400",
          },
        });
      },
    },
  },
});
