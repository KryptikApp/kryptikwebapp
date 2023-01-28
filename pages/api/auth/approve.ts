import { v4 } from "uuid";
import { NextApiRequest, NextApiResponse } from "next";

import {
  addRefreshTokenToWhitelist,
  findUserByEmail,
  validateUserOneTimeCode,
} from "../../../prisma/script";
import { setCookie } from "cookies-next";
import { generateTokens } from "../../../src/helpers/utils/auth/jwt";

type Data = {
  accessToken?: string;
  refreshToken?: string;
  msg?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  console.log("running approval");
  // Get data submitted in request's body.
  try {
    const body = req.body;
    const email: string = body.email;
    const code: string = body.code;
    // reject if no user is supplied
    if (!email || !code) {
      return res.status(400).json({ msg: "Email and code are required" });
    }

    const user = await findUserByEmail(email);
    // reject if user already exists
    if (!user) {
      return res.status(400).json({ msg: "Unable to find user" });
    }
    const isValid: boolean = await validateUserOneTimeCode(user.id, code);
    if (!isValid) {
      throw new Error("Invalid code.");
    }
    const jti = v4();
    const { accessToken, refreshToken } = generateTokens(user, jti);
    await addRefreshTokenToWhitelist(jti, refreshToken, user.id);
    setCookie("accessToken", accessToken, {
      req,
      res,
      secure: process.env.APP_STAGE == "production",
      httpOnly: true,
    });
    setCookie("refreshToken", refreshToken, {
      req,
      res,
      secure: process.env.APP_STAGE == "production",
      httpOnly: true,
    });
    return res.status(200).json({ msg: "Auth cookies have been set." });
  } catch (e: any) {
    return res.status(400).json({ msg: `${e.message}` });
  }
}
