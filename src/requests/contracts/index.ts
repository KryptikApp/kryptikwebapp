import { IContract } from "../../contracts/types";
import { KryptikFetch } from "../../kryptikFetch";

export async function getAppContracts(): Promise<IContract | null> {
  try {
    const res = await KryptikFetch("/api/contracts/all", {});
    const data = await res.data;
    const contracts: IContract = data.contracts;
    return contracts;
  } catch (e: any) {
    return null;
  }
}
