import { NextResponse } from "next/server";
import type { ApiEnvelope, Quote } from "@/lib/types";
import { fetchYahoo } from "@/lib/yahoo";

export const revalidate = 60;

// Cripto via Binance (preço + variação 24h), convertido para BRL.
interface BinanceTicker {
  symbol: string;
  lastPrice: string;
  priceChangePercent: string;
}

export async function GET() {
  try {
    const [tickerRes, usdBrl] = await Promise.all([
      fetch(
        'https://api.binance.com/api/v3/ticker/24hr?symbols=["BTCUSDT","ETHUSDT"]',
        { next: { revalidate: 60 } },
      ),
      fetchYahoo("USDBRL=X"),
    ]);
    if (!tickerRes.ok) throw new Error(`binance ${tickerRes.status}`);
    const tickers = (await tickerRes.json()) as BinanceTicker[];
    const rate = usdBrl?.price ?? 0;
    const byId = new Map(tickers.map((t) => [t.symbol, t]));

    function build(
      sym: string,
      id: string,
      label: string,
      icon: string,
    ): Quote | null {
      const t = byId.get(sym);
      if (!t) return null;
      const usd = parseFloat(t.lastPrice);
      return {
        id,
        label,
        name: rate ? `${id} → BRL` : `${id} → USD`,
        value: rate ? usd * rate : usd,
        currency: rate ? "BRL" : "USD",
        pct: parseFloat(t.priceChangePercent),
        symbol: icon,
      };
    }

    const quotes = [
      build("BTCUSDT", "BTC", "Bitcoin", "₿"),
      build("ETHUSDT", "ETH", "Ethereum", "Ξ"),
    ].filter((q): q is Quote => q !== null);

    const body: ApiEnvelope<Quote[]> = {
      data: quotes,
      updatedAt: new Date().toISOString(),
    };
    return NextResponse.json(body);
  } catch (e) {
    const body: ApiEnvelope<Quote[]> = {
      data: [],
      updatedAt: new Date().toISOString(),
      errors: [`Cripto indisponível: ${(e as Error).message}`],
    };
    return NextResponse.json(body, { status: 200 });
  }
}
