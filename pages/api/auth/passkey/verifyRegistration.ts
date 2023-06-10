// api handler that generates random string on the server
// and returns it to the client
import { NextApiRequest, NextApiResponse } from "next";

import { verifyRegistrationResponse } from "@simplewebauthn/server";
import {
  addRefreshTokenToWhitelist,
  findCurrentChallenge,
  findUserByEmail,
  findUserById,
  saveAuthenticator,
} from "../../../../prisma/script";
import { Authenticator, User } from "@prisma/client";

import { UAParser } from "ua-parser-js";
import { rpID } from "../../../../src/constants/passkeyConstants";
import { setCookie } from "cookies-next";
import { v4 } from "uuid";
import { generateTokens } from "../../../../src/helpers/auth/jwt";
import { authenticateApiRequest } from "../../../../middleware";

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
  console.log("Verify registration request body", req.body);
  try {
    const body = req.body;
    const email = body.email;
    let user: User | null = null;

    user = await findUserByEmail(email);
    if (user) {
      const createdTime = new Date(user.createdAt);
      const currentTime = new Date();
      const timeDiff = currentTime.getTime() - createdTime.getTime();
      // allowed if younger than one minute or if user is verified
      if (timeDiff > 60000) {
        console.log("user is older than one minute");
        user = null;
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
        user = await findUserById(userId);
      }
    }
    if (!user) {
      throw new Error("Unable to find user with email.");
    }

    const expectedChallenge = await findCurrentChallenge(user.id);
    if (!expectedChallenge) {
      throw new Error("Unable to find challenge for user.");
    }
    const verification = await verifyRegistrationResponse({
      response: body,
      expectedChallenge: expectedChallenge.challenge,
      expectedOrigin: [origin, "http://localhost:3000"],
      expectedRPID: rpID,
    });
    const { registrationInfo, verified } = verification;
    if (!registrationInfo) {
      throw new Error("Unable to verify registration response.");
    }
    // parse user agent
    const uaParser = new UAParser(req.headers["user-agent"]);
    const ua = uaParser.getResult();
    // create authenticator name from user agent
    const authenticatorName = ua.browser.name + " on " + ua.os.name;
    const {
      counter,
      credentialDeviceType,
      credentialBackedUp,
      credentialPublicKey,
    } = registrationInfo;
    // populate new authenticator object
    const newAuthenticator: Authenticator = {
      credentialID: body.id,
      counter: counter,
      userId: user.id,
      credentialDeviceType: credentialDeviceType,
      createdAt: new Date(),
      credentialBackedUp: credentialBackedUp,
      credentialPublicKey: Buffer.from(credentialPublicKey),
      transports: "",
      name: authenticatorName,
    };
    // save authenticator to db
    const authenticator: Authenticator = await saveAuthenticator(
      newAuthenticator
    );
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
    // return success
    return res.status(200).send({
      msg: "Successfully verified registration response.",
      verified: verified,
    });
  } catch (e: any) {
    return res.status(400).send({ msg: "Unable to approve passkey." });
  }
}
