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
      <div className="flex items-end gap-4 xl:gap-6">
        <ClockFace now={now} {...TZ.br} secColor="var(--accent)" />
        <span
          aria-hidden
          className="h-10 w-px self-center bg-[var(--panel-edge)] xl:h-12"
        />
        <ClockFace now={now} {...TZ.ao} secColor="var(--ink-dim)" />
      </div>
      <div className="mt-2 h-5 text-sm capitalize text-[var(--ink-dim)] xl:text-base">
        {date}
      </div>
    </div>
  );
}
