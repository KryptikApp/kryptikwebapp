import { NextApiRequest, NextApiResponse } from "next";

import { createShare } from "../../../prisma/script";

type Data = {
  msg?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  console.log("running update share");
  const body = req.body;
  const newShare: string = body.share;
  // Get data submitted in request's body.
  try {
    const userId: string | string[] | undefined = req.headers["user-id"];
    if (!userId || typeof userId != "string") {
      return res.status(400).json({
        msg: "No user id available or user id was of the wrong type (expected string).",
      });
    }
    try {
      await createShare(newShare, userId);
    } catch (e) {
      throw new Error("Unable to create share.");
    }
    return res.status(200).json({ msg: "Share has been updated." });
  } catch (e: any) {
    return res.status(400).json({ msg: `${e.message}` });
  }
}
