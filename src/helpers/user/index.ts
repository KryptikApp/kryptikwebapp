import { NextApiRequest } from "next";
import { KryptikFetch } from "../../kryptikFetch";
import { UserDB } from "../../models/user";
import { User } from "@prisma/client";
import { findUserByEmail, findUserById } from "../../../prisma/script";

export async function updateProfile(user: UserDB) {
  const params = {
    user: user,
  };
  // try to create share on db
  try {
    const res = await KryptikFetch("/api/user/updateProfile", {
      method: "POST",
      body: JSON.stringify(params),
      timeout: 8000,
      headers: { "Content-Type": "application/json" },
    });
    if (res.status != 200) {
      console.warn("Unable to update profile on db.");
      return false;
    }
    return true;
  } catch (e) {
    return false;
  }
}

export async function getActiveUser(): Promise<UserDB | null> {
  // try to create share on db
  try {
    const res = await KryptikFetch("/api/user/activeUser", {
      method: "POST",
      timeout: 8000,
      headers: { "Content-Type": "application/json" },
    });
    const user: UserDB | undefined = res.data.user;
    if (res.status != 200 || !user) {
      return null;
    }
    console.log(user);
    return user;
  } catch (e) {
    return null;
  }
}

export async function isEmailTaken(email: string): Promise<boolean> {
  try {
    const params = { email: email };
    console.log();
    const res = await KryptikFetch("/api/user/nameTaken", {
      method: "POST",
      timeout: 8000,
      body: JSON.stringify(params),
      headers: { "Content-Type": "application/json" },
    });
    console.log(res);
    const taken = res.data.taken;
    return taken == true;
  } catch (e: any) {
    return false;
  }
}

export async function getEmailFromUid(
  uid: string
): Promise<{ email: string | null; exists: boolean }> {
  try {
    const res = await KryptikFetch("/api/user/emailFromUid", {
      method: "POST",
      timeout: 8000,
      body: JSON.stringify({ uid: uid }),
      headers: { "Content-Type": "application/json" },
    });
    const email: string | null = res.data.email;
    if (
      email == null &&
      res.data.msg &&
      res.data.msg.toLowerCase() == "user not found"
    ) {
      return { email: null, exists: false };
    }
    return { email: email, exists: true };
  } catch (e: any) {
    console.warn("Unable to get email from uid");
    return { email: null, exists: false };
  }
}
