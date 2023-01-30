import { TokenDb } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

import { getAllTokens } from "../../../prisma/script";

type Data = {
  tokens: TokenDb[] | null;
  msg?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  console.log("running get networks");
  // Get data submitted in request's body.
  try {
    const tokens = await getAllTokens();

    if (!tokens) {
      return res.status(200).json({
        tokens: null,
        msg: "Share has been updated.",
      });
    }
    return res
      .status(200)
      .json({ tokens: tokens, msg: "Share has been updated." });
  } catch (e: any) {
    return res.status(400).json({ tokens: null, msg: `${e.message}` });
  }
}
