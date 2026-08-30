import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { BottomNav } from "@/components/navigation/BottomNav";
import { LoadingWorld } from "@/components/LoadingWorld";
import { Character } from "@/components/characters/Character";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <Character id="bobo" state="surprised" size={130} />
      <h1 className="text-2xl font-extrabold text-foreground">This page floated away</h1>
      <p className="text-sm text-muted-foreground">Let's go back to the learning world.</p>
      <Link
        to="/"
        className="tap-pop inline-flex min-h-14 items-center rounded-3xl bg-primary px-6 text-lg font-bold text-primary-foreground"
      >
        Go home
      </Link>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <Character id="tiko" state="sad" size={120} />
      <h1 className="text-xl font-extrabold text-foreground">This page didn't load</h1>
      <p className="text-sm text-muted-foreground">Let's try that again.</p>
      <div className="flex flex-wrap justify-center gap-2">
        <button
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="tap-pop inline-flex min-h-14 items-center rounded-3xl bg-primary px-6 text-lg font-bold text-primary-foreground"
        >
          Try again
        </button>
        <a
          href="/"
          className="tap-pop inline-flex min-h-14 items-center rounded-3xl border border-input bg-card px-6 text-lg font-bold text-foreground"
        >
          Go home
        </a>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#fdf8ef" },
      { title: "TinyTales Learning World" },
      { name: "description", content: "Playful learning games for ages 2-5." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Nunito:wght@500;700;800&display=swap",
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const [loading, setLoading] = useState(true);

  return (
    <QueryClientProvider client={queryClient}>
      {loading && <LoadingWorld onDone={() => setLoading(false)} />}
      <div className="min-h-screen pb-28">
        <main>
          {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
          <Outlet />
        </main>
      </div>
      <BottomNav />
    </QueryClientProvider>
  );
}
