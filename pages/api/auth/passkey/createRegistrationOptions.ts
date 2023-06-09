// api handler that generates random string on the server
// and returns it to the client
import { NextApiRequest, NextApiResponse } from "next";

import { generateRegistrationOptions } from "@simplewebauthn/server";

import { User } from "@prisma/client";
import {
  findAuthenticatorsByUserId,
  saveCurrentChallenge,
  findUserById,
} from "../../../../prisma/script";
import { rpID, rpName } from "../../../../src/helpers/auth/passkey";

type Data = any;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    const body = req.body;
    const userId: string | string[] | undefined = req.headers["user-id"];
    if (!userId || typeof userId != "string") {
      throw new Error(
        "No user id available or user id was of the wrong type (expected string)."
      );
    }
    // find user
    const user: User | null = await findUserById(userId);
    if (!user) {
      throw new Error("Unable to find or create new user.");
    }

    const userAuthenticators = await findAuthenticatorsByUserId(user.id);
    if (!userAuthenticators) {
      throw new Error("Unable to find authenticators for user.");
    }
    const options = generateRegistrationOptions({
      rpName,
      rpID,
      userID: user.id,
      userName: user.email,
      // Don't prompt users for additional information about the authenticator
      // (Recommended for smoother UX)
      attestationType: "direct",
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        requireResidentKey: false,
        userVerification: "preferred",
      },
      excludeCredentials: userAuthenticators.map((authenticator) => ({
        id: Buffer.from(authenticator.credentialID, "base64"),
        publicKey: authenticator.credentialPublicKey,
        type: "public-key",
      })),
    });
    // save challenge to db
    await saveCurrentChallenge(options.challenge, user.id);
    return res.status(200).json(options);
  } catch (e: any) {
    return res.status(400).json({ msg: `${e.message}` });
  }
}