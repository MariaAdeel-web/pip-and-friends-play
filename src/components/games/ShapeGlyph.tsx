import type { ShapeKey } from "@/data/content";

const PATHS: Record<ShapeKey, string> = {
  circle: "M50 8 a42 42 0 1 0 0.1 0 Z",
  square: "M12 12 h76 a6 6 0 0 1 6 6 v64 a6 6 0 0 1 -6 6 h-76 a6 6 0 0 1 -6 -6 v-64 a6 6 0 0 1 6 -6 Z",
  triangle: "M50 8 L94 88 H6 Z",
  rectangle: "M6 24 h88 a6 6 0 0 1 6 6 v40 a6 6 0 0 1 -6 6 h-88 a6 6 0 0 1 -6 -6 v-40 a6 6 0 0 1 6 -6 Z",
  star: "M50 6 L61 38 L95 38 L67 58 L78 92 L50 71 L22 92 L33 58 L5 38 L39 38 Z",
  heart: "M50 90 C10 62, 6 30, 28 20 C40 14, 50 24, 50 32 C50 24, 60 14, 72 20 C94 30, 90 62, 50 90 Z",
  oval: "M50 10 a34 40 0 1 0 0.1 0 Z",
};

export function ShapeGlyph({
  shape,
  fill,
  size = 84,
  outline = false,
  className = "",
}: {
  shape: ShapeKey;
  fill?: string;
  size?: number;
  outline?: boolean;
  className?: string;
}) {
  return (
    <svg viewBox="-4 -4 108 108" width={size} height={size} className={className} aria-hidden="true">
      <path
        d={PATHS[shape]}
        fill={outline ? "transparent" : (fill ?? "var(--primary)")}
        stroke={outline ? "var(--muted-foreground)" : "oklch(0 0 0 / 0.08)"}
        strokeWidth={outline ? 4 : 2}
        strokeDasharray={outline ? "8 7" : undefined}
        strokeLinejoin="round"
      />
    </svg>
  );
}
