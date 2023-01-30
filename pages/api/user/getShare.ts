import { RemoteShare } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

import { getShareByUserId } from "../../../prisma/script";

type Data = {
  remoteShare: string | null;
  msg?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  console.log("running get share");
  // Get data submitted in request's body.
  try {
    const userId: string | string[] | undefined = req.headers["user-id"];
    if (!userId || typeof userId != "string") {
      throw new Error(
        "No user id available or user id was of the wrong type (expected string)."
      );
    }
    const remoteShare: RemoteShare | null = await getShareByUserId(userId);
    if (!remoteShare) {
      return res.status(200).json({
        remoteShare: null,
        msg: "Share has been updated.",
      });
    }
    return res
      .status(200)
      .json({ remoteShare: remoteShare.share, msg: "Share has been updated." });
  } catch (e: any) {
    return res.status(400).json({ remoteShare: null, msg: `${e.message}` });
  }
}
