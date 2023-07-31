import { NextApiRequest, NextApiResponse } from "next";
import { INFTMetadata } from "../../src/parsers/nftEthereum";
import { listPoapsByAddress } from "../../src/requests/nfts/poapApi";
import { NFTResponse } from "../../src/requests/nfts/ethereumApi";

// basic login routine
export default async (
  req: NextApiRequest,
  res: NextApiResponse<NFTResponse | null>
) => {
  if (req.method !== "POST") return res.status(405).end();
  const body = req.body;
  if (!body.address) {
    console.warn("No address provided.");
  }
  let dataToReturn = await listPoapsByAddress(body.address);
  res.status(200).json(dataToReturn);
};
