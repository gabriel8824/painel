// Tradução via endpoint público do Google Translate (sem chave).
// Usado para verter manchetes em inglês para português no servidor.

const SEP = " ||| "; // separador preservado pela tradução; permite batch numa requisição

async function callGoogle(q: string, from: string, to: string): Promise<string | null> {
  try {
    const url =
      `https://translate.googleapis.com/translate_a/single?client=gtx` +
      `&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(q)}`;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 6000);
    const res = await fetch(url, {
      signal: ctrl.signal,
      next: { revalidate: 300 },
      headers: { "User-Agent": "Mozilla/5.0 PainelDashboard" },
    });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`translate ${res.status}`);
    // Formato: [[[trad, orig, ...], [trad2, ...], ...], ...]
    const json = (await res.json()) as [Array<[string, string]>];
    const chunks = json?.[0];
    if (!Array.isArray(chunks)) return null;
    const out = chunks.map((c) => c?.[0] ?? "").join("");
    return out || null;
  } catch {
    return null;
  }
}

/** Traduz um texto. Retorna o original em caso de falha. */
export async function translate(
  text: string,
  from = "en",
  to = "pt-BR",
): Promise<string> {
  if (!text.trim()) return text;
  const out = await callGoogle(text, from, to);
  return out?.trim() || text;
}

/**
 * Traduz vários textos. Tenta uma única requisição (todos juntos com separador);
 * se a contagem não bater, cai para tradução individual; falhas mantêm o original.
 */
export async function translateMany(
  texts: string[],
  from = "en",
  to = "pt-BR",
): Promise<string[]> {
  if (texts.length === 0) return [];
  if (texts.length === 1) return [await translate(texts[0], from, to)];

  const batched = await callGoogle(texts.join(SEP), from, to);
  if (batched) {
    const parts = batched.split("|||").map((p) => p.trim());
    if (parts.length === texts.length) {
      return parts.map((p, i) => p || texts[i]);
    }
  }
  // fallback: traduz individualmente (cada falha mantém o original)
  return Promise.all(texts.map((t) => translate(t, from, to)));
}
