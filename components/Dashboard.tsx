"use client";

import { useAutoRefresh } from "./useAutoRefresh";
import { HighlightCard } from "./HighlightCard";
import { ReturnCard } from "./ReturnCard";
import { QuotePanel } from "./QuotePanel";
import type { Quote } from "@/lib/types";

function pick(quotes: Quote[], ids: string[]): Quote[] {
  const map = new Map(quotes.map((q) => [q.id, q]));
  return ids.map((id) => map.get(id)).filter((q): q is Quote => !!q);
}

export function Dashboard() {
  const rates = useAutoRefresh<Quote[]>("/api/rates", 60 * 1000);
  const crypto = useAutoRefresh<Quote[]>("/api/crypto", 60 * 1000);
  const markets = useAutoRefresh<Quote[]>("/api/markets", 2 * 60 * 1000);

  const r = rates.data ?? [];
  const hero = pick(r, ["USD-BRL", "USD-AOA"]);
  const moedas = pick(r, ["EUR-BRL", "GBP-BRL", "BRL-AOA"]);

  const m = markets.data ?? [];
  const indices = pick(m, ["BVP", "SPX", "NDQ"]);
  const commodities = pick(m, ["OIL", "GOLD"]);

  return (
    <div className="flex h-full flex-col gap-4 xl:gap-5">
      {/* Destaque: Dólar, Kwanza e contagem para voltar ao Brasil */}
      <div className="grid grid-cols-1 auto-rows-[9rem] gap-4 sm:grid-cols-2 xl:grid-cols-3 xl:auto-rows-[10rem] xl:gap-5 2xl:auto-rows-[12rem]">
        {hero.length > 0
          ? hero.map((q, i) => (
              <HighlightCard key={q.id} q={q} delay={i * 90} />
            ))
          : Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="panel h-full animate-pulse rise"
                style={{ animationDelay: `${i * 90}ms` }}
              />
            ))}
        <ReturnCard />
      </div>

      {/* Grade de painéis */}
      <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[minmax(0,1fr)] gap-4 md:grid-cols-2 md:grid-rows-2 xl:grid-cols-4 xl:grid-rows-[minmax(0,1fr)] xl:gap-5">
        <QuotePanel
          title="Moedas"
          icon="💱"
          quotes={moedas}
          loading={rates.loading}
          delay={180}
        />
        <QuotePanel
          title="Criptomoedas"
          icon="🪙"
          quotes={crypto.data ?? []}
          loading={crypto.loading}
          delay={250}
        />
        <QuotePanel
          title="Índices"
          icon="📈"
          quotes={indices}
          loading={markets.loading}
          delay={320}
        />
        <QuotePanel
          title="Commodities"
          icon="🛢️"
          quotes={commodities}
          loading={markets.loading}
          delay={390}
        />
      </div>
    </div>
  );
}
