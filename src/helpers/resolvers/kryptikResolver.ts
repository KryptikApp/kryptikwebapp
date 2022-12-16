// converts a registered email address to a blockchain address if present

import { collection, doc, getDoc, query } from "firebase/firestore";
import { isValidEVMAddress, NetworkFamily } from "hdseedloop";
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
  let docRef = doc(firestore, EMAIL_TO_ACCOUNT_DB_LOCATION, account);
  let dbRes = await getDoc(docRef);
  let dbResData = dbRes.data();
  let network = networkFromNetworkDb(networkDB);
  //maps ticker to blockchain address
  const tickerToAddress: { [ticker: string]: string } = {};
  for (const ticker in dbResData) {
    const addressDb: string = dbResData[ticker];
    // workaround...match any evm address and return
    if (
      network.networkFamily == NetworkFamily.EVM &&
      isValidEVMAddress(addressDb)
    ) {
      return {
        address: addressDb,
        isResolved: true,
        names: [account],
      };
    }
    tickerToAddress[ticker.toLowerCase()] = addressDb;
    // now key and value are the property name and value
  }
  let addressMatched = tickerToAddress[networkDB.ticker.toLowerCase()];
  if (!addressMatched) return null;
  let resolvedAccount: IResolvedAccount = {
    address: addressMatched,
    isResolved: true,
    names: [account],
  };
  return resolvedAccount;
};

export const isValidEmailAddress = function (email: string) {
  /* Checks for anystring@anystring.anystring */
  let re = /\S+@\S+\.\S+/;
  return re.test(email);
};
