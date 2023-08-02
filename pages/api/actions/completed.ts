import { WalletAction } from "@prisma/client";
import { getCompletedActions } from "../../../prisma/script";
import { NextApiRequest, NextApiResponse } from "next";

type Data = {
  msg?: string;
  actions: WalletAction[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    const userId: string | string[] | undefined = req.headers["user-id"];
    if (!userId || typeof userId != "string") {
      return res.status(400).json({
        msg: "No user id available or user id was of the wrong type (expected string).",
        actions: [],
      });
    }
    const actions = await getCompletedActions(userId);
    return res.status(200).json({ actions });
  } catch (e: any) {
    return res.status(400).json({ msg: `${e.message}`, actions: [] });
  }
}
