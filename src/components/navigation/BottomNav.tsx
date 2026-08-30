import { Link, useRouterState } from "@tanstack/react-router";
import { sounds } from "@/services/audio";

const ITEMS = [
  { to: "/", label: "Home", icon: "🏠" },
  { to: "/play", label: "Play", icon: "🎮" },
  { to: "/worlds", label: "Worlds", icon: "🗺️" },
  { to: "/rewards", label: "Rewards", icon: "⭐" },
  { to: "/parents", label: "Parents", icon: "👨‍👩‍👧" },
] as const;

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav
      aria-label="Main"
      className="safe-bottom fixed inset-x-0 bottom-0 z-40 mx-auto flex max-w-lg justify-around border-t border-border bg-card/95 px-2 pt-2 backdrop-blur"
    >
      {ITEMS.map((item) => {
        const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={() => sounds.tap()}
            aria-current={active ? "page" : undefined}
            className={`tap-pop flex min-h-14 min-w-14 flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl px-1 py-1 text-[0.65rem] font-bold ${
              active ? "bg-primary/15 text-primary" : "text-muted-foreground"
            }`}
          >
            <span className="text-2xl leading-none">{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
