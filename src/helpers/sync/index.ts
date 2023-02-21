import { TempSyncKey } from "@prisma/client";
import { KryptikFetch } from "../../kryptikFetch";

export async function getTempSyncKey(): Promise<TempSyncKey | null> {
  // try to fetch share from server
  try {
    const res = await KryptikFetch("/api/sync/retrieve", {
      method: "POST",
      timeout: 8000,
      headers: { "Content-Type": "application/json" },
    });
    const tempSyncKey: TempSyncKey | null | undefined = res.data.key;
    if (res.status != 200 || !tempSyncKey) {
      throw "Unable to get temp sync key.";
    }
    return tempSyncKey;
  } catch (e) {
    return null;
  }
}

/** Create sync session. returns temp sync key. */
export async function createTempSyncKey(
  totalToPair: number
): Promise<TempSyncKey | null> {
  const params = {
    totalToPair: totalToPair,
  };
  // try to fetch share from server
  try {
    const res = await KryptikFetch("/api/sync/create", {
      method: "POST",
      body: JSON.stringify(params),
      timeout: 8000,
      headers: { "Content-Type": "application/json" },
    });
    const tempSyncKey: TempSyncKey | null | undefined = res.data.key;
    if (res.status != 200 || !tempSyncKey) {
      throw "Unable to create temp sync key.";
    }
    return tempSyncKey;
  } catch (e) {
    return null;
  }
}
