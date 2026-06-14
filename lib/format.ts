// Formatação centralizada (Intl) para o painel.

export function formatCurrency(
  value: number,
  currency: string,
  opts: Intl.NumberFormatOptions = {},
): string {
  try {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency,
      ...opts,
    }).format(value);
  } catch {
    return value.toFixed(2);
  }
}

export function formatNumber(value: number, digits = 2): string {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

export function formatPct(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export function trendOf(pct: number | null | undefined): "up" | "down" | "flat" {
  if (pct === null || pct === undefined || Number.isNaN(pct)) return "flat";
  if (pct > 0.001) return "up";
  if (pct < -0.001) return "down";
  return "flat";
}

export function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diff = Date.now() - then;
  const min = Math.round(diff / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h} h`;
  const d = Math.round(h / 24);
  return `${d} d`;
}
