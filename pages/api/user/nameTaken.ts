// returns true if username is already taken

import { NextApiRequest, NextApiResponse } from "next";
import { findUserByEmail } from "../../../prisma/script";

type Data = {
  taken: boolean;
  msg?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const body = req.body;
  const email = body.email;
  try {
    const user = await findUserByEmail(email);
    if (user) {
      return res.status(200).json({ taken: true });
    } else {
      return res.status(200).json({ taken: false });
    }
  } catch (e) {
    return res
      .status(400)
      .json({ taken: false, msg: `Error while finding user by email.` });
  }
}
