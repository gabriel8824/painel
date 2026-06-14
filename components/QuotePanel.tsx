import type { Quote } from "@/lib/types";
import { formatCurrency, formatNumber } from "@/lib/format";
import { Trend } from "./Trend";

function valueText(q: Quote): string {
  if (q.currency) {
    // valores muito grandes (AOA, Bitcoin) sem casas decimais para caber
    const big = q.value >= 1000;
    return formatCurrency(q.value, q.currency, big ? { maximumFractionDigits: 0 } : {});
  }
  return formatNumber(q.value, q.value >= 1000 ? 0 : 2);
}

export function QuotePanel({
  title,
  icon,
  quotes,
  loading,
  delay = 0,
}: {
  title: string;
  icon?: string;
  quotes: Quote[];
  loading?: boolean;
  delay?: number;
}) {
  return (
    <section
      className="panel rise flex flex-col p-5"
      style={{ animationDelay: `${delay}ms` }}
    >
      <header className="mb-3 flex items-center gap-2">
        {icon && <span className="text-base">{icon}</span>}
        <h2 className="panel-title">{title}</h2>
      </header>

      <div className="flex flex-1 flex-col justify-between divide-y divide-[var(--panel-edge)]">
        {loading && quotes.length === 0
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between py-3">
                <div className="h-3 w-24 animate-pulse rounded bg-[var(--bg-2)]" />
                <div className="h-3 w-16 animate-pulse rounded bg-[var(--bg-2)]" />
              </div>
            ))
          : quotes.map((q) => (
              <div key={q.id} className="flex items-center justify-between gap-3 py-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-lg">{q.symbol}</span>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-[var(--ink)]">
                      {q.label}
                    </div>
                    <div className="truncate text-xs text-[var(--ink-faint)]">
                      {q.name}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="font-mono text-base font-semibold tabular-nums">
                    {valueText(q)}
                  </span>
                  <Trend pct={q.pct} />
                </div>
              </div>
            ))}
        {!loading && quotes.length === 0 && (
          <div className="py-6 text-center text-xs text-[var(--ink-faint)]">
            sem dados no momento
          </div>
        )}
      </div>
    </section>
  );
}
