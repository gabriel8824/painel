import { NextResponse } from "next/server";
import type { ApiEnvelope, Quote } from "@/lib/types";
import { fetchYahooMany } from "@/lib/yahoo";

export const revalidate = 120;

// Índices e commodities via Yahoo Finance.
const SYMBOLS: {
  yahoo: string;
  id: string;
  label: string;
  name: string;
  symbol: string;
  currency: string | null;
}[] = [
  { yahoo: "^BVSP", id: "BVP", label: "Ibovespa", name: "Brasil", symbol: "🇧🇷", currency: null },
  { yahoo: "^GSPC", id: "SPX", label: "S&P 500", name: "EUA", symbol: "🇺🇸", currency: null },
  { yahoo: "^IXIC", id: "NDQ", label: "Nasdaq", name: "EUA", symbol: "🇺🇸", currency: null },
  { yahoo: "CL=F", id: "OIL", label: "Petróleo WTI", name: "US$ / barril", symbol: "🛢️", currency: "USD" },
  { yahoo: "GC=F", id: "GOLD", label: "Ouro", name: "US$ / onça", symbol: "🥇", currency: "USD" },
];

export async function GET() {
  const data = await fetchYahooMany(SYMBOLS.map((s) => s.yahoo));

  const quotes: Quote[] = [];
  for (const meta of SYMBOLS) {
    const y = data.get(meta.yahoo);
    if (!y) continue;
    quotes.push({
      id: meta.id,
      label: meta.label,
      name: meta.name,
      value: y.price,
      currency: meta.currency,
      pct: y.pct,
      symbol: meta.symbol,
    });
  }

  const body: ApiEnvelope<Quote[]> = {
    data: quotes,
    updatedAt: new Date().toISOString(),
    errors: quotes.length ? undefined : ["Mercados indisponíveis no momento"],
  };
  return NextResponse.json(body);
}
