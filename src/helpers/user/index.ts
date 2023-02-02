import { KryptikFetch } from "../../kryptikFetch";
import { UserDB } from "../../models/user";

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
      console.warn("Unable to create share on db.");
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
