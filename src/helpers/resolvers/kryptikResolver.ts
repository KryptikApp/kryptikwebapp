// converts a registered email address to a blockchain address if present

import { collection, doc, getDoc, query } from "firebase/firestore";
import {
  isValidEVMAddress,
  NetworkFamily,
  NetworkFamilyFromFamilyName,
} from "hdseedloop";
import { BlockchainAccountDb, getBlockchainAccountByEmail } from "../accounts";
import { firestore } from "../firebaseHelper";
import { networkFromNetworkDb } from "../utils/networkUtils";
import { IAccountResolverParams, IResolvedAccount } from "./accountResolver";

//otherwise returns null
export const EMAIL_TO_ACCOUNT_DB_LOCATION = "emailToAccounts";

export interface IBlockchainAccounts {
  avaxc?: string;
  btc?: string;
  eth?: string;
  "eth(rop.)"?: string;
  "eth(arbitrum)"?: string;
  near?: string;
  sol?: string;
}

//TODO: UPDATE TO SUPPORT ADDRESSES MAPPING TO A SINGLE TICKER
//tries to convert registered email address to blockchain address
export const resolveKryptikAccount = async function (
  params: IAccountResolverParams
): Promise<IResolvedAccount | null> {
  const { account, networkDB } = params;
  console.log(`resolving kryptik account w/ id: ${account}`);
  // if not a valid email return null
  if (!isValidEmailAddress(account)) return null;
  console.log(`is valid email addy`);

  const blockchainAccounts: BlockchainAccountDb | null =
    await getBlockchainAccountByEmail(account);
  if (!blockchainAccounts) return null;

  const resolvedAccount: IResolvedAccount = {
    address: "",
    isResolved: true,
    names: [account],
  };

  const networkFamily = NetworkFamilyFromFamilyName(
    networkDB.networkFamilyName
  );
  switch (networkFamily) {
    case NetworkFamily.EVM: {
      const address: string = blockchainAccounts.evmAddress;
      if (isValidEVMAddress(address)) {
        resolvedAccount.address = address;
      } else {
        return null;
      }
      break;
    }
    case NetworkFamily.Near: {
      const address: string = blockchainAccounts.nearAddress;
      resolvedAccount.address = address;
      break;
    }
    case NetworkFamily.Solana: {
      const address: string = blockchainAccounts.solAddress;
      resolvedAccount.address = address;
      break;
    }
    default: {
      return null;
    }
  }
  return resolvedAccount;
};

export const isValidEmailAddress = function (email: string) {
  /* Checks for anystring@anystring.anystring */
  let re = /\S+@\S+\.\S+/;
  return re.test(email);
};
