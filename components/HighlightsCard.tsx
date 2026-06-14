"use client";

import { useMemo } from "react";
import { useAutoRefresh } from "./useAutoRefresh";
import type { NewsItem } from "@/lib/types";
import { relativeTime } from "@/lib/format";

const CAT_COLOR: Record<NewsItem["category"], string> = {
  finanças: "var(--up)",
  mundo: "var(--accent)",
  brasil: "var(--gold)",
};

// A API entrega em ordem CRONOLÓGICA — aqui ordenamos por importância.
function selectTop(items: NewsItem[]): NewsItem[] {
  const byImp = (a: NewsItem, b: NewsItem) =>
    b.importance - a.importance ||
    +new Date(b.publishedAt) - +new Date(a.publishedAt);
  const important = items.filter((n) => n.tier !== "normal").sort(byImp);
  let top = important;
  if (top.length < 4) {
    const fillers = items.filter((n) => n.tier === "normal").sort(byImp);
    top = [...important, ...fillers].slice(0, 6);
  }
  return top.slice(0, 8); // teto para o loop não ficar longo demais
}

function Badge({ tier }: { tier: NewsItem["tier"] }) {
  if (tier === "urgent")
    return <span className="news-badge badge-urgent">⚡ URGENTE</span>;
  if (tier === "highlight")
    return <span className="news-badge badge-hl">DESTAQUE</span>;
  return null;
}

function Entry({ n }: { n: NewsItem }) {
  const cat = CAT_COLOR[n.category];
  const urgent = n.tier === "urgent";
  return (
    <li
      className="border-b border-l-2 border-b-[var(--panel-edge)] px-5 py-4"
      style={{ borderLeftColor: cat }}
    >
      <div className="flex items-center gap-2">
        <Badge tier={n.tier} />
        <span
          className="font-mono text-[0.62rem] font-bold uppercase tracking-wider"
          style={{ color: cat }}
        >
          {n.source}
        </span>
        <span className="ml-auto text-xs text-[var(--ink-faint)]">
          {relativeTime(n.publishedAt)}
        </span>
      </div>
      <p
        className={`mt-2 font-display leading-snug text-[var(--ink)] line-clamp-3 ${
          urgent
            ? "text-[1.15rem] font-extrabold xl:text-[1.25rem]"
            : "text-[1.05rem] font-semibold xl:text-[1.15rem]"
        }`}
        style={urgent ? { textShadow: "0 0 20px rgba(255,255,255,0.10)" } : undefined}
      >
        {n.title}
      </p>
    </li>
  );
}

export function HighlightsCard() {
  const { data, loading } = useAutoRefresh<NewsItem[]>("/api/news", 5 * 60 * 1000);
  const top = useMemo(() => selectTop(data ?? []), [data]);
  const animate = top.length >= 3; // <3 itens: estático (loop curto piscaria)

  return (
    <aside className="vmarquee panel rise flex h-full w-full flex-col">
      <div className="flex shrink-0 items-center gap-2.5 border-b border-[var(--panel-edge)] px-5 py-4">
        <span className="live-dot inline-block h-2.5 w-2.5 rounded-full bg-[var(--down)]" />
        <span className="panel-title">Mais importantes</span>
        <span className="ml-auto font-mono text-xs text-[var(--ink-faint)]">
          {top.length}
        </span>
      </div>

      <div
        className="relative flex-1 overflow-hidden"
        style={{
          maskImage:
            "linear-gradient(180deg, transparent 0, #000 36px, #000 calc(100% - 36px), transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(180deg, transparent 0, #000 36px, #000 calc(100% - 36px), transparent 100%)",
        }}
      >
        {loading && top.length === 0 ? (
          <div className="px-5 py-6 text-sm text-[var(--ink-faint)]">
            carregando destaques…
          </div>
        ) : top.length === 0 ? (
          <div className="px-5 py-6 text-sm text-[var(--ink-faint)]">
            sem destaques no momento
          </div>
        ) : (
          <ul className={animate ? "vmarquee-track flex flex-col" : "flex flex-col"}>
            {(animate ? [...top, ...top] : top).map((n, i) => (
              <Entry key={`${i}-${n.link}`} n={n} />
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
