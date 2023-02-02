import { TokenDb } from "@prisma/client";
import {
  dbToClientToken,
  TokenDb as TokenDbClient,
} from "../../../src/services/models/token";
import { NextApiRequest, NextApiResponse } from "next";

import { getAllTokens } from "../../../prisma/script";

type Data = {
  tokens: TokenDbClient[] | null;
  msg?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  console.log("running get networks");
  // Get data submitted in request's body.
  try {
    const tokensFromDb = await getAllTokens();
    if (!tokensFromDb) {
      throw new Error("Unable to fetch tokens from db.");
    }
    const tokensToReturn: TokenDbClient[] = tokensFromDb.map((t) =>
      dbToClientToken(t)
    );
    return res
      .status(200)
      .json({ tokens: tokensToReturn, msg: "Share has been updated." });
  } catch (e: any) {
    return res.status(400).json({ tokens: null, msg: `${e.message}` });
  }
}
