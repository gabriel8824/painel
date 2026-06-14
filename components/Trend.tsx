import { formatPct, trendOf } from "@/lib/format";

export function Trend({
  pct,
  size = "sm",
}: {
  pct: number | null;
  size?: "sm" | "lg";
}) {
  const t = trendOf(pct);
  const arrow = t === "up" ? "▲" : t === "down" ? "▼" : "—";
  const cls = t === "up" ? "up" : t === "down" ? "down" : "flat";
  const text = size === "lg" ? "text-lg" : "text-sm";
  return (
    <span className={`font-mono font-semibold ${cls} ${text} inline-flex items-center gap-1`}>
      <span className="text-[0.75em]">{arrow}</span>
      {formatPct(pct)}
    </span>
  );
}
