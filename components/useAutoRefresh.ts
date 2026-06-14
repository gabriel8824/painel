"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ApiEnvelope } from "@/lib/types";

interface State<T> {
  data: T | null;
  updatedAt: string | null;
  errors: string[];
  loading: boolean;
}

/** Faz polling de um endpoint interno em intervalo fixo (ms). */
export function useAutoRefresh<T>(url: string, intervalMs: number) {
  const [state, setState] = useState<State<T>>({
    data: null,
    updatedAt: null,
    errors: [],
    loading: true,
  });
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(url, { cache: "no-store" });
      const json = (await res.json()) as ApiEnvelope<T>;
      setState({
        data: json.data,
        updatedAt: json.updatedAt,
        errors: json.errors ?? [],
        loading: false,
      });
    } catch (e) {
      setState((s) => ({
        ...s,
        loading: false,
        errors: [`Falha ao carregar: ${(e as Error).message}`],
      }));
    }
  }, [url]);

  useEffect(() => {
    load();
    timer.current = setInterval(load, intervalMs);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [load, intervalMs]);

  return state;
}
