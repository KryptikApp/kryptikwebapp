import { NextApiRequest, NextApiResponse } from "next";

import {
  findUserById,
  getBlockchainAccountByEmail,
} from "../../../prisma/script";
import { BlockchainAccountDb } from "../../../src/helpers/accounts";

type Data = {
  account?: BlockchainAccountDb;
  msg?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  console.log("running delete blockchain account");
  const body = req.body;
  const emailToCheck: string = body.email;
  // Get data submitted in request's body.
  try {
    const userId: string | string[] | undefined = req.headers["user-id"];
    console.log(req.headers);
    console.log(userId);
    if (!userId || typeof userId != "string") {
      throw new Error(
        "No user id available in request header or user id was of the wrong type (expected string)."
      );
    }
    const user = await findUserById(userId);
    if (!user) {
      throw new Error("Unable to find user by ID.");
    }
    const account = await getBlockchainAccountByEmail(emailToCheck);
    if (!account) {
      throw new Error("Unable to save new blockchain account to database.");
    }
    const accountToReturn: BlockchainAccountDb = {
      evmAddress: account.evmAddress,
      nearAddress: account.nearAddress,
      solAddress: account.solAddress,
    };
    return res
      .status(200)
      .json({ account: accountToReturn, msg: "Active user returned." });
  } catch (e: any) {
    return res.status(400).json({ msg: `${e.message}` });
  }
}
