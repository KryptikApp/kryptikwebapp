import { WalletAction } from "@prisma/client";
import {
  getAllWalletActions,
  getCompletedActions,
} from "../../../prisma/script";
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
    const actions = await getAllWalletActions();
    return res.status(200).json({ actions });
  } catch (e: any) {
    return res.status(400).json({ msg: `${e.message}`, actions: [] });
  }
}
