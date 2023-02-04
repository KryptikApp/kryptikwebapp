import { PublicKey } from "@solana/web3.js";
import { Network, NetworkFamily } from "hdseedloop";
import { createEd25519PubKey } from "../utils/accountUtils";
import { networkFromNetworkDb } from "../utils/networkUtils";
import { IAccountResolverParams, IResolvedAccount } from "./accountResolver";
import { isValidAddress } from "algosdk";

// UPDATE to support name resolution for whatever solana ens equivalent is
export const resolveAlgoAccount = async function (
  params: IAccountResolverParams
): Promise<IResolvedAccount | null> {
  const { account, networkDB } = params;
  let network: Network = networkFromNetworkDb(networkDB);
  if (network.networkFamily != NetworkFamily.Algorand) return null;
  // ensure address is valid
  if (!isValidAddress) {
    return null;
  }
  // if account is valid then return resolved object
  let resolvedAccount: IResolvedAccount = {
    address: account,
    isResolved: true,
  };
  return resolvedAccount;
};
