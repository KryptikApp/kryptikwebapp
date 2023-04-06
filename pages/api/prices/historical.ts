import { CoinMarketChartResponse } from "coingecko-api-v3";
import { NextApiRequest, NextApiResponse } from "next";
import { getHistoricalPriceForTicker } from "../../../src/helpers/coinGeckoHelper";

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
