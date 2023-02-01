import { NextApiRequest, NextApiResponse } from "next";

import {
  addBlockChainAccountByUserId,
  findUserById,
} from "../../../prisma/script";
import { BlockchainAccountDb } from "../../../src/helpers/accounts";

type Data = {
  msg?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  console.log("running create blockchain account");
  const body = req.body;
  const blockchainAccount: BlockchainAccountDb = body.account;
  // Get data submitted in request's body.
  try {
    const userId: string | string[] | undefined = req.headers["user-id"];
    console.log(req.headers);
    console.log(userId);
    if (!userId || typeof userId != "string") {
      throw new Error(
        "No user id available or user id was of the wrong type (expected string)."
      );
    }
    const user = await findUserById(userId);
    if (!user) {
      throw new Error("Unable to find user by ID.");
    }
    const isUpdated = await addBlockChainAccountByUserId(
      blockchainAccount,
      userId
    );
    console.log("here!");
    if (!isUpdated) {
      console.log("ahhhh");
      throw new Error("Unable to save new blockchain account to database.");
    }
    return res.status(200).json({ msg: "Active user returned." });
  } catch (e: any) {
    console.log(e);
    return res.status(400).json({ msg: `${e.message}` });
  }
}
