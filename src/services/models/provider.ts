import { StaticJsonRpcProvider } from "@ethersproject/providers";
import { Connection } from "@solana/web3.js";

import { Network, NetworkFamily } from "hdseedloop";
import { Near } from "near-api-js";
import { NearConfig } from "near-api-js/lib/near";
import { getNetworkChainId } from "../../helpers/assets";
import { networkFromNetworkDb } from "../../helpers/utils/networkUtils";
import { defaultNetworkDb, NetworkDb } from "./network";
import { Algodv2 } from "algosdk";
import AlgodClient from "algosdk/dist/types/client/v2/algod/algod";

export class KryptikProvider {
  public ethProvider: StaticJsonRpcProvider | undefined;
  public solProvider: Connection | undefined;
  public algorandProvider: AlgodClient | undefined;
  public nearProvider: Near | undefined;
  public network: Network;
  public networkDb: NetworkDb;
  constructor(rpcEndpoint: string, networkDb: NetworkDb) {
    let network = networkFromNetworkDb(networkDb);
    this.network = network;
    this.networkDb = networkDb;
    switch (this.network.networkFamily) {
      case NetworkFamily.Near: {
        // UPDATE: sonetwork id is flexible (testnet or mainnet, etc.)
        let nearConfig: NearConfig = {
          networkId: "mainnet",
          nodeUrl: rpcEndpoint,
          headers: {},
        };
        this.nearProvider = new Near(nearConfig);
        break;
      }
      case NetworkFamily.EVM: {
        const chainId = getNetworkChainId(networkDb);
        this.ethProvider = new StaticJsonRpcProvider(rpcEndpoint, {
          name:
            networkDb.fullName.toLowerCase() == "ethereum"
              ? "homestead"
              : networkDb.fullName,
          chainId: chainId,
        });
        break;
      }
      case NetworkFamily.Solana: {
        this.solProvider = new Connection(rpcEndpoint);
        break;
      }
      case NetworkFamily.Algorand: {
        this.algorandProvider = new Algodv2("", rpcEndpoint, "");
        break;
      }
      default: {
        throw new Error(
          `Error: ${network.fullName} provider is not supported.`
        );
      }
    }
  }
}

export const defaultKryptikProvider = new KryptikProvider(
  defaultNetworkDb.provider,
  defaultNetworkDb
);
