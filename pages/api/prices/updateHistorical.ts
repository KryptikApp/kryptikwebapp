import { CoinMarketChartResponse } from "coingecko-api-v3";
import { NextApiRequest, NextApiResponse } from "next";
import { getHistoricalPriceForTicker } from "../../../src/helpers/coinGeckoHelper";
import { IHistoricalPrice } from "../../../src/helpers/assets/types";
import { getAllNetworks, getAllTokens } from "../../../prisma/script";

type Data = {
  message: string;
};

const defaultLookbacks: number[] = [1, 7, 30, 90, 365];

// basic login routine
export default async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  if (req.method !== "POST") return res.status(405).end();
  try {
    const tokensFromDb = await getAllTokens();
    const networksFromDb = await getAllNetworks();
    // all asset ids
    const assetIds: string[] = [...tokensFromDb, ...networksFromDb].map(
      (a) => a.coingeckoId
    );
    // for every lookback period and for every asset, update the historical price
    for (const assetId of assetIds) {
      for (const lookback of defaultLookbacks) {
        const body = req.body;
        if (!body.id || !body.days) {
          console.warn("Error: required price params not provided.");
        }
        const assetId: string = body.id;
        // fetch historical info from coingecko
        const historicalData: CoinMarketChartResponse =
          await getHistoricalPriceForTicker(assetId, lookback);
        // update meta
        let newTimes: number[] = [];
        let newPrices: number[] = [];
        // extract times and prices from the historical data object
        for (let i = 0; i < historicalData.prices.length; i++) {
          newTimes.push(historicalData.prices[i][0]);
          newPrices.push(historicalData.prices[i][1]);
        }
        const newHistoricalPrice: IHistoricalPrice = {
          prices: newPrices,
          times: newTimes,
          lookback: lookback,
          id: body,
        };
      }
    }
    res.status(200).json({ message: "Prices updated!" });
  } catch (e) {
    res.status(400).json({ message: "Failed to update prices!" });
  }
};
