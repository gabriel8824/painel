# Painel Financeiro · Mercado & Mundo

Dashboard "always-on" para monitor de escritório: cotações de câmbio, índices, commodities, criptomoedas, notícias do mundo/finanças, relógio, data e clima — com auto-refresh e visual escuro estilo painel de bolsa.

## Como rodar

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000). Para exibir no monitor, pressione **F11** (tela cheia) no navegador.

Build de produção:

```bash
npm run build && npm start
```

## O que mostra

- **Destaque:** USD → BRL (Dólar) e USD → AOA (Kwanza), em tamanho grande.
- **Moedas:** EUR → BRL, GBP → BRL, BRL → AOA.
- **Criptomoedas:** Bitcoin e Ethereum (variação 24h).
- **Índices:** Ibovespa, S&P 500, Nasdaq.
- **Commodities:** Petróleo WTI e Ouro.
- **Notícias:** ticker rolando + card "Mais importantes"; manchetes de finanças (G1 Economia, InfoMoney) e mundo (G1 Mundo, BBC World — esta traduzida do inglês para o português).
- **Cabeçalho:** relógio de **Brasília e Luanda**, data e clima de Luanda.

Cada cotação mostra seta ▲/▼ e variação percentual no dia. Auto-refresh: câmbio/cripto ~60s, índices/commodities ~2min, notícias ~5min, relógio 1s.

## Fontes de dados (gratuitas, sem chave de API)

- **Câmbio / Índices / Commodities:** Yahoo Finance (endpoint público de chart).
- **Criptomoedas:** Binance (convertido para BRL).
- **Notícias:** feeds RSS públicos (manchetes em inglês traduzidas via Google Translate).
- **Clima:** Open-Meteo.

Os dados são buscados nos *route handlers* do servidor (`app/api/*`) para evitar CORS e permitir cache. Se uma fonte ficar indisponível, o painel correspondente degrada graciosamente sem quebrar o resto.

## Configuração do clima

A localização padrão é Luanda. Para mudar (ex.: São Paulo), crie um `.env.local` (veja `.env.local.example`):

```env
WEATHER_LAT=-23.5505
WEATHER_LON=-46.6333
WEATHER_CITY=São Paulo
```

## Deploy

Pronto para deploy na [Vercel](https://vercel.com/new): basta importar o repositório. As variáveis de clima são opcionais.
