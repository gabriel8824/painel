"use client";

import { useAutoRefresh } from "./useAutoRefresh";
import type { NewsItem } from "@/lib/types";
import { relativeTime } from "@/lib/format";

const CAT_COLOR: Record<NewsItem["category"], string> = {
  finanças: "var(--up)",
  mundo: "var(--accent)",
  brasil: "var(--gold)",
};

function Badge({ tier }: { tier: NewsItem["tier"] }) {
  if (tier === "urgent")
    return <span className="news-badge badge-urgent">⚡ URGENTE</span>;
  if (tier === "highlight")
    return <span className="news-badge badge-hl">DESTAQUE</span>;
  return null;
}

function Item({ n }: { n: NewsItem }) {
  const cat = CAT_COLOR[n.category];
  const urgent = n.tier === "urgent";
  const highlight = n.tier === "highlight";
  const emphasized = urgent || highlight;

  const titleCls = urgent
    ? "font-display text-[1.6rem] font-extrabold text-[var(--ink)]"
    : highlight
      ? "font-display text-[1.3rem] font-semibold leading-tight text-[var(--ink)]"
      : "text-sm font-normal text-[var(--ink-dim)]";

  return (
    <span className="mx-6 inline-flex items-center gap-3 align-middle">
      {emphasized && (
        <span
          aria-hidden
          className="mr-1 inline-block h-[18px] w-px"
          style={{ background: "var(--panel-edge)" }}
        />
      )}
      <span
        className={`inline-block shrink-0 rounded-full ${
          urgent ? "live-dot h-[11px] w-[11px]" : emphasized ? "h-[9px] w-[9px]" : "h-1.5 w-1.5"
        }`}
        style={{
          background: cat,
          boxShadow: emphasized ? `0 0 10px ${cat}` : undefined,
        }}
      />
      <Badge tier={n.tier} />
      <span
        className={`font-bold uppercase tracking-wider ${
          emphasized ? "text-xs" : "text-[0.62rem] opacity-70"
        }`}
        style={{ color: cat }}
      >
        {n.source}
      </span>
      <span
        className={titleCls}
        style={urgent ? { textShadow: "0 0 20px rgba(255,255,255,0.10)" } : undefined}
      >
        {n.title}
      </span>
      <span className="text-xs text-[var(--ink-faint)]">
        {relativeTime(n.publishedAt)}
      </span>
      <span className="ml-1 text-[var(--ink-faint)]">•</span>
    </span>
  );
}

export function NewsTicker() {
  const { data, loading } = useAutoRefresh<NewsItem[]>("/api/news", 5 * 60 * 1000);
  const items = data ?? [];

  return (
    <div className="panel marquee flex min-h-[68px] items-center overflow-hidden py-4">
      <div className="flex shrink-0 items-center gap-2 border-r border-[var(--panel-edge)] px-5">
        <span className="live-dot inline-block h-2.5 w-2.5 rounded-full bg-[var(--up)]" />
        <span className="panel-title">Notícias</span>
      </div>
      <div className="relative flex-1 overflow-hidden">
        {loading && items.length === 0 ? (
          <span className="px-6 text-sm text-[var(--ink-faint)]">
            carregando manchetes…
          </span>
        ) : (
          <div className="marquee-track">
            {[...items, ...items].map((n, i) => (
              <Item key={`${i}-${n.link}`} n={n} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
