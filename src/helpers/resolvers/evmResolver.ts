import { Network, NetworkFamily, isValidEVMAddress } from "hdseedloop";
import { StaticJsonRpcProvider } from "@ethersproject/providers";

import { defaultNetworkDb } from "../../services/models/network";
import { networkFromNetworkDb } from "../utils/networkUtils";
import { IAccountResolverParams, IResolvedAccount } from "./accountResolver";
import { KryptikFetch } from "../../kryptikFetch";

export const resolveEVMAccount = async function (
  params: IAccountResolverParams
): Promise<IResolvedAccount | null> {
  const { account, kryptikProvider, networkDB } = params;
  const reqURL = `/api/resolve`;
  const body = {
    account: account,
  };
  const res = await KryptikFetch(reqURL, {
    body: JSON.stringify(body),
    method: "POST",
  });
  if (res.status != 200) return null;
  console.log(res);
  const data = await res.data;
  let resolvedAccount: IResolvedAccount = {
    address: data.address,
    isResolved: true,
    avatarPath: data.avatarPath ? data.avatarPath : undefined,
    names: data.names ? data.names : undefined,
  };
  return resolvedAccount;
};
