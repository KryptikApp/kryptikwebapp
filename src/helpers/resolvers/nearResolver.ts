import { Network, NetworkFamily } from "hdseedloop";
import { PublicKey } from "near-api-js/lib/utils";
import { getNearAccounts, NearPubKeyFromHex } from "../utils/nearAccountUtils";
import { networkFromNetworkDb } from "../utils/networkUtils";
import { IAccountResolverParams, IResolvedAccount } from "./accountResolver";

export const resolveNEARAccount = async function (
  params: IAccountResolverParams
): Promise<IResolvedAccount | null> {
  const { account, kryptikProvider, networkDB } = params;
  console.log(`Resolving near account with id: ${account}`);
  let network: Network = networkFromNetworkDb(networkDB);
  if (!kryptikProvider.nearProvider) return null;
  if (network.networkFamily != NetworkFamily.Near) return null;
  let nearProvider = kryptikProvider.nearProvider;
  // check if valid implicit address
  if (validateNearImplicitAddress(account)) {
    let resolvedAccount: IResolvedAccount = {
      address: account,
      isResolved: true,
    };
    // fetch names
    let nearPubKey = NearPubKeyFromHex(account);
    console.log(nearPubKey.toString());
    let accountIds = await getNearAccounts(nearPubKey);
    console.log(accountIds);
    // if no custom address return
    if (!accountIds || accountIds.customAccounts.length == 0) {
      console.log("hitter");
      return resolvedAccount;
    }
    // else choose first custom account as resolved near name
    // UPDATE TO RETURN ALL custom accounts
    resolvedAccount.names = accountIds.customAccounts;
    return resolvedAccount;
  }
  try {
    // UPDATE IF MORE THAN ONE TOP LEVEL NEAR DOMAIN BECOMES AVAILABLE
    // Valid custom accounts will include .near
    // if not present.. then return null
    if (!account.includes(".near")) {
      return null;
    }
    // this line will trigger catch statement if no account available
    let nearAccount = await nearProvider.account(account);
    // if account is valid then return resolved object
    let resolvedAccount: IResolvedAccount = {
      address: account,
      isResolved: true,
    };
    return resolvedAccount;
  } catch (e) {
    if (!validateNearImplicitAddress(account)) return null;
    let resolvedAccount: IResolvedAccount = {
      address: account,
      isResolved: true,
    };
    return resolvedAccount;
  }
};

// update to run thorough validation
export const validateNearImplicitAddress = function (address: string) {
  if (address.length === 64 && !address.includes(".")) return true;
  return false;
};
