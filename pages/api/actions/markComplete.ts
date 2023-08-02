import { markActionCompleteForUser } from "../../../prisma/script";
import { NextApiRequest, NextApiResponse } from "next";

type Data = {
  msg?: string;
  success: boolean;
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
        success: false,
      });
    }
    const actionId = Number(req.body.actionId);
    if (!actionId) {
      return res.status(400).json({
        msg: "No action id available or action id was of the wrong type (expected string).",
        success: false,
      });
    }

    const updateRes = await markActionCompleteForUser(userId, actionId);
    return res.status(200).json({ success: true });
  } catch (e: any) {
    return res.status(400).json({ msg: `${e.message}`, success: false });
  }
}
