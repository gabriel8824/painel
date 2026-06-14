// Helper para o endpoint público de chart do Yahoo Finance.
// Funciona sem chave; retorna preço atual + fechamento anterior (para variação).

export interface YahooQuote {
  symbol: string;
  price: number;
  prevClose: number;
  currency: string;
  pct: number | null;
}

export async function fetchYahoo(symbol: string): Promise<YahooQuote | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
      symbol,
    )}?interval=1d&range=2d`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 PainelDashboard" },
      next: { revalidate: 60 },
    });
    if (!res.ok) throw new Error(`yahoo ${symbol} ${res.status}`);
    const json = (await res.json()) as {
      chart: { result: { meta: Record<string, number | string> }[] };
    };
    const m = json.chart?.result?.[0]?.meta;
    if (!m) return null;
    const price = Number(m.regularMarketPrice);
    const prevClose = Number(m.chartPreviousClose ?? m.previousClose ?? price);
    if (!Number.isFinite(price) || price <= 0) return null;
    const pct =
      Number.isFinite(prevClose) && prevClose > 0
        ? ((price - prevClose) / prevClose) * 100
        : null;
    return {
      symbol,
      price,
      prevClose,
      currency: String(m.currency ?? ""),
      pct,
    };
  } catch {
    return null;
  }
}

/** Busca vários símbolos do Yahoo em paralelo. */
export async function fetchYahooMany(
  symbols: string[],
): Promise<Map<string, YahooQuote>> {
  const results = await Promise.all(symbols.map(fetchYahoo));
  const map = new Map<string, YahooQuote>();
  results.forEach((q, i) => {
    if (q) map.set(symbols[i], q);
  });
  return map;
}
