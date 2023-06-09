// api handler that generates random string on the server
// and returns it to the client
import { NextApiRequest, NextApiResponse } from "next";

import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import {
  findAuthenticatorById,
  findCurrentChallenge,
  findUserByEmail,
  findUserById,
} from "../../../../prisma/script";
import { User } from "@prisma/client";
import { rpID } from "../../../../src/constants/passkeyConstants";

// The URL at which registrations and authentications should occur
const origin = `https://${rpID}`;

type Data = {
  msg?: string;
  verified?: boolean;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    const body = req.body;
    const email = body.email;
    if (!email || typeof email != "string") {
      throw new Error(
        "No email available or email was of the wrong type (expected string)."
      );
    }
    // find user
    const user: User | null = await findUserByEmail(email);
    if (!user) {
      throw new Error("Unable to find user with email.");
    }

    const expectedChallenge = await findCurrentChallenge(user.id);
    if (!expectedChallenge) {
      throw new Error("Unable to find challenge for user.");
    }

    const authenticator = await findAuthenticatorById(body.id);
    if (!authenticator) {
      throw new Error("Unable to find authenticator.");
    }

    const verification = await verifyAuthenticationResponse({
      response: body,
      expectedChallenge: expectedChallenge.challenge,
      expectedOrigin: [origin, "http://localhost:3000"],
      expectedRPID: rpID,
      authenticator: {
        credentialPublicKey: authenticator.credentialPublicKey,
        credentialID: Buffer.from(authenticator.credentialID),
        counter: authenticator.counter,
      },
    });
    const { verified } = verification;
    if (!verified) {
      throw new Error("Unable to verify registration response.");
    }
    return res.status(200).send({
      msg: "Successfully verified registration response.",
      verified: verified,
    });
  } catch (e: any) {
    return res.status(400).send({ msg: "Unable to approve passkey." });
  }
}
