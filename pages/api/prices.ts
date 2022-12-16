// api endpoints for balance requests
// currently uses Covalent indexer to fulfill requests

import { CoinMarketChartResponse } from "coingecko-api-v3";
import { NextApiRequest, NextApiResponse } from "next";
import { getHistoricalPriceForTicker } from "../../src/helpers/coinGeckoHelper";

type Data = {
  priceData: CoinMarketChartResponse | null;
};

// basic login routine
export default async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  if (req.method !== "POST") return res.status(405).end();

  const body = req.body;
  if (!body.id || !body.days) {
    console.warn("Error: required price params not provided.");
  }
  // const apiKey = flipKey?process.env.CovalentApiKey1:process.env.CovalentApiKey2
  // let reqParams:BalanceReqParams = {accountAddress:body.accountAddress, currency:body.currency, chainId:body.chainId};
  let dataToReturn: CoinMarketChartResponse = await getHistoricalPriceForTicker(
    body.id,
    body.days
  );
  if (dataToReturn) {
    res.status(200).json({ priceData: dataToReturn });
  } else {
    res.status(400).json({ priceData: null });
  }
};
