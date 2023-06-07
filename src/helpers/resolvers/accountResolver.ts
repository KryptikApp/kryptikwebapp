import { NetworkFamily } from "hdseedloop";
import { defaultWallet } from "../../models/defaultWallet";
import { NetworkDb } from "../../services/models/network";
import { KryptikProvider } from "../../services/models/provider";
import { networkFromNetworkDb } from "../utils/networkUtils";
import { resolveAlgoAccount } from "./algorandResolver";
import { resolveEVMAccount } from "./evmResolver";
import { resolveNEARAccount } from "./nearResolver";
import { resolveSOLAccount } from "./solResolver";

export interface IAccountResolverParams {
  account: string;
  networkDB: NetworkDb;
  kryptikProvider: KryptikProvider;
}

export interface IResolvedAccount {
  address: string;
  isResolved: boolean;
  avatarPath?: string;
  names?: string[];
}

export const defaultResolvedAccount: IResolvedAccount = {
  address: "",
  isResolved: false,
};

export const resolveAccount = async function (
  params: IAccountResolverParams
): Promise<IResolvedAccount | null> {
  console.log("Resolving account....");
  const { networkDB } = params;
  let network = networkFromNetworkDb(networkDB);
  // parse network prefix
  if (params.account.includes(":")) {
    let split = params.account.split(":");
    let prefix = split[0];
    let address = split[1];
    // TODO: case on network prefix
    params.account = address;
  }
  switch (network.networkFamily) {
    case NetworkFamily.Algorand: {
      let resolvedAccount: IResolvedAccount | null = await resolveAlgoAccount(
        params
      );
      return resolvedAccount;
    }
    case NetworkFamily.EVM: {
      let resolvedAccount: IResolvedAccount | null = await resolveEVMAccount(
        params
      );
      return resolvedAccount;
    }
    case NetworkFamily.Near: {
      let resolvedAccount: IResolvedAccount | null = await resolveNEARAccount(
        params
      );
      return resolvedAccount;
    }
    case NetworkFamily.Solana: {
      let resolvedAccount: IResolvedAccount | null = await resolveSOLAccount(
        params
      );
      return resolvedAccount;
    }
    default: {
      return null;
    }
  }
};
