import {
  IResolvedAccount,
  resolveAccount,
} from "../../helpers/resolvers/accountResolver";
import Web3Service from "../../services/Web3Service";
import { NetworkDb, defaultNetworkDb } from "../../services/models/network";

export const topProfiles: IResolvedAccount[] = [
  {
    address: "",
    names: ["vitalik.eth"],
    isResolved: false,
    networkTicker: "eth",
  },
  {
    address: "",
    names: ["luc.eth"],
    isResolved: false,
    networkTicker: "eth",
  },
  {
    address: "",
    names: ["tombeiko.eth"],
    isResolved: false,
    networkTicker: "eth",
  },
  {
    address: "",
    names: ["ric.eth"],
    isResolved: false,
    networkTicker: "eth",
  },
  {
    address: "",
    names: ["lindajxie.eth"],
    isResolved: false,
    networkTicker: "eth",
  },

  {
    address: "",
    names: ["jettblu.eth"],
    isResolved: false,
    networkTicker: "eth",
  },
];

export async function loadTopProfiles(ks: Web3Service) {
  // run parallel request to resolve all top profiles
  const res = await Promise.all(
    topProfiles.map((p) => {
      const networkDb: NetworkDb =
        ks.getNetworkDbByTicker(p.networkTicker || defaultNetworkDb.ticker) ||
        defaultNetworkDb;
      const accountAddress = p.names && [p.names.length > 0]
        ? p.names[0]
        : p.address;
      const newProvider = ks.getKryptikProviderForNetworkDb(networkDb);
      const newAccount = resolveAccount({
        account: accountAddress,
        networkDB: networkDb,
        kryptikProvider: newProvider,
      });
      return newAccount;
    })
  );
  // filter out nulls
  const resolvedAccounts = res.filter((r) => r !== null) as IResolvedAccount[];
  console.log("resolvedAccounts", resolvedAccounts);
  return resolvedAccounts;
}
