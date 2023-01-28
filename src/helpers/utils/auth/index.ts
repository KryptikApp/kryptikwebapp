import { KryptikFetch } from "../../../kryptikFetch";

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
      return false;
    }
    return true;
  } catch (e) {
    return false;
  }
}
