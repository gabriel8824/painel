"use client";

import { useEffect, useState } from "react";

const TZ = {
  br: { zone: "America/Sao_Paulo", label: "BRASÍLIA", flag: "🇧🇷" },
  ao: { zone: "Africa/Luanda", label: "LUANDA", flag: "🇦🇴" },
} as const;

function fmtTime(d: Date, zone: string) {
  return d.toLocaleTimeString("pt-BR", {
    timeZone: zone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function ClockFace({
  now,
  zone,
  label,
  flag,
  secColor,
}: {
  now: Date | null;
  zone: string;
  label: string;
  flag: string;
  secColor: string;
}) {
  const time = now ? fmtTime(now, zone) : "--:--:--";
  return (
    <div className="flex flex-col items-end leading-none">
      <div className="mb-1 flex items-center gap-1.5">
        <span className="text-sm leading-none">{flag}</span>
        <span className="panel-title">{label}</span>
      </div>
      <div className="font-mono text-3xl font-semibold tracking-tight tabular-nums xl:text-4xl">
        <span className={now ? "" : "text-[var(--ink-faint)]"}>
          {time.slice(0, 5)}
        </span>
        <span style={{ color: now ? secColor : "var(--ink-faint)" }}>
          {time.slice(5)}
        </span>
      </div>
    </div>
  );
}

// ---- Contador "Voltar para o Brasil" (20 de agosto) ----

const TARGET_M = 7; // agosto (0-based)
const TARGET_D = 20;
const MS_DAY = 86_400_000;

type Tier =
  | "far"
  | "t45"
  | "t29"
  | "t14"
  | "t7"
  | "t3"
  | "t1"
  | "today"
  | "arrived";

/** Dias até o próximo 20/08 (meia-noite local) + janela festiva pós-chegada. */
function returnState(now: Date): { days: number; justArrived: boolean } {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetThisYear = new Date(now.getFullYear(), TARGET_M, TARGET_D);

  // janela "de volta" — de 20/08 00:00 até 23/08 00:00
  const justArrived =
    now.getTime() >= targetThisYear.getTime() &&
    now.getTime() < targetThisYear.getTime() + 3 * MS_DAY;

  // alvo = próximo 20/08 a partir de hoje (auto-reseta para o ano seguinte)
  let target = targetThisYear;
  if (target.getTime() < today.getTime()) {
    target = new Date(now.getFullYear() + 1, TARGET_M, TARGET_D);
  }
  const days = Math.round((target.getTime() - today.getTime()) / MS_DAY);
  return { days, justArrived };
}

function tierFor(d: number): Tier {
  if (d <= 0) return "today";
  if (d === 1) return "t1";
  if (d <= 3) return "t3";
  if (d <= 7) return "t7";
  if (d <= 14) return "t14";
  if (d <= 29) return "t29";
  if (d <= 45) return "t45";
  return "far";
}

function copyFor(
  tier: Tier,
  days: number,
): { num: string; unit: string | null; text: string } {
  switch (tier) {
    case "today":
      return { num: "HOJE!", unit: null, text: "VOLTANDO PRO BRASIL ✈️🇧🇷" };
    case "arrived":
      return { num: "✓", unit: null, text: "DE VOLTA AO BRASIL" };
    case "t1":
      return { num: "1", unit: "dia", text: "É AMANHÃ! 🇧🇷" };
    case "t3":
      return { num: String(days), unit: "dias", text: "FALTAM POUCOS DIAS 🇧🇷" };
    case "t7":
      return { num: String(days), unit: "dias", text: "RETA FINAL ✈️" };
    case "t14":
      return { num: String(days), unit: "dias", text: "PARA VOLTAR AO BRASIL ✈️" };
    default:
      // far, t45, t29
      return { num: String(days), unit: "dias", text: "PARA VOLTAR AO BRASIL" };
  }
}

function ReturnCounter({ now }: { now: Date | null }) {
  // placeholder de altura fixa enquanto não hidratou — evita salto de layout
  if (!now) return <div className="mt-3 h-12 xl:mt-3.5" aria-hidden />;

  const { days, justArrived } = returnState(now);
  const tier: Tier = justArrived && days !== 0 ? "arrived" : tierFor(days);
  const c = copyFor(tier, days);
  const aria =
    days === 0
      ? "Hoje é o dia de voltar ao Brasil"
      : `Faltam ${days} ${days === 1 ? "dia" : "dias"} para voltar ao Brasil`;

  return (
    <div
      className="counter mt-3 flex flex-col items-end leading-none xl:mt-3.5"
      data-tier={tier}
      role="status"
      aria-label={aria}
    >
      <div className="flex items-baseline gap-2">
        <span className="counter-num font-mono font-bold tabular-nums">
          {c.num}
        </span>
        {c.unit && (
          <span className="counter-unit text-sm font-medium text-[var(--ink-dim)]">
            {c.unit}
          </span>
        )}
      </div>
      <span className="panel-title mt-1">{c.text}</span>
    </div>
  );
}

export function Clocks() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const date = now
    ? now.toLocaleDateString("pt-BR", {
        timeZone: TZ.br.zone,
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "";

  return (
    <div className="flex flex-col items-end">
      <div className="flex flex-col items-end gap-2 xl:gap-2.5">
        <ClockFace now={now} {...TZ.br} secColor="var(--accent)" />
        <span
          aria-hidden
          className="my-1 h-px w-32 self-end bg-[var(--panel-edge)] xl:w-40"
        />
        <ClockFace now={now} {...TZ.ao} secColor="var(--ink-dim)" />
      </div>
      <div className="mt-2 h-5 text-sm capitalize text-[var(--ink-dim)] xl:text-base">
        {date}
      </div>
      <ReturnCounter now={now} />
    </div>
  );
}
