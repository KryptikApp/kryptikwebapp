import { NextApiRequest, NextApiResponse } from "next";

import { findUserById } from "../../../prisma/script";
import { UserDB } from "../../../src/models/user";

type Data = {
  user?: UserDB;
  msg?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  console.log("running active user");
  // Get data submitted in request's body.
  try {
    const userId: string | string[] | undefined = req.headers["user-id"];
    if (!userId || typeof userId != "string") {
      return res.status(400).json({
        msg: "No user id available or user id was of the wrong type (expected string).",
      });
    }
    const user = await findUserById(userId);
    if (!user) {
      return res.status(400).json({
        msg: "Unable to find user by ID.",
      });
    }
    const userToReturn: UserDB = {
      uid: user.id,
      bio: user.Profile?.bio || undefined,
      name: user.Profile?.name || "",
      photoUrl: user.Profile?.avatarPath || undefined,
      isAdvanced: false,
      email: user?.email || undefined,
    };
    return res
      .status(200)
      .json({ user: userToReturn, msg: "Active user returned." });
  } catch (e: any) {
    return res.status(400).json({ msg: `${e.message}` });
  }
}
