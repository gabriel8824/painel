import { NextResponse } from "next/server";
import { XMLParser } from "fast-xml-parser";
import type { ApiEnvelope, NewsItem, NewsTier } from "@/lib/types";
import { translateMany } from "@/lib/translate";

export const revalidate = 300;

// `lang` é interno (idioma original do feed) — usado para traduzir e depois descartado.
type RawNews = Omit<NewsItem, "importance" | "tier"> & { lang?: "pt" | "en" };

// Normaliza para comparação: minúsculas, sem acento.
const norm = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");

// Palavras-chave (sobre texto já normalizado, sem acento).
const URGENT =
  /\b(urgente|breaking|alerta|ao vivo|ultima hora|morre|morte|explos|ataque|guerra|crise|colapso|despenca|desaba|dispara|recorde|halt|circuit breaker|rombo|resgate|falencia|renuncia|emergencia|emergency)\b/g;
const MARKET =
  /\b(selic|juros|copom|dolar|inflacao|ipca|pib|ibovespa|fed|powell|tarifa|tariff|petroleo|petrobras|vale|balanco|lucro|prejuizo|rating|nasdaq|s&p|bitcoin|default|recessao)\b/g;

/** Pontua a importância (0-100) de uma notícia a partir dos sinais disponíveis. */
function scoreItem(n: RawNews): number {
  const t = norm(n.title);
  let s = 0;

  // 1) Recência (0-35)
  const ageMin = (Date.now() - +new Date(n.publishedAt)) / 60000;
  if (ageMin <= 15) s += 35;
  else if (ageMin <= 30) s += 28;
  else if (ageMin <= 60) s += 20;
  else if (ageMin <= 180) s += 10;
  else if (ageMin <= 360) s += 4;

  // 2) Categoria (0-18) — painel financeiro prioriza finanças
  s += n.category === "finanças" ? 18 : n.category === "brasil" ? 8 : 6;

  // 3) Urgência — contagem de matches, +12 cada, teto 30
  s += Math.min(30, (t.match(URGENT)?.length ?? 0) * 12);

  // 4) Mercado/movimento — +8 cada, teto 20
  s += Math.min(20, (t.match(MARKET)?.length ?? 0) * 8);

  // 5) Fonte financeira (desempate leve)
  s += /infomoney|economia/.test(norm(n.source)) ? 6 : 2;

  // 6) Penalidade de título muito longo (legibilidade a distância)
  if (n.title.length > 110) s -= 6;

  return Math.max(0, Math.min(100, Math.round(s)));
}

/** Classifica em tiers visuais com tetos (máx 3 urgentes, 6 destaques). */
function classify(items: RawNews[]): NewsItem[] {
  const scored = items.map((n) => ({ raw: n, score: scoreItem(n) }));

  // candidatos a urgente
  const isUrgentCand = (x: { raw: RawNews; score: number }) => {
    const t = norm(x.raw.title);
    const ageMin = (Date.now() - +new Date(x.raw.publishedAt)) / 60000;
    return x.score >= 62 || ((t.match(URGENT)?.length ?? 0) > 0 && ageMin <= 30);
  };

  const urgentRanked = scored
    .filter(isUrgentCand)
    .sort((a, b) => b.score - a.score);
  const urgentSet = new Set(urgentRanked.slice(0, 3).map((x) => x.raw));

  const highlightRanked = scored
    .filter((x) => !urgentSet.has(x.raw) && x.score >= 42)
    .sort((a, b) => b.score - a.score);
  const highlightSet = new Set(highlightRanked.slice(0, 6).map((x) => x.raw));

  // garantia anti-vazio: sempre ≥1 destaque
  if (urgentSet.size === 0 && highlightSet.size === 0 && scored.length) {
    const top = [...scored].sort((a, b) => b.score - a.score)[0];
    highlightSet.add(top.raw);
  }

  // mantém a ORDEM cronológica original (tier é só visual)
  return scored.map(({ raw, score }) => {
    const tier: NewsTier = urgentSet.has(raw)
      ? "urgent"
      : highlightSet.has(raw)
        ? "highlight"
        : "normal";
    const { lang: _lang, ...rest } = raw;
    void _lang;
    return { ...rest, importance: score, tier };
  });
}

const FEEDS: {
  url: string;
  source: string;
  category: NewsItem["category"];
  lang: "pt" | "en";
}[] = [
  { url: "https://g1.globo.com/rss/g1/economia/", source: "G1 Economia", category: "finanças", lang: "pt" },
  { url: "https://www.infomoney.com.br/feed/", source: "InfoMoney", category: "finanças", lang: "pt" },
  { url: "https://g1.globo.com/rss/g1/mundo/", source: "G1 Mundo", category: "mundo", lang: "pt" },
  { url: "https://feeds.bbci.co.uk/news/world/rss.xml", source: "BBC World", category: "mundo", lang: "en" },
];

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });

interface RssItem {
  title?: string | { "#text"?: string };
  link?: string | { "@_href"?: string };
  pubDate?: string;
  published?: string;
  updated?: string;
}

function asText(v: unknown): string {
  if (typeof v === "string") return v.trim();
  if (v && typeof v === "object" && "#text" in v) return String((v as { "#text": string })["#text"]).trim();
  return "";
}

function asLink(v: unknown): string {
  if (typeof v === "string") return v.trim();
  if (Array.isArray(v)) {
    const alt = v.find((x) => x?.["@_rel"] === "alternate") ?? v[0];
    return asLink(alt);
  }
  if (v && typeof v === "object" && "@_href" in v) return String((v as { "@_href": string })["@_href"]);
  return "";
}

async function fetchFeed(feed: (typeof FEEDS)[number]): Promise<RawNews[]> {
  const res = await fetch(feed.url, {
    next: { revalidate: 300 },
    headers: { "User-Agent": "Mozilla/5.0 PainelDashboard" },
  });
  if (!res.ok) throw new Error(`${feed.source} ${res.status}`);
  const xml = await res.text();
  const doc = parser.parse(xml);
  const items: RssItem[] =
    doc?.rss?.channel?.item ?? doc?.feed?.entry ?? [];
  const arr = Array.isArray(items) ? items : [items];
  return arr
    .map((it): RawNews | null => {
      const title = asText(it.title);
      const link = asLink(it.link);
      const date = it.pubDate || it.published || it.updated || "";
      const publishedAt = date ? new Date(date).toISOString() : new Date().toISOString();
      if (!title) return null;
      return { title, link, source: feed.source, category: feed.category, publishedAt, lang: feed.lang };
    })
    .filter((x): x is RawNews => x !== null)
    .slice(0, 8);
}

export async function GET() {
  const results = await Promise.allSettled(FEEDS.map(fetchFeed));
  const errors: string[] = [];
  let raw: RawNews[] = [];
  results.forEach((r, i) => {
    if (r.status === "fulfilled") raw = raw.concat(r.value);
    else errors.push(`Feed ${FEEDS[i].source} indisponível`);
  });

  // ordem cronológica (mais recente primeiro), depois classifica por importância
  raw.sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt));
  raw = raw.slice(0, 24);

  // traduz os títulos em inglês (BBC) para português antes de classificar,
  // assim o score por palavras-chave PT também passa a valer para eles
  const enIdx = raw
    .map((n, i) => (n.lang === "en" ? i : -1))
    .filter((i) => i >= 0);
  if (enIdx.length) {
    const translated = await translateMany(enIdx.map((i) => raw[i].title));
    enIdx.forEach((i, k) => {
      raw[i] = { ...raw[i], title: translated[k] };
    });
  }

  const items = classify(raw);

  const body: ApiEnvelope<NewsItem[]> = {
    data: items,
    updatedAt: new Date().toISOString(),
    errors: errors.length ? errors : undefined,
  };
  return NextResponse.json(body);
}
