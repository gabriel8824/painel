import { NextResponse } from "next/server";
import type { ApiEnvelope, Quote } from "@/lib/types";
import { fetchYahooMany } from "@/lib/yahoo";

export const revalidate = 60;

// Câmbio via Yahoo Finance (preço + variação no dia). Inclui USD→AOA (Kwanza).
const SYMBOLS = ["USDBRL=X", "USDAOA=X", "EURBRL=X", "GBPBRL=X"];

export async function GET() {
  const q = await fetchYahooMany(SYMBOLS);

  const usdBrl = q.get("USDBRL=X")?.price ?? 0;
  const usdAoa = q.get("USDAOA=X")?.price ?? 0;
  const brlAoa = usdBrl ? usdAoa / usdBrl : 0;

  const quotes: Quote[] = [
    {
      id: "USD-BRL",
      label: "USD → BRL",
      name: "Dólar Americano",
      value: usdBrl,
      currency: "BRL",
      pct: q.get("USDBRL=X")?.pct ?? null,
      symbol: "🇺🇸",
    },
    {
      id: "USD-AOA",
      label: "USD → AOA",
      name: "Kwanza Angolano",
      value: usdAoa,
      currency: "AOA",
      pct: q.get("USDAOA=X")?.pct ?? null,
      symbol: "🇦🇴",
    },
    {
      id: "EUR-BRL",
      label: "EUR → BRL",
      name: "Euro",
      value: q.get("EURBRL=X")?.price ?? 0,
      currency: "BRL",
      pct: q.get("EURBRL=X")?.pct ?? null,
      symbol: "🇪🇺",
    },
    {
      id: "GBP-BRL",
      label: "GBP → BRL",
      name: "Libra Esterlina",
      value: q.get("GBPBRL=X")?.price ?? 0,
      currency: "BRL",
      pct: q.get("GBPBRL=X")?.pct ?? null,
      symbol: "🇬🇧",
    },
    {
      id: "BRL-AOA",
      label: "BRL → AOA",
      name: "Real → Kwanza",
      value: brlAoa,
      currency: "AOA",
      pct: null,
      symbol: "🇧🇷",
    },
  ];

  const valid = quotes.filter((x) => x.value > 0);
  const body: ApiEnvelope<Quote[]> = {
    data: valid,
    updatedAt: new Date().toISOString(),
    errors: valid.length < 4 ? ["Algumas cotações indisponíveis"] : undefined,
  };
  return NextResponse.json(body);
}
