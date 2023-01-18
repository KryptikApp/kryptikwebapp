// basic interface for Web3 Service
import { GetNetworkDbByTicker } from "../types";
import { NetworkDb } from "./network";
import { StaticJsonRpcProvider } from "@ethersproject/providers";
import { CreateEVMContractParameters, TokenDb, TokenAndNetwork } from "./token";
import { KryptikProvider } from "./provider";
import { Contract } from "ethers";

export interface IWeb3Service {
  NetworkDbs: NetworkDb[];
  TickerToNetworkDbs: { [ticker: string]: NetworkDb };
  tokenDbs: TokenDb[];
  rpcEndpoints: { [ticker: string]: string };
  web3Provider: StaticJsonRpcProvider;
  networkProviders: { [ticker: string]: KryptikProvider };
  createERC20Contract: (
    params: CreateEVMContractParameters
  ) => Promise<Contract | null>;
  getProviderForNetwork(nw: NetworkDb): KryptikProvider;
  InternalStartService(): {};
  getSupportedNetworkDbs(): NetworkDb[];
  searchNetworkDbsAsync(
    searchQuery: string,
    onlySupported?: boolean
  ): Promise<NetworkDb[]>;
  getAllNetworkDbs(onlySupported?: boolean): NetworkDb[];
  getKryptikProviderForNetworkDb(
    networkDb: NetworkDb
  ): Promise<KryptikProvider>;
  getNetworkDbByTicker: GetNetworkDbByTicker;
  getNetworkDbByBlockchainId: GetNetworkDbByTicker;
  getTokenAndNetworkFromTickers(
    networkTicker: string,
    tokenTicker?: string
  ): TokenAndNetwork;
}
