// fetch and return all passkeys associated with a user

import { Authenticator, User } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import {
  findAuthenticatorsByUserEmail,
  findAuthenticatorsByUserId,
  findUserByEmail,
  findUserById,
} from "../../../../prisma/script";
import {
  authenticateApiRequest,
  authenticateRequest,
} from "../../../../middleware";

type Data = {
  msg?: string;
  passkeys?: Authenticator[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    // check if head request
    if (req.method === "HEAD") {
      // get email from body
      const email = req.headers["email"];
      if (!email || typeof email != "string") {
        return res.status(400).json({ msg: "No email provided." });
      }
      // find user
      const user: User | null = await findUserByEmail(email);
      if (!user) {
        return res.status(200).setHeader("Passkeys-Count", 0).end();
      }
      // find all authenticators associated with user
      const passkeys: Authenticator[] | null = await findAuthenticatorsByUserId(
        user.id
      );
      const passkeysCount = passkeys?.length.toString() || "0";
      // return metadata about authenticators for given user
      return res.status(200).setHeader("Passkeys-Count", passkeysCount).end();
    }
    const verifiedResult = await authenticateApiRequest(req);
    if (!verifiedResult.verified || !verifiedResult.payload) {
      throw new Error("Unable to verify request.");
    }
    // get user id from header
    const userId: any = verifiedResult.payload.userId;
    if (!userId || typeof userId != "string") {
      throw new Error(
        "No user id available or user id was of the wrong type (expected string)."
      );
    }
    // find user
    const user: User | null = await findUserById(userId);
    if (!user) {
      return res.status(200).json({ passkeys: [] });
    }
    // find all authenticators associated with user
    const passkeys: Authenticator[] | null = await findAuthenticatorsByUserId(
      user.id
    );
    if (!passkeys) {
      throw new Error("Unable to find passkeys for user.");
    }
    // return passkeys
    return res.status(200).json({ passkeys: passkeys });
  } catch (e: any) {
    // return error if any
    return res.status(500).json({ msg: "Unable to find passkeys for user." });
  }
}
