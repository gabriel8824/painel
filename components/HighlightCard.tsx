import type { Quote } from "@/lib/types";
import { formatCurrency, formatNumber, trendOf } from "@/lib/format";
import { Trend } from "./Trend";

export function HighlightCard({ q, delay = 0 }: { q: Quote; delay?: number }) {
  const t = trendOf(q.pct);
  const glow = t === "up" ? "glow-up" : t === "down" ? "glow-down" : "";
  // valores grandes (ex. Kwanza) sem decimais para caber no card
  const big = q.value >= 100;
  const value = q.currency
    ? formatCurrency(q.value, q.currency, big ? { maximumFractionDigits: 0 } : {})
    : formatNumber(q.value, big ? 0 : 2);

  return (
    <div
      className="panel rise flex h-full flex-col justify-between p-6 xl:p-7"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div
        aria-hidden
        className="absolute -right-6 -top-8 text-[7rem] leading-none opacity-[0.07] xl:text-[9rem]"
      >
        {q.symbol}
      </div>
      <div className="flex items-center justify-between">
        <span className="panel-title">{q.label}</span>
        <Trend pct={q.pct} size="lg" />
      </div>
      <div className="mt-4">
        <div
          className={`font-mono text-4xl font-bold leading-none tracking-tight sm:text-5xl 2xl:text-7xl ${glow}`}
        >
          {value}
        </div>
        <div className="mt-3 text-sm text-[var(--ink-dim)]">{q.name}</div>
      </div>
    </div>
  );
}
