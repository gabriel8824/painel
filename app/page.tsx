import { Clocks } from "@/components/Clock";
import { WeatherCard } from "@/components/WeatherCard";
import { Dashboard } from "@/components/Dashboard";
import { HighlightsCard } from "@/components/HighlightsCard";
import { NewsTicker } from "@/components/NewsTicker";

export default function Home() {
  return (
    <main className="relative z-10 mx-auto flex h-screen max-w-[1920px] flex-col gap-4 p-5 xl:gap-5 xl:p-7">
      {/* Cabeçalho */}
      <header className="flex items-center justify-between gap-4 rise">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="live-dot inline-block h-2.5 w-2.5 rounded-full bg-[var(--up)]" />
            <span className="panel-title">Ao vivo · Mercado &amp; Mundo</span>
          </div>
          <h1 className="font-display mt-1 text-3xl font-extrabold tracking-tight xl:text-5xl">
            Painel <span className="text-[var(--accent)]">Financeiro</span>
          </h1>
        </div>
        <div className="flex items-center gap-5 xl:gap-7">
          <WeatherCard />
          <span
            aria-hidden
            className="hidden h-14 w-px self-center bg-[var(--panel-edge)] sm:block xl:h-16"
          />
          <Clocks />
        </div>
      </header>

      {/* Conteúdo: Dashboard (estica) + Rail de destaques */}
      <div className="flex min-h-0 flex-1 gap-4 xl:gap-5">
        <div className="min-w-0 flex-1">
          <Dashboard />
        </div>
        <div className="hidden shrink-0 xl:flex xl:w-[380px] 2xl:w-[420px]">
          <HighlightsCard />
        </div>
      </div>

      {/* Rodapé: notícias */}
      <NewsTicker />
    </main>
  );
}
