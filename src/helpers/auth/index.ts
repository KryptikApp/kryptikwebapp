import { deleteVault } from "../../handlers/wallet/vaultHandler";
import { KryptikFetch } from "../../kryptikFetch";
import { UserDB } from "../../models/user";
import { getActiveUser } from "../user";

export async function handleApprove(
  email: string,
  code: string
): Promise<boolean> {
  const params = {
    email: email,
    code: code,
  };
  // try to add new friend on server
  try {
    const res = await KryptikFetch("/api/auth/approve", {
      method: "POST",
      body: JSON.stringify(params),
      timeout: 8000,
      headers: { "Content-Type": "application/json" },
    });
    if (res.status != 200) {
      console.warn("Unable to approve login.");
      console.log(res.data.msg);
      return false;
    }
    return true;
  } catch (e) {
    return false;
  }
}

export async function logout(): Promise<void> {
  // try to add new friend on server
  try {
    const res = await KryptikFetch("/api/auth/logout", {
      method: "POST",
      timeout: 8000,
      headers: { "Content-Type": "application/json" },
    });
    if (res.status != 200) {
      throw new Error("Unable to logout");
    }
  } catch (e) {
    // for now do nothing
  }
}

/**Makes request to delete user from database. Returns true if succesful. */
export async function deleteUser(): Promise<boolean> {
  // try to add new friend on server
  try {
    const res = await KryptikFetch("/api/user/deleteUser", {
      method: "POST",
      timeout: 8000,
      headers: { "Content-Type": "application/json" },
    });
    if (res.status != 200) {
      throw new Error("Unable to delete user");
    }
    return true;
  } catch (e) {
    return false;
  }
}

//TODO: REQUIRE USER TO ENTER CODE TO CONFIRM DELETE
export const removeUserAndWallet = async function () {
  const user = await getActiveUser();
  if (!user) {
    throw new Error("Error: User is not assigned. Unable to delete.");
  }
  if (!user) return;
  // delete local wallet
  deleteVault(user.uid);
  const succesful = await deleteUser();
  if (!succesful) {
    throw new Error("Unable to delete user from database.");
  }
};

const avatarPathList = [
  "/media/avatars/defaultAvatar1.jpg",
  "/media/avatars/defaultAvatar2.jpg",
  "/media/avatars/defaultAvatar3.jpg",
  "/media/avatars/defaultAvatar4.jpg",
];
/**
 * Returns a random number between min (inclusive) and max (exclusive)
 */
function getRandomIntArbitrary(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const getUserPhotoPath = function (user: UserDB): string {
  // if user has a proper photo url, return it
  if (user.photoUrl != null && user.photoUrl != "") {
    return user.photoUrl;
  }
  // if not... return a default avatar icon
  let randomAvatar = getRandomAvatarPhoto();
  // update shared user state
  user.photoUrl = randomAvatar;
  return randomAvatar;
};

export const getRandomAvatarPhoto = function (): string {
  let randomIndex: number = getRandomIntArbitrary(0, avatarPathList.length - 1);
  let photoUrl: string = avatarPathList[randomIndex];
  return photoUrl;
};

export async function handleRefreshTokens() {
  try {
    const res = await KryptikFetch("/api/auth/refresh", {
      method: "POST",
      timeout: 8000,
      headers: { "Content-Type": "application/json" },
    });
    if (res.status != 200) {
      throw new Error("Bad request");
    }
  } catch (e) {
    // console.warn("Unable to refresh auth token. May need to log in again.");
  }
}
