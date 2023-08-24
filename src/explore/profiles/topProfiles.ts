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
    address: "2gRW6SUFnib7q3Z2Mucrn2GrnJ4JQEFV8oup8Ed4pSwu",
    names: ["👻.sol"],
    isResolved: true,
    networkTicker: "sol",
    avatarPath: "/media/avatars/community/ghost.jpg",
  },
  {
    address: "83qm84m1sgYunVmRKciGxbpVtFVCF2ATZGuTFwjoDcoV",
    isResolved: true,
    networkTicker: "sol",
    avatarPath: "/media/avatars/community/8k4jj.svg",
  },
  // {
  //   address: "",
  //   isResolved: true,
  //   names: ["betaso.near"],
  //   networkTicker: "near",
  //   avatarPath: "/media/avatars/community/betaso.jpg",
  // },
];

export async function loadTopProfiles(ks: Web3Service) {
  // randomize top profiles
  topProfiles.sort(() => Math.random() - 0.5);
  // run parallel request to resolve all top profiles
  const res = await Promise.all(
    topProfiles.map((p) => {
      if (p.isResolved) return Promise.resolve(p);
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
