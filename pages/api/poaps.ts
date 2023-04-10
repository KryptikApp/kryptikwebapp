import { NextApiRequest, NextApiResponse } from "next";
import { INFTMetadata } from "../../src/parsers/nftEthereum";
import { listPoapsByAddress } from "../../src/requests/nfts/poapApi";

type Data = {
  nftData: INFTMetadata[] | null;
};

// basic login routine
export default async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  if (req.method !== "POST") return res.status(405).end();
  const body = req.body;
  if (!body.address) {
    console.warn("No address provided.");
  }
  let dataToReturn = await listPoapsByAddress(body.address);
  res.status(200).json({ nftData: dataToReturn });
};
