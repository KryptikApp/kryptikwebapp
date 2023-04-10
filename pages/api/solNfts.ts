import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import { INFTMetadata } from "../../src/parsers/nftEthereum";
import { parseSolNFTMetaData } from "../../src/parsers/nftSolana";
import { listSolanaNftsByAddress } from "../../src/requests/nfts/solanaApi";

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
  let dataToReturn = await listSolanaNftsByAddress(body.address);
  res.status(200).json({ nftData: dataToReturn });
};
