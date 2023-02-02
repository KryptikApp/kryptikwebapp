import { NetworkDb, Price, TokenDb } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

import {
  getAllNetworks,
  getAllTokens,
  PriceToUpload,
  updatePrices,
} from "../../../prisma/script";
import {
  CoingeckoIdAndTicker,
  getPriceOfMultipleTickers,
  PricesDict,
} from "../../../src/helpers/coinGeckoHelper";

type Data = {
  msg?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  console.log("running update prices");
  // Get data submitted in request's body.
  try {
    const networks = await getAllNetworks();
    const tokens = await getAllTokens();
    if (!networks || !tokens) {
      throw new Error("Unable to fetch tokens from DB.");
    }
    const ids: CoingeckoIdAndTicker[] = getAllIdsAndTickers(networks, tokens);
    // TODO: make more effecient...
    // maybe use different parameters and return type for call below
    let priceDict: PricesDict = await getPriceOfMultipleTickers(ids);
    const pricesArray: PriceToUpload[] = [];
    for (const cd of ids) {
      const currentPrice: number | undefined = priceDict[cd.id];
      if (!currentPrice) return;
      pricesArray.push({
        coinGeckoId: cd.id,
        ticker: cd.ticker,
        price: currentPrice,
      });
    }
    // push to database
    await updatePrices(pricesArray);
    return res.status(200).json({ msg: "Prices have been updated." });
  } catch (e: any) {
    return res.status(400).json({ msg: `${e.message}` });
  }
}

/** Returns array of coingecko ids. */
function getAllIdsAndTickers(
  networks: NetworkDb[],
  tokens: TokenDb[]
): CoingeckoIdAndTicker[] {
  const arrayToReturn: CoingeckoIdAndTicker[] = [];
  for (const nw of networks) {
    arrayToReturn.push({ id: nw.coingeckoId, ticker: nw.ticker });
  }
  for (const token of tokens) {
    arrayToReturn.push({ id: token.coingeckoId, ticker: token.ticker });
  }
  return arrayToReturn;
}
