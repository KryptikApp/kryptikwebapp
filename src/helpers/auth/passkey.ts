import {
  startAuthentication,
  startRegistration,
} from "@simplewebauthn/browser";
import { IKryptikFetchResponse, KryptikFetch } from "../../kryptikFetch";
import { UserId } from "../../models/user";

/**
 * Makes request for passkeys by associated with user email.
 * @param email The email of the user.
 * @returns True if the user has passkeys.
 */
export async function hasPasskeys(params: {
  email?: string;
  uid?: string;
}): Promise<boolean> {
  const { email, uid } = params;
  let res: IKryptikFetchResponse | null = null;
  try {
    if (uid) {
      console.log("uid provided");
      // make a request to the api to get the passkeys count
      res = await KryptikFetch("/api/auth/passkey/all", {
        method: "HEAD",
        timeout: 8000,
        headers: { "Content-Type": "application/json", uid: uid },
      });
    } else {
      console.log("no uid provided");
      if (!email) throw new Error("No email or uid provided");
      // make a request to the api to get the passkeys count
      res = await KryptikFetch("/api/auth/passkey/all", {
        method: "HEAD",
        timeout: 8000,
        headers: { "Content-Type": "application/json", email: email },
      });
    }
    // ensure response was received
    if (!res) throw new Error("No response from server");
    // check if the request was successful
    if (res.status != 200) {
      throw new Error("Unable to get passkeys count.");
    }
    // get the passkeys count from the header
    const passkeysCount = res.headers.get("Passkeys-Count");
    // check if the passkeys count was returned
    if (!passkeysCount) {
      throw new Error("Unable to get passkeys count.");
    }
    // check if the passkeys count is greater than 0
    return parseInt(passkeysCount) > 0;
  } catch (e) {
    console.log(e);
    return false;
  }
}

/**
 * Makes request to get all passkeys associated with the user. Note, the user must be logged in.
 * @returns All passkeys associated with the user.
 */
export async function getAllPasskeys() {
  const res = await KryptikFetch("/api/auth/passkey/all", {
    method: "GET",
    timeout: 8000,
  });
  if (res.status != 200) {
    throw new Error("Unable to get passkeys.");
  }
  return res.data.passkeys;
}

/**
 * Register a new passkey. Email must be provided if the user is not logged in.
 * @param id User id
 * @returns True if the passkey was registered.
 */
export async function registerPasskey(id: UserId) {
  const { email, uid } = id;
  // try to add new friend on server
  const reqParams = {
    email: email,
    uid: uid,
  };
  try {
    const res = await KryptikFetch(
      "/api/auth/passkey/createRegistrationOptions",
      {
        method: "POST",
        timeout: 8000,
        body: JSON.stringify(reqParams),
        headers: { "Content-Type": "application/json" },
      }
    );
    let attResp;
    // custom error handling for option generation
    try {
      attResp = await startRegistration(res.data);
    } catch (e: any) {
      if (e.name && e.name === "InvalidStateError") {
        throw new Error("Passkey already registered.");
      }
      throw new Error(e.message);
    }
    // uid from the server
    const uid = res.data.user.id;
    const newBody = { ...attResp, uid: uid };
    // send the registration credentials to the server
    const resRegistration = await KryptikFetch(
      "/api/auth/passkey/verifyRegistration",
      {
        method: "POST",
        body: JSON.stringify(newBody),
        timeout: 8000,
        headers: { "Content-Type": "application/json" },
      }
    );
    const verification = resRegistration.data;
    // ensure that the passkey was registered
    if (verification.verified) {
      return true;
    } else {
      return false;
    }
  } catch (e: any) {
    return false;
  }
}

/**
 * Authenticates the user using a passkey.
 * @param id User id
 * @returns True if the user was authenticated.
 */
export async function authenticatePasskey(id: UserId) {
  const { email, uid } = id;
  try {
    const params = {
      email: email,
      uid: uid,
    };
    const res = await KryptikFetch("/api/auth/passkey/createAuthOptions", {
      method: "POST",
      timeout: 8000,
      body: JSON.stringify(params),
      headers: { "Content-Type": "application/json" },
    });

    let attResp;
    // custom error handling for option generation
    try {
      attResp = await startAuthentication(res.data);
    } catch (e: any) {
      if (e.name && e.name === "InvalidStateError") {
        throw new Error("Passkey already registered.");
      }
      throw new Error(e.message);
    }
    // add the id to the response
    const newBody = { ...attResp, ...params };
    // send the authenticationn credentials to the server
    const resAuthentication = await KryptikFetch(
      "/api/auth/passkey/verifyAuth",
      {
        method: "POST",
        body: JSON.stringify(newBody),
        timeout: 8000,
        headers: { "Content-Type": "application/json" },
      }
    );
    const verification = resAuthentication.data;
    // ensure that the passkey was registered
    if (verification.verified) {
      return true;
    } else {
      return false;
    }
  } catch (e: any) {
    return false;
  }
}
