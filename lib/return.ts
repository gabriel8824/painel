// Lógica do contador "Voltar para o Brasil" (20 de agosto).
// Fonte única de verdade — usada pelo ReturnCard.

export const TARGET_M = 7; // agosto (0-based)
export const TARGET_D = 20;
export const MS_DAY = 86_400_000;

export type Tier =
  | "far"
  | "t45"
  | "t29"
  | "t14"
  | "t7"
  | "t3"
  | "t1"
  | "today"
  | "arrived";

/** Próximo 20/08 às 00:00 local a partir de hoje (auto-reseta para o ano seguinte). */
function targetDate(now: Date): Date {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let target = new Date(now.getFullYear(), TARGET_M, TARGET_D);
  if (target.getTime() < today.getTime()) {
    target = new Date(now.getFullYear() + 1, TARGET_M, TARGET_D);
  }
  return target;
}

/** Dias até o próximo 20/08 (meia-noite a meia-noite) + janela festiva pós-chegada. */
export function returnState(now: Date): { days: number; justArrived: boolean } {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetThisYear = new Date(now.getFullYear(), TARGET_M, TARGET_D);

  const justArrived =
    now.getTime() >= targetThisYear.getTime() &&
    now.getTime() < targetThisYear.getTime() + 3 * MS_DAY;

  const target = targetDate(now);
  const days = Math.round((target.getTime() - today.getTime()) / MS_DAY);
  return { days, justArrived };
}

export function tierFor(d: number): Tier {
  if (d <= 0) return "today";
  if (d === 1) return "t1";
  if (d <= 3) return "t3";
  if (d <= 7) return "t7";
  if (d <= 14) return "t14";
  if (d <= 29) return "t29";
  if (d <= 45) return "t45";
  return "far";
}

export function copyFor(
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
      return { num: String(days), unit: "dias", text: "ESTÁ CHEGANDO ✈️" };
    default:
      return { num: String(days), unit: "dias", text: "PARA VOLTAR AO BRASIL" };
  }
}

/** Tempo restante até a próxima meia-noite local — tica a cada segundo. */
export function dayRemainder(now: Date): { h: number; m: number; s: number } {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const nextMidnight = today.getTime() + MS_DAY;
  const rest = Math.max(0, nextMidnight - now.getTime());
  return {
    h: Math.floor(rest / 3_600_000),
    m: Math.floor((rest % 3_600_000) / 60_000),
    s: Math.floor((rest % 60_000) / 1000),
  };
}

export const pad = (n: number) => String(n).padStart(2, "0");
