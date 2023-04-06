import { NetworkDb, TokenDb } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

import { allPrices } from "../../../prisma/script";
import {
  PricesDict,
  pricesDictFromPrices,
} from "../../../src/helpers/coinGeckoHelper";

type Data = {
  prices: PricesDict | null;
  msg?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  // Get data submitted in request's body.
  try {
    const prices = await allPrices();
    const pricesDict: PricesDict = pricesDictFromPrices(prices);
    return res
      .status(200)
      .json({ prices: pricesDict, msg: "Prices have been updated." });
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
