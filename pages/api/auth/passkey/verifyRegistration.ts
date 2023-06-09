// api handler that generates random string on the server
// and returns it to the client
import { NextApiRequest, NextApiResponse } from "next";

import { verifyRegistrationResponse } from "@simplewebauthn/server";
import {
  findCurrentChallenge,
  findUserById,
  saveAuthenticator,
} from "../../../../prisma/script";
import { Authenticator, User } from "@prisma/client";

import { UAParser } from "ua-parser-js";
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
    const authenticatorName = ua.browser.name + "on " + ua.os.name;
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
    return res.status(200).send({
      msg: "Successfully verified registration response.",
      verified: verified,
    });
  } catch (e: any) {
    return res.status(400).send({ msg: "Unable to approve passkey." });
  }
}
