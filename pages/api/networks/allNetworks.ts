import { NetworkDb, RemoteShare } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

import { getAllNetworks, getShareByUserId } from "../../../prisma/script";

type Data = {
  networks: NetworkDb[] | null;
  msg?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  console.log("running get networks");
  // Get data submitted in request's body.
  try {
    const networks = await getAllNetworks();

    if (!networks) {
      return res.status(200).json({
        networks: null,
        msg: "Share has been updated.",
      });
    }
    return res
      .status(200)
      .json({ networks: networks, msg: "Share has been updated." });
  } catch (e: any) {
    return res.status(400).json({ networks: null, msg: `${e.message}` });
  }
}
