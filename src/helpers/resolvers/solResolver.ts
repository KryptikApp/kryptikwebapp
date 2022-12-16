import { PublicKey } from "@solana/web3.js";
import { Network, NetworkFamily } from "hdseedloop";
import { createEd25519PubKey } from "../utils/accountUtils";
import { networkFromNetworkDb } from "../utils/networkUtils";
import { IAccountResolverParams, IResolvedAccount } from "./accountResolver";

// UPDATE to support name resolution for whatever solana ens equivalent is
export const resolveSOLAccount = async function (
  params: IAccountResolverParams
): Promise<IResolvedAccount | null> {
  const { account, kryptikProvider, networkDB } = params;
  let network: Network = networkFromNetworkDb(networkDB);
  if (network.networkFamily != NetworkFamily.Solana) return null;
  // validate solana address
  // pubkey should be between 32 and 44 characters
  if (account.length < 32 || account.length > 44) return null;
  let solPubKey: PublicKey = createEd25519PubKey(account);
  if (!PublicKey.isOnCurve(solPubKey.toBuffer())) {
    return null;
  }
  // if account is valid then return resolved object
  let resolvedAccount: IResolvedAccount = {
    address: account,
    isResolved: true,
  };
  return resolvedAccount;
};
