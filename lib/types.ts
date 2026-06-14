// Tipos compartilhados entre as rotas de API e os componentes.

export interface Quote {
  /** identificador único, ex. "USD-BRL" */
  id: string;
  /** rótulo curto, ex. "USD → BRL" */
  label: string;
  /** descrição longa, ex. "Dólar Americano" */
  name: string;
  /** valor atual */
  value: number;
  /** moeda para formatação (ISO 4217) ou null para número puro */
  currency: string | null;
  /** variação percentual no dia (24h), null se indisponível */
  pct: number | null;
  /** emoji/ícone opcional */
  symbol?: string;
}

export interface NewsItem {
  title: string;
  link: string;
  source: string;
  category: "mundo" | "finanças" | "brasil";
  publishedAt: string; // ISO
  importance: number; // 0-100, calculado no servidor
  tier: NewsTier;
}

export type NewsTier = "urgent" | "highlight" | "normal";

export interface WeatherNow {
  city: string;
  temp: number;
  description: string;
  icon: string;
  high?: number;
  low?: number;
}

export interface ApiEnvelope<T> {
  data: T;
  updatedAt: string;
  errors?: string[];
}
