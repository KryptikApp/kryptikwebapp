import { NextApiRequest, NextApiResponse } from "next";
import {
  createOneTimeToken,
  findOrCreateUserByEmail,
} from "../../../prisma/script";
import { OneTimeToken, User } from "@prisma/client";

import { sendEmailCode } from "../../../src/helpers/utils/auth/email";

type Data = {
  accessToken?: string;
  refreshToken?: string;
  msg?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  // Get data submitted in request's body.
  try {
    const body = req.body;
    const email: string = body.email;
    const sendLink: boolean = body.sendLink;
    // reject if no email is supplied
    if (!email) {
      return res.status(400).json({ msg: "Email is required for login." });
    }
    // find or create user
    const user: User | null = await findOrCreateUserByEmail(email);
    if (!user) {
      return res
        .status(400)
        .json({ msg: "Unable to find or create new user." });
    }
    const oneTimeCode: OneTimeToken = await createOneTimeToken(user.id);
    // send one time code via email
    try {
      const res = await sendEmailCode(email, oneTimeCode.code, sendLink);
    } catch (e) {
      return res.status(400).json({ msg: "Unable to send email." });
    }
    console.log("sending email");
    return res.status(200).json({ msg: "Email sent" });
  } catch (e: any) {
    console.log(e.message);
    return res.status(400).json({ msg: `${e.message}` });
  }
}
