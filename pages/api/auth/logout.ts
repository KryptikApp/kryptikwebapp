import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import {
  deleteRefreshToken,
  findRefreshTokenById,
} from "../../../prisma/script";
import { deleteCookie, getCookie } from "cookies-next";
import { v4 } from "uuid";

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
    console.log("running logout api");
    const refreshToken: string | undefined = getCookie("refreshToken", {
      req,
      res,
    })?.toString();
    // reject if no tokens are supplied
    if (!refreshToken) {
      return res.status(401).json({ msg: "Missing refresh token." });
    }
    const payload: any = jwt.decode(refreshToken);
    const savedRefreshToken = await findRefreshTokenById(payload.jti);
    if (savedRefreshToken) {
      await deleteRefreshToken(savedRefreshToken.id);
    }
    // delete token cookies
    deleteCookie("accessToken", {
      req,
      res,
    });
    deleteCookie("refreshToken", {
      req,
      res,
    });
    console.log("Logged out");
    return res.status(200).json({ msg: "Logged out." });
  } catch (e: any) {
    return res.status(401).json({ msg: `${e.message}` });
  }
}
