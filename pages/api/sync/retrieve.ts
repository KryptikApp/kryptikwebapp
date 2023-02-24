import { RemoteShare, TempSyncKey } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

import {
  findSyncKeyByUserId,
  getShareByUserId,
  validateSyncKey,
} from "../../../prisma/script";

type Data = {
  key: TempSyncKey | null;
  msg?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  // Get data submitted in request's body.
  try {
    const userId: string | string[] | undefined = req.headers["user-id"];
    if (!userId || typeof userId != "string") {
      throw new Error(
        "No user id available or user id was of the wrong type (expected string)."
      );
    }
    const tempSyncKey = await findSyncKeyByUserId(userId);
    if (!tempSyncKey) {
      throw new Error("Unable to find sync key for given user.");
    }
    const isValid = validateSyncKey(tempSyncKey);
    if (!isValid) {
      throw new Error("No valid syn key available.");
    }
    return res
      .status(200)
      .json({ key: tempSyncKey, msg: "Share has been updated." });
  } catch (e: any) {
    return res.status(400).json({ key: null, msg: `${e.message}` });
  }
}
