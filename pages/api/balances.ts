// api endpoints for balance requests
// currently uses Covalent indexer to fulfill requests

import { NextApiRequest, NextApiResponse } from "next";
import {
  CovalentAddressBalanceResponseData,
  getAssetsFromCovalent,
} from "../../src/requests/covalent";

type Data = {
  balanceData: CovalentAddressBalanceResponseData | null;
};

// UNCOMMENT FOR QUE AND WINDOW STRUCTS
// const requestQueue:Queue<BalanceReqParams> = new Queue<BalanceReqParams>(1000000000);
// // Rate limiting within 1 second windows
// const windowLength = 1;
// // max number of requests we take in a window
// const maxRequest = 5;
// //
// const requestWindow = {
//     windowStart: 0,
//     request: 0
// }

// will be used to rotate api keys
let flipKey: boolean = false;

// basic login routine
export default async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  if (req.method !== "POST") return res.status(405).end();
  const body = req.body;
  if (!body.accountAddress || !body.currency || !body.chainId) {
    console.warn("Error: required balance params not provided.");
  }
  // const apiKey = flipKey?process.env.CovalentApiKey1:process.env.CovalentApiKey2
  // let reqParams:BalanceReqParams = {accountAddress:body.accountAddress, currency:body.currency, chainId:body.chainId};
  // TODO: 2X CHECK TIMEOUT
  let dataToReturn = await getAssetsFromCovalent(
    body.chainId,
    body.accountAddress,
    body.currency
  );
  if (dataToReturn) {
    res.status(200).json({ balanceData: dataToReturn });
  } else {
    res.status(400).json({ balanceData: null });
  }
};
