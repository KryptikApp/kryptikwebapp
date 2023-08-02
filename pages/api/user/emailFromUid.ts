// get the email from the uid

import { NextApiRequest, NextApiResponse } from "next";
import { findUserById } from "../../../prisma/script";

type Data = {
  msg?: string;
  email: string | null;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    // check if proper request
    if (req.method === "POST") {
      // get email from body
      const uid = req.body.uid;
      // validate header
      if (uid && typeof uid != "string") {
        return res
          .status(400)
          .json({ msg: "Uid must be a string.", email: null });
      }
      if (!uid) {
        return res
          .status(400)
          .json({ msg: "Uid must be provided.", email: null });
      }
      const user = await findUserById(uid);
      console.log(uid);
      console.log(user);
      console.log("------");
      if (!user) {
        return res.status(400).json({ msg: "User not found.", email: null });
      }
      if (!user.email) {
        return res
          .status(200)
          .json({ msg: "User found, but no associated email.", email: null });
      }
      return res.status(200).json({ msg: "User found.", email: user.email });
    }
  } catch (e: any) {
    return res.status(400).json({ msg: `${e.message}`, email: null });
  }
}
