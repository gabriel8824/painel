"use client";

import { useAutoRefresh } from "./useAutoRefresh";
import type { WeatherNow } from "@/lib/types";

export function WeatherCard() {
  const { data } = useAutoRefresh<WeatherNow | null>("/api/weather", 10 * 60 * 1000);

  if (!data) {
    return (
      <div className="flex items-center gap-3 text-[var(--ink-faint)]">
        <span className="text-3xl">🌡️</span>
        <span className="text-sm">carregando clima…</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-4xl leading-none">{data.icon}</span>
      <div className="leading-tight">
        <div className="font-mono text-2xl font-semibold tabular-nums">
          {data.temp}°
        </div>
        <div className="text-xs text-[var(--ink-dim)]">
          {data.city} · {data.description}
        </div>
      </div>
      {(data.high !== undefined || data.low !== undefined) && (
        <div className="ml-1 border-l border-[var(--panel-edge)] pl-3 text-xs text-[var(--ink-faint)]">
          <div className="up">↑ {data.high}°</div>
          <div className="down">↓ {data.low}°</div>
        </div>
      )}
    </div>
  );
}
