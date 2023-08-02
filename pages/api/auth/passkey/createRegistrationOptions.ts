// api handler that generates random string on the server
// and returns it to the client
import { NextApiRequest, NextApiResponse } from "next";

import { generateRegistrationOptions } from "@simplewebauthn/server";

import { User } from "@prisma/client";
import {
  findAuthenticatorsByUserId,
  saveCurrentChallenge,
  findUserById,
  findUserByEmail,
  createUserByEmail,
  getUserFromRequest,
  createNewUser,
} from "../../../../prisma/script";
import { rpID, rpName } from "../../../../src/constants/passkeyConstants";
import { authenticateApiRequest } from "../../../../middleware";

type Data = any;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    const body = req.body;
    let user: User | null = null;
    // try to get user from requets body
    try {
      user = await getUserFromRequest(req);
    } catch (e) {
      // pass for now
    }
    if (!user) {
      // if no user found, create new user
      user = await createNewUser();
    }
    // find user by userId, if not already found
    if (!user) {
      const verifiedResult = await authenticateApiRequest(req);
      if (!verifiedResult.verified || !verifiedResult.payload) {
        throw new Error("Unable to verify request.");
      }
      // get user id from header
      const userId: any = verifiedResult.payload.userId;
      user = await findUserById(userId);
    }
    if (!user) {
      throw new Error("Unable to find user.");
    }

    const userAuthenticators = await findAuthenticatorsByUserId(user.id);
    if (!userAuthenticators) {
      throw new Error("Unable to find authenticators for user.");
    }
    const options = generateRegistrationOptions({
      rpName,
      rpID,
      userID: user.id,
      userName: user.email ? user.email : user.id,
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
