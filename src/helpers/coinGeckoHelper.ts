// helps with integrating web3service into app. context
import { Price } from "@prisma/client";
import { CoinGeckoClient, CoinMarketChartResponse } from "coingecko-api-v3";

export type PricesDict = { [id: string]: number };

export function pricesDictFromPrices(prices: Price[]) {
  const newDict: PricesDict = {};
  prices.map((p) => {
    newDict[p.coinGeckoId] = p.price;
  });
  return newDict;
}

export const getPriceOfTicker = async function (id: string): Promise<number> {
  const client = new CoinGeckoClient({
    timeout: 10000,
    autoRetry: true,
  });
  let input = {
    vs_currencies: "usd",
    ids: id,
    include_market_cap: false,
    include_24hr_vol: false,
    include_24hr_change: false,
    include_last_updated_at: false,
  };

  const priceResponse = await client.simplePrice(input);
  return priceResponse[id].usd;
};

export type CoingeckoIdAndTicker = {
  id: string;
  ticker: string;
};

export const getPriceOfMultipleTickers = async function (
  idAndTickers: CoingeckoIdAndTicker[]
): Promise<PricesDict> {
  const client = new CoinGeckoClient({
    timeout: 10000,
    autoRetry: false,
  });
  const ids: string[] = idAndTickers.map((t) => t.id);
  const idString: string = ids.join();
  let input = {
    vs_currencies: "usd",
    ids: idString,
    include_market_cap: false,
    include_24hr_vol: false,
    include_24hr_change: false,
    include_last_updated_at: false,
  };

  let priceDict: PricesDict = {};
  const priceResponse = await client.simplePrice(input);
  for (const id of ids) {
    priceDict[id] = priceResponse[id].usd;
  }
  return priceDict;
};

export const getHistoricalPriceForTicker = async function (
  id: string,
  days: number,
  priceSetFunction?: (val: any) => void
): Promise<CoinMarketChartResponse> {
  const client = new CoinGeckoClient({
    timeout: 10000,
    autoRetry: true,
  });

  let input = {
    id: id,
    vs_currency: "usd",
    days: days,
  };
  const marketChartResponse = await client.coinIdMarketChart(input);
  let prices: number[][] = marketChartResponse.prices;
  priceSetFunction && priceSetFunction(prices);
  return marketChartResponse;
};
