import { KryptikFetch } from "../../kryptikFetch";

export async function createShareOnDb(share: string): Promise<boolean> {
  const params = {
    share: share,
  };
  // try to create share on db
  try {
    const res = await KryptikFetch("/api/shares/create", {
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

export async function getRemoteShare(): Promise<string | null> {
  // try to fetch share from server
  try {
    const res = await KryptikFetch("/api/shares/retrieve", {
      method: "POST",
      timeout: 8000,
      headers: { "Content-Type": "application/json" },
    });
    const share = res.data.share;
    if (res.status != 200 || !share) {
      throw "Unable to get share.";
    }
    return share;
  } catch (e) {
    return null;
  }
}
