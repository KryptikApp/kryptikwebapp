import { CoinMarketChartResponse } from "coingecko-api-v3";
import { KryptikFetch } from "../../kryptikFetch";

// gets historical prices from server for all possible networks (currently wrapper for coingecko request)
export const fetchServerHistoricalPrices = async function (
  id: string,
  days: number
): Promise<CoinMarketChartResponse | null> {
  // request balance data from api
  let dataResponse = await KryptikFetch("/api/prices", {
    method: "POST",
    timeout: 10000,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: id, days: days }),
  });
  if (dataResponse.status != 200) return null;
  let historicalData = await dataResponse.data.priceData;
  if (!historicalData) return null;
  return historicalData;
};
