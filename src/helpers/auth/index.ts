import { KryptikFetch } from "../../kryptikFetch";

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
