import { KryptikFetch } from "../../kryptikFetch";

export type BlockchainAccountDb = {
  evmAddress: string;
  nearAddress: string;
  solAddress: string;
};

export async function addUserBlockchainAccountDB(
  account: BlockchainAccountDb
): Promise<boolean> {
  const params = {
    account: account,
  };
  // try to create share on db
  try {
    const res = await KryptikFetch("/api/account/create", {
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

export async function deleteUserBlockchainAccountDB() {
  // try to create share on db
  try {
    const res = await KryptikFetch("/api/account/delete", {
      method: "POST",
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

export async function getBlockchainAccountByEmail(
  email: string
): Promise<BlockchainAccountDb | null> {
  // try to create share on db
  try {
    const res = await KryptikFetch("/api/account/delete", {
      method: "POST",
      timeout: 8000,
      headers: { "Content-Type": "application/json" },
    });
    const account: BlockchainAccountDb | undefined | null = res.data.account;
    if (res.status != 200 || !account) {
      throw new Error("Unable to get account by email.");
    }
    return account;
  } catch (e) {
    return null;
  }
}
