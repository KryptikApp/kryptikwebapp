// api handler that generates random string on the server
// and returns it to the client
import { NextApiRequest, NextApiResponse } from "next";

import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import {
  addRefreshTokenToWhitelist,
  findAuthenticatorById,
  findCurrentChallenge,
  findUserByEmail,
  findUserById,
  getUserFromRequest,
} from "../../../../prisma/script";
import { User } from "@prisma/client";
import { rpID } from "../../../../src/constants/passkeyConstants";
import { setCookie } from "cookies-next";
import { v4 } from "uuid";
import { generateTokens } from "../../../../src/helpers/auth/jwt";

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

    const user: User | null = await getUserFromRequest(req);

    if (!user) {
      throw new Error("Unable to find user.");
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
      expectedOrigin: [
        origin,
        "http://localhost:3000",
        "https://www.kryptik.app",
      ],
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
    // add auth cookies
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
    // return response
    return res.status(200).send({
      msg: "Successfully verified registration response.",
      verified: verified,
    });
  } catch (e: any) {
    return res.status(400).send({ msg: "Unable to verify passkey." });
  }
}
