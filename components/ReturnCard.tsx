"use client";

import { useEffect, useState } from "react";
import {
  returnState,
  tierFor,
  copyFor,
  dayRemainder,
  pad,
  type Tier,
} from "@/lib/return";

export function ReturnCard() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // placeholder de MESMA altura enquanto não hidratou (evita salto)
  if (!now) {
    return (
      <div
        className="return-card panel rise flex h-full flex-col justify-between p-6 xl:p-7"
        data-tier="far"
        aria-hidden
      >
        <div className="flex items-center justify-between">
          <span className="panel-title">Voltar ao Brasil</span>
          <span className="panel-title flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-[var(--ink-faint)]" />
            ao vivo
          </span>
        </div>
        <div className="counter flex items-baseline gap-2" data-tier="far">
          <span className="counter-num font-mono font-bold tabular-nums">--</span>
          <span className="counter-unit text-base font-medium text-[var(--ink-dim)]">
            dias
          </span>
        </div>
        <div className="leading-tight">
          <div className="font-mono text-2xl tabular-nums text-[var(--ink-faint)] xl:text-3xl">
            --:--:--
          </div>
          <span className="panel-title mt-1 block">para voltar ao Brasil</span>
        </div>
      </div>
    );
  }

  const { days, justArrived } = returnState(now);
  const tier: Tier = justArrived && days !== 0 ? "arrived" : tierFor(days);
  const c = copyFor(tier, days);
  const rem = dayRemainder(now);
  const aria =
    days === 0
      ? "Hoje é o dia de voltar ao Brasil"
      : `Faltam ${days} ${days === 1 ? "dia" : "dias"} para voltar ao Brasil`;

  return (
    <div
      className="return-card panel rise flex h-full flex-col justify-between p-6 xl:p-7"
      data-tier={tier}
      role="status"
      aria-label={aria}
    >
      {/* Topo: título + selo ao vivo */}
      <div className="flex items-center justify-between">
        <span className="panel-title">Voltar ao Brasil</span>
        <span className="panel-title flex items-center gap-1.5 text-[var(--up)]">
          <span className="live-dot inline-block h-2 w-2 rounded-full bg-[var(--up)]" />
          ao vivo
        </span>
      </div>

      {/* Meio: número gigante de dias (reusa .counter / .counter-num) */}
      <div className="counter flex items-baseline gap-2" data-tier={tier}>
        <span className="counter-num font-mono font-bold leading-none tabular-nums">
          {c.num}
        </span>
        {c.unit && (
          <span className="counter-unit text-base font-medium text-[var(--ink-dim)]">
            {c.unit}
          </span>
        )}
      </div>

      {/* Base: sub-relógio HH:MM:SS (tica a cada segundo) + rótulo do tier */}
      <div className="leading-tight">
        <div
          className="font-mono text-2xl tabular-nums text-[var(--ink-dim)] xl:text-3xl"
          aria-hidden
        >
          {pad(rem.h)}:{pad(rem.m)}
          <span className="text-[var(--accent)]">:{pad(rem.s)}</span>
        </div>
        <span className="panel-title mt-1 block">{c.text}</span>
      </div>
    </div>
  );
}
