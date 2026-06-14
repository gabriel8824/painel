import { NextResponse } from "next/server";
import type { ApiEnvelope, WeatherNow } from "@/lib/types";

export const revalidate = 600;

const LAT = process.env.WEATHER_LAT ?? "-8.8390";
const LON = process.env.WEATHER_LON ?? "13.2894";
const CITY = process.env.WEATHER_CITY ?? "Luanda";

// https://open-meteo.com/en/docs — códigos WMO
const WMO: Record<number, { d: string; i: string }> = {
  0: { d: "Céu limpo", i: "☀️" },
  1: { d: "Predom. limpo", i: "🌤️" },
  2: { d: "Parc. nublado", i: "⛅" },
  3: { d: "Nublado", i: "☁️" },
  45: { d: "Névoa", i: "🌫️" },
  48: { d: "Névoa gelada", i: "🌫️" },
  51: { d: "Garoa fraca", i: "🌦️" },
  53: { d: "Garoa", i: "🌦️" },
  55: { d: "Garoa forte", i: "🌧️" },
  61: { d: "Chuva fraca", i: "🌦️" },
  63: { d: "Chuva", i: "🌧️" },
  65: { d: "Chuva forte", i: "🌧️" },
  71: { d: "Neve fraca", i: "🌨️" },
  73: { d: "Neve", i: "🌨️" },
  75: { d: "Neve forte", i: "❄️" },
  80: { d: "Pancadas", i: "🌦️" },
  81: { d: "Pancadas", i: "🌧️" },
  82: { d: "Temporal", i: "⛈️" },
  95: { d: "Tempestade", i: "⛈️" },
  96: { d: "Tempestade", i: "⛈️" },
  99: { d: "Tempestade", i: "⛈️" },
};

export async function GET() {
  try {
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}` +
      `&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min` +
      `&timezone=auto&forecast_days=1`;
    const res = await fetch(url, { next: { revalidate: 600 } });
    if (!res.ok) throw new Error(`open-meteo ${res.status}`);
    const json = (await res.json()) as {
      current: { temperature_2m: number; weather_code: number };
      daily: { temperature_2m_max: number[]; temperature_2m_min: number[] };
    };
    const code = json.current.weather_code;
    const w = WMO[code] ?? { d: "—", i: "🌡️" };
    const data: WeatherNow = {
      city: CITY,
      temp: Math.round(json.current.temperature_2m),
      description: w.d,
      icon: w.i,
      high: Math.round(json.daily.temperature_2m_max?.[0]),
      low: Math.round(json.daily.temperature_2m_min?.[0]),
    };
    const body: ApiEnvelope<WeatherNow> = {
      data,
      updatedAt: new Date().toISOString(),
    };
    return NextResponse.json(body);
  } catch (e) {
    const body: ApiEnvelope<WeatherNow | null> = {
      data: null,
      updatedAt: new Date().toISOString(),
      errors: [`Clima indisponível: ${(e as Error).message}`],
    };
    return NextResponse.json(body, { status: 200 });
  }
}
