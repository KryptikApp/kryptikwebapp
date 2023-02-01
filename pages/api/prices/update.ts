import { NetworkDb, TokenDb } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

import { getAllNetworks, getAllTokens } from "../../../prisma/script";
import {
  getPriceOfMultipleTickers,
  PricesDict,
} from "../../../src/helpers/coinGeckoHelper";

type Data = {
  prices: PricesDict | null;
  msg?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  console.log("running get networks");
  // Get data submitted in request's body.
  try {
    const networks = await getAllNetworks();
    const tokens = await getAllTokens();
    if (!networks || !tokens) {
      throw new Error("Unable to fetch tokens from DB.");
    }
    const ids = getAllIds(networks, tokens);
    let priceResponse: PricesDict = await getPriceOfMultipleTickers(ids);
    return res
      .status(200)
      .json({ prices: priceResponse, msg: "Prices have been updated." });
  } catch (e: any) {
    return res.status(400).json({ prices: null, msg: `${e.message}` });
  }
}

function getAllIds(networks: NetworkDb[], tokens: TokenDb[]) {
  const ids = [];
  for (const nw of networks) {
    ids.push(nw.coingeckoId);
  }
  for (const token of tokens) {
    ids.push(token.coingeckoId);
  }
  return ids;
}
