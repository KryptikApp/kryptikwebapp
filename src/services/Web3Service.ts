import { firestore } from "../helpers/firebaseHelper";
import { collection, getDocs, query } from "firebase/firestore";
import { OnFetch, ServiceState } from "./types";
import BaseService from "./BaseService";
import {
  defaultNetworkDb,
  defaultTokenAndNetwork,
  NetworkBalanceParameters,
  NetworkDb,
} from "./models/network";
import {
  JsonRpcProvider,
  StaticJsonRpcProvider,
} from "@ethersproject/providers";
import { Contract, utils } from "ethers";
import {
  Connection,
  PublicKey,
  RpcResponseAndContext,
  TokenAmount,
} from "@solana/web3.js";
import { Near } from "near-api-js";
import { AccountBalance as NearAccountBalance } from "near-api-js/lib/account";

import {
  Network,
  NetworkFamily,
  NetworkFamilyFromFamilyName,
} from "hdseedloop";
import {
  CreateEVMContractParameters,
  ChainData,
  TokenDb,
  TokenAndNetwork,
  ERC20Params,
  Nep141Params,
  SplParams,
  TokenBalanceParameters,
  TokenParamsEVM,
} from "./models/token";
import { erc20Abi } from "../abis/erc20Abi";
import { KryptikProvider } from "./models/provider";
import {
  createEd25519PubKey,
  createSolTokenAccount,
  getAddressForNetworkDb,
} from "../helpers/utils/accountUtils";
import {
  networkFromNetworkDb,
  getChainDataForNetwork,
  formatTicker,
} from "../helpers/utils/networkUtils";
import { IWallet } from "../models/KryptikWallet";
import { searchTokenListByTicker } from "../handlers/search/token";
import { IWeb3Service } from "./models/IWeb3Service";
import {
  getPriceOfMultipleTickers,
  getPriceOfTicker,
  PricesDict,
} from "../helpers/coinGeckoHelper";
import {
  lamportsToSol,
  divByDecimals,
  roundCryptoAmount,
  roundUsdAmount,
} from "../helpers/utils/numberUtils";
import { buildEmptyBalance, IBalance } from "./models/IBalance";
import { KryptikBalanceHolder } from "./models/KryptikBalanceHolder";
import {
  covalentDataToBalance,
  covalentSupportedChainIds,
} from "../helpers/balances";
import {
  CovalentAddressBalanceResponseData,
  fetchServerBalances,
} from "../requests/covalent";
import {
  ETH_CONTRACT_ADDRESS,
  EVM_NULL_ADDRESS,
} from "../constants/evmConstants";
import {
  NATIVE_SOL_MINT,
  SOL_COVALENT_CHAINID,
} from "../constants/solConstants";
import { KryptikPriceHolder } from "./models/KryptikPriceHolder";

const NetworkDbsRef = collection(firestore, "networks");
const ALLTOKENSRef = collection(firestore, "tokens");

export interface IConnectWalletReturn {
  wallet: IWallet;
  remoteShare: string;
}

// todo: update to route all price requests through this service
// so we can take advantage of cached responses
class Web3Service extends BaseService implements IWeb3Service {
  getProviderForNetwork(nw: NetworkDb): KryptikProvider {
    return this.networkProviders[nw.ticker];
  }
  public NetworkDbs: NetworkDb[] = [];
  public TickerToNetworkDbs: { [ticker: string]: NetworkDb } = {};
  public tokenDbs: TokenDb[] = [];
  // NetworkDb is referenced by its BIP44 chain id
  public rpcEndpoints: { [ticker: string]: string } = {};
  public web3Provider: StaticJsonRpcProvider =
    null as unknown as StaticJsonRpcProvider;
  //providers for each network
  public networkProviders: { [ticker: string]: KryptikProvider } = {};
  // kryptik balances cache
  public kryptikBalances: KryptikBalanceHolder | null = null;
  // kryptik prices cache
  public kryptikPrices: KryptikPriceHolder | null = null;

  constructor() {
    super();
  }

  async InternalStartService() {
    // fetch network data
    try {
      await this.populateNetworkDbsAsync();
    } catch (e) {
      throw Error(
        "Error: Unable to populate NetworkDbs when starting web3 service."
      );
    }
    // fetch token data
    try {
      await this.populateTokenDbsAsync();
    } catch (e) {
      throw new Error(
        "Error: Unable to populate TokenDb array from database when starting web3 service."
      );
    }

    this.setRpcEndpoints();
    this.setSupportedProviders();
    try {
      await this.getAllSupportedPrices();
    } catch {
      console.warn("Unable to get prices when starting web3 service");
    }
    // console logs for debugging
    // REMOVE for production
    console.log("Internal start service: KryptiK Web3");
    console.log("Service Id:");
    console.log(this.serviceId);
    return this;
  }

  // sets rpc endpoints for each supported NetworkDb
  private setRpcEndpoints() {
    for (const NetworkDb of this.NetworkDbs) {
      let ticker: string = NetworkDb.ticker;
      if (NetworkDb.isSupported) {
        try {
          this.rpcEndpoints[ticker] = NetworkDb.provider;
        } catch {
          // TODO: add better handler
          console.warn(
            "NetworkDb is specified as supported, but there was an error adding rpc endpoint. Check rpc config."
          );
        }
      }
    }
  }

  // sets providers for each supported NetworkDb
  private setSupportedProviders() {
    for (let ticker in this.rpcEndpoints) {
      this.setProviderFromTicker(ticker);
    }
  }

  private setProviderFromTicker(ticker: string): KryptikProvider {
    let rpcEndpoint: string = this.rpcEndpoints[ticker];
    let networkDb = this.NetworkDbs.find((nw) => nw.ticker == ticker);
    // TODO: ADD NON-BREAKING ERROR HANDLER
    if (!networkDb)
      throw new Error("Error: Unable to find service networkdb by ticker.");
    let newKryptikProvider = new KryptikProvider(rpcEndpoint, networkDb);
    this.networkProviders[ticker] = newKryptikProvider;
    return newKryptikProvider;
  }

  private async populateTokenDbsAsync(): Promise<TokenDb[]> {
    console.log("Populating erc20 data from db");
    const q = query(ALLTOKENSRef);
    const querySnapshot = await getDocs(q);
    let tokenDbsResult: TokenDb[] = [];
    querySnapshot.forEach((doc) => {
      let docData = doc.data();
      let tokenDbToAdd: TokenDb = {
        name: docData.name,
        coingeckoId: docData.coingeckoId,
        symbol: docData.symbol,
        decimals: docData.decimals,
        hexColor: docData.hexColor ? docData.hexColor : "#000000",
        chainData: docData.chainData,
        logoURI: docData.logoURI,
        extensions: docData.extensions,
        tags: docData.tags,
      };
      tokenDbsResult.push(tokenDbToAdd);
    });
    this.tokenDbs = tokenDbsResult;
    return this.tokenDbs;
  }

  private async populateNetworkDbsAsync(): Promise<NetworkDb[]> {
    console.log("POPULATING Networks from db");
    console.log("Service ID:");
    console.log(this.serviceId);
    const q = query(NetworkDbsRef);
    const querySnapshot = await getDocs(q);
    let NetworkDbsResult: NetworkDb[] = [];
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      let docData = doc.data();
      let providerFromDb: string = "";
      if (docData.provider) providerFromDb = docData.provider;
      // UPDATE TO ADD NONSUPPORTED AS WELL?
      if (docData.isSupported) {
        let NetworkDbToAdd: NetworkDb = {
          fullName: docData.fullName,
          networkFamilyName: docData.networkFamilyName,
          ticker: docData.ticker,
          chainId: docData.chainId,
          hexColor: docData.hexColor,
          decimals: docData.decimals ? docData.decimals : 6,
          evmData: docData.evmData ? docData.evmData : undefined,
          about: docData.about,
          blockchainId: docData.blockchainId ? docData.blockchainId : "",
          blockExplorerURL: docData.blockExplorerURL,
          dateCreated: docData.dateCreated,
          iconPath: docData.iconPath,
          whitePaperPath: docData.whitePaperPath,
          isSupported: docData.isSupported,
          provider: providerFromDb,
          coingeckoId: docData.coingeckoId,
          isTestnet: docData.isTestnet ? docData.isTestnet : false,
        };
        NetworkDbsResult.push(NetworkDbToAdd);
        this.TickerToNetworkDbs[NetworkDbToAdd.ticker] = NetworkDbToAdd;
      }
    });
    this.NetworkDbs = NetworkDbsResult;
    return NetworkDbsResult;
  }

  getSupportedNetworkDbs(): NetworkDb[] {
    return this.NetworkDbs;
    // UNCOMMENT CODE BELOW TO HANDLE UNSUPPORTED NETWORKS;
    // let NetworkDbsResult:NetworkDb[] = [];
    // for(const NetworkDb of this.NetworkDbs){
    //     // filter results based on searchquery
    //     if(NetworkDb.isSupported){
    //         // build NetworkDb object from doc result
    //         NetworkDbsResult.push(NetworkDb);
    //     }
    // }
    // return NetworkDbsResult;
  }

  async searchNetworkDbsAsync(
    searchQuery: string,
    onlySupported?: boolean
  ): Promise<NetworkDb[]> {
    // set default to false if not specified
    if (onlySupported == undefined) {
      onlySupported = false;
    }
    // TODO: update to be if null or empty
    if (searchQuery == "") {
      if (onlySupported) {
        return this.getSupportedNetworkDbs();
      } else {
        return this.NetworkDbs;
      }
    }
    // standardize search query
    searchQuery = searchQuery.toUpperCase();
    // initialize NetworkDbs list
    let NetworkDbsResult: NetworkDb[] = [];
    if (onlySupported) {
      this.NetworkDbs.forEach((NetworkDb) => {
        // filter results based on searchquery
        if (
          (NetworkDb.ticker.toUpperCase().includes(searchQuery) ||
            NetworkDb.fullName.toUpperCase().includes(searchQuery)) &&
          NetworkDb.isSupported
        ) {
          // build NetworkDb object from doc result
          NetworkDbsResult.push(NetworkDb);
          // console.log(doc.id, " => ", doc.data());
        }
      });
    } else {
      this.NetworkDbs.forEach((NetworkDb) => {
        // filter results based on searchquery
        if (
          NetworkDb.ticker.toUpperCase().includes(searchQuery) ||
          NetworkDb.fullName.toUpperCase().includes(searchQuery)
        ) {
          // build NetworkDb object from doc result
          NetworkDbsResult.push(NetworkDb);
          // console.log(doc.id, " => ", doc.data());
        }
      });
    }
    return NetworkDbsResult;
  }

  getAllNetworkDbs(onlySupported: boolean = true): NetworkDb[] {
    if (this.serviceState != ServiceState.started)
      throw "Service is not running. NetworkDb data has not been populated.";
    if (onlySupported) {
      return this.getSupportedNetworkDbs();
    } else {
      return this.NetworkDbs;
    }
  }

  getAllTokens(onlySupported: boolean = true): TokenDb[] {
    if (this.serviceState != ServiceState.started) {
      throw "Service is not running. NetworkDb data has not been populated.";
    }
    // update to respect onlySupported request
    // currently assuming all tokens in service are supported
    return this.tokenDbs;
  }

  // send rpc call given a NetworkDb
  async sendRpcCall(
    payload: {
      method: string;
      params: any[];
    },
    provider: StaticJsonRpcProvider | null = null
  ): Promise<any> {
    return (provider || this.web3Provider)?.send(
      payload.method,
      payload.params
    );
  }

  // helper functions!!
  async getKryptikProviderForNetworkDb(
    networkDb: NetworkDb
  ): Promise<KryptikProvider> {
    return this.getKryptikProviderFromTicker(networkDb.ticker);
  }

  private async getKryptikProviderFromTicker(
    ticker: string
  ): Promise<KryptikProvider> {
    // try to get existing provider (set on construction)... else, make provider and add to dict.
    if (this.networkProviders[ticker] != null)
      return this.networkProviders[ticker];
    let newKryptikProvider: KryptikProvider =
      this.setProviderFromTicker(ticker);
    return newKryptikProvider;
  }

  getNetworkDbByTicker(ticker: string): NetworkDb | null {
    let networkDbRes: NetworkDb = this.TickerToNetworkDbs[ticker];
    if (networkDbRes) return networkDbRes;
    return null;
  }

  getNetworkDbByBlockchainId(id: string): NetworkDb | null {
    const networkDbRes: NetworkDb | null =
      this.NetworkDbs.find(
        (nd) => nd.blockchainId.toLowerCase() == id.toLowerCase()
      ) || null;
    return networkDbRes;
  }

  // creates and returns an erc20 contract
  createERC20Contract = async (
    params: CreateEVMContractParameters
  ): Promise<Contract | null> => {
    // hdseedloop compatible network
    let network = networkFromNetworkDb(params.networkDb);
    let provider = await this.getKryptikProviderForNetworkDb(params.networkDb);
    if (!provider.ethProvider) return null;
    let ethProvider: JsonRpcProvider = provider.ethProvider;
    let erc20ChainData: ChainData | null = getChainDataForNetwork(
      params.networkDb,
      params.erc20Db
    );
    if (!erc20ChainData) return null;
    let erc20Contract = new Contract(erc20ChainData.address, erc20Abi);
    let contractConnected = erc20Contract.connect(ethProvider);
    return contractConnected;
  };

  // TODO: UPDATE TO FILTER ON FAMILY
  getTokenAndNetworkFromTickers(
    networkTicker: string,
    tokenTicker?: string
  ): TokenAndNetwork {
    let networkDb: NetworkDb | null = this.getNetworkDbByTicker(networkTicker);
    // UPDATE TO THROW ERROR OR RETURN NULL?
    if (!networkDb) return defaultTokenAndNetwork;
    // no token... just return obj with base network
    if (!tokenTicker) return { baseNetworkDb: networkDb };
    let networkFamily = NetworkFamilyFromFamilyName(
      networkDb.networkFamilyName
    );
    let tokenDb: TokenDb | null = null;
    switch (networkFamily) {
      case NetworkFamily.EVM: {
        tokenDb = searchTokenListByTicker(this.tokenDbs, tokenTicker);
        break;
      }
      case NetworkFamily.Near: {
        tokenDb = searchTokenListByTicker(this.tokenDbs, tokenTicker);
        break;
      }
      case NetworkFamily.Solana: {
        tokenDb = searchTokenListByTicker(this.tokenDbs, tokenTicker);
        break;
      }
      default: {
        tokenDb = null;
      }
    }
    // set token data if it exists
    if (tokenDb) {
      const chainData = getChainDataForNetwork(networkDb, tokenDb);
      let newTokenAndNetwork: TokenAndNetwork = {
        baseNetworkDb: networkDb,
        tokenData: {
          tokenDb: tokenDb,
          selectedAddress: chainData ? chainData.address : EVM_NULL_ADDRESS,
        },
      };
      return newTokenAndNetwork;
    }
    return { baseNetworkDb: networkDb };
  }

  // GET BALANCE FOR A SINGLE NETWORK
  async getBalanceNetwork(
    params: NetworkBalanceParameters
  ): Promise<TokenAndNetwork | null> {
    const cachedPrice = this.kryptikPrices
      ? this.kryptikPrices.getPriceById(params.networkDb.coingeckoId)
      : null;
    let priceUSD =
      cachedPrice || (await getPriceOfTicker(params.networkDb.coingeckoId));
    let balanceNetwork: number;
    let network: Network = networkFromNetworkDb(params.networkDb);
    let kryptikProvider: KryptikProvider =
      await this.getKryptikProviderForNetworkDb(params.networkDb);
    // get balance in layer 1 token amount
    switch (network.networkFamily) {
      case NetworkFamily.EVM: {
        if (!kryptikProvider.ethProvider) return null;
        let ethNetworkProvider: JsonRpcProvider = kryptikProvider.ethProvider;
        balanceNetwork = Number(
          utils.formatEther(
            await ethNetworkProvider.getBalance(params.accountAddress)
          )
        );
        break;
      }
      case NetworkFamily.Solana: {
        // gets pub key for solana network
        let solPubKey: PublicKey = createEd25519PubKey(params.accountAddress);
        // ensures provider is set
        if (!kryptikProvider.solProvider)
          throw new Error("No near provider is set up.");
        let solNetworkProvider: Connection = kryptikProvider.solProvider;
        balanceNetwork = lamportsToSol(
          await solNetworkProvider.getBalance(solPubKey)
        );
        break;
      }
      case NetworkFamily.Near: {
        // ensures provider is set
        if (!kryptikProvider.nearProvider)
          throw new Error("No solana provider is set up.");
        let nearNetworkProvider: Near = kryptikProvider.nearProvider;
        // create account with implicit address
        try {
          let nearAccount = await nearNetworkProvider.account(
            params.accountAddress
          );
          let nearBalanceObject: NearAccountBalance =
            await nearAccount.getAccountBalance();
          balanceNetwork = divByDecimals(
            Number(nearBalanceObject.total),
            params.networkDb.decimals
          ).asNumber;
        } catch (e) {
          balanceNetwork = 0;
        }
        break;
      }
      default: {
        return null;
      }
    }
    // prettify balance
    let networkBalanceString = balanceNetwork.toString();
    let amountUSD = priceUSD * balanceNetwork;
    // HANDLE ICONS FOR LAYER TWO NETWORKS
    let iconMain = params.networkDb.iconPath;
    let iconSecondary = undefined;
    // UPDATE IF SO any second layer maps with main layer
    if (params.networkDb.ticker == "eth(arbitrum)") {
      iconMain = defaultNetworkDb.iconPath;
      iconSecondary = params.networkDb.iconPath;
    }
    // create new balance obj for balance data
    let newBalanceObj: IBalance = {
      fullName: params.networkDb.fullName,
      ticker: params.networkDb.ticker,
      iconPath: iconMain,
      iconPathSecondary: iconSecondary,
      amountCrypto: networkBalanceString,
      amountUSD: amountUSD.toString(),
      baseNetworkTicker: network.ticker,
    };

    return { baseNetworkDb: params.networkDb, networkBalance: newBalanceObj };
  }

  // gets balances for all supported networks and tokens
  async getAllBalances(params: {
    walletUser: IWallet;
    isAdvanced?: boolean;
    onFetch?: OnFetch;
    tryCached?: boolean;
    useCovalent?: boolean;
  }): Promise<KryptikBalanceHolder> {
    const { walletUser, isAdvanced, onFetch, tryCached, useCovalent } = {
      ...params,
    };
    // default try cached value is true
    const getCached = tryCached != undefined ? tryCached : true;
    // default use covalent is true
    const getCovalentBals = useCovalent != undefined ? useCovalent : true;
    // use cached balances if fresh
    if (getCached && this.kryptikBalances && this.kryptikBalances.isFresh()) {
      console.log("Returning cached balances...");
      return this.kryptikBalances;
    }
    if (!this.kryptikPrices) {
      // get prices in place
      this.getAllSupportedPrices();
    }
    let masterBalances: TokenAndNetwork[] = [];
    // get indexed balances... currently fetching from covalent
    let indexedNetworksList: NetworkDb[] = [];
    if (getCovalentBals) {
      let indexedData = await this.getAllIndexedBalances({
        walletUser: walletUser,
        onFetch: onFetch,
      });
      indexedNetworksList = indexedData.indexedNetworks;
      masterBalances = masterBalances.concat(indexedData.tokensAndBals);
    }
    // get remaining balances manually via rpc provider
    let tickerToNetworkBalance: { [ticker: string]: IBalance } = {};
    // fetch balances by sector
    let networkBalances = await this.getBalanceAllNetworks({
      walletUser: walletUser,
      indexedNetworks: indexedNetworksList,
      isAdvanced: isAdvanced ? isAdvanced : false,
      onFetch: onFetch,
    });
    // create dictionary of network balances
    for (const tokenAndNetwork of networkBalances) {
      if (tokenAndNetwork.networkBalance) {
        tickerToNetworkBalance[tokenAndNetwork.baseNetworkDb.ticker] =
          tokenAndNetwork.networkBalance;
      }
    }
    let erc20Balances = await this.getBalanceAllERC20Tokens({
      walletUser: walletUser,
      indexedNetworks: indexedNetworksList,
      onFetch: onFetch,
    });
    let nep141Balances = await this.getBalanceAllNep141Tokens({
      walletUser: walletUser,
      indexedNetworks: indexedNetworksList,
      onFetch: onFetch,
    });
    let splBalances = await this.getBalanceAllSplTokens({
      walletUser: walletUser,
      indexedNetworks: indexedNetworksList,
      onFetch: onFetch,
    });
    // add base network balance to token and network objects... in place
    // TODO: update, so we don't take a second pass over balances
    this.addBaseBalance(tickerToNetworkBalance, erc20Balances);
    this.addBaseBalance(tickerToNetworkBalance, erc20Balances);
    this.addBaseBalance(tickerToNetworkBalance, erc20Balances);
    // add to master balance list
    masterBalances = masterBalances.concat(networkBalances);
    masterBalances = masterBalances.concat(erc20Balances);
    masterBalances = masterBalances.concat(nep141Balances);
    masterBalances = masterBalances.concat(splBalances);
    // init new kryptik balance holder
    let newBalanceHolder: KryptikBalanceHolder = new KryptikBalanceHolder({
      tokenAndBalances: masterBalances,
    });
    // add new balance holder to service state
    this.kryptikBalances = newBalanceHolder;
    return newBalanceHolder;
  }

  // TODO: ADD ROUTER IF WE HAVE DIFFERENT INDEXER METHODS FOR DIFFERENT NETWORKS
  // gets assets for all indexed chains
  private getAllIndexedBalances = async (params: {
    walletUser: IWallet;
    onFetch?: OnFetch;
  }): Promise<{
    indexedNetworks: NetworkDb[];
    tokensAndBals: TokenAndNetwork[];
  }> => {
    const { walletUser, onFetch } = { ...params };
    const ethNetwork = this.getNetworkDbByTicker("eth");
    const solNetwork = this.getNetworkDbByTicker("sol");
    const avaxcNetwork = this.getNetworkDbByTicker("avaxc");
    const arbitrumNetwork = this.getNetworkDbByTicker("eth(arbitrum)");
    const polygonNetwork = this.getNetworkDbByTicker("matic");
    let indexedNetworks: NetworkDb[] = [];
    const addyToNetworks: { [address: string]: NetworkDb[] } = {};
    if (
      ethNetwork &&
      solNetwork &&
      arbitrumNetwork &&
      avaxcNetwork &&
      polygonNetwork
    ) {
      let solAddress = getAddressForNetworkDb(walletUser, solNetwork);
      let ethAddress = getAddressForNetworkDb(walletUser, ethNetwork);
      addyToNetworks[ethAddress] = [
        ethNetwork,
        arbitrumNetwork,
        avaxcNetwork,
        polygonNetwork,
      ];
      addyToNetworks[solAddress] = [solNetwork];
    }
    // init covalent balance data
    let covalentBalances: CovalentAddressBalanceResponseData | null = null;
    let balancesToReturn: TokenAndNetwork[] = [];
    // request and format covalent balances for each chain
    // TODO: REDUCE THE COMPLEXITY (performance and readability) OF THE CODE BELOW
    for (const addy in addyToNetworks) {
      let networkDbs: NetworkDb[] = addyToNetworks[addy];
      // nested for loop with the ASSUMPTION THAT INNERLOOP WILL HAVE <10 ITERATIONS
      // get indexed balances for each network
      for (const networkDb of networkDbs) {
        let networkChainId: number = networkDb.evmData
          ? networkDb.evmData.chainId
          : networkDb.chainId;
        // solana covalent chain id is different
        if (
          NetworkFamilyFromFamilyName(networkDb.networkFamilyName) ==
          NetworkFamily.Solana
        ) {
          networkChainId = SOL_COVALENT_CHAINID;
        }

        if (!covalentSupportedChainIds.includes(networkChainId)) continue;
        // try to get indexed balances for network
        try {
          covalentBalances = await fetchServerBalances(
            networkChainId,
            addy,
            "usd"
          );
          if (covalentBalances) {
            let baseNetworkAndBalance: TokenAndNetwork = {
              baseNetworkDb: networkDb,
            };
            let tempTokenAndBalances: TokenAndNetwork[] = [];
            for (const cBal of covalentBalances.items) {
              const newBal: IBalance = covalentDataToBalance(networkDb, cBal);
              // check if balance corresponds to base network
              if (
                (!baseNetworkAndBalance &&
                  formatTicker(cBal.contract_ticker_symbol) ==
                    formatTicker(networkDb.ticker)) ||
                cBal.contract_address == ETH_CONTRACT_ADDRESS ||
                cBal.contract_address == NATIVE_SOL_MINT
              ) {
                baseNetworkAndBalance = {
                  baseNetworkDb: networkDb,
                  networkBalance: newBal,
                };
                tempTokenAndBalances.push(baseNetworkAndBalance);
                if (onFetch) {
                  onFetch(baseNetworkAndBalance);
                }
              }
              // else... we have a regular token
              else {
                // get kryptik token data, create token+bal object
                let tokenDb: TokenDb | null = searchTokenListByTicker(
                  this.tokenDbs,
                  newBal.ticker
                );
                if (tokenDb) {
                  let newTokenAndBal: TokenAndNetwork = {
                    baseNetworkDb: networkDb,
                    tokenData: {
                      tokenDb: tokenDb,
                      tokenBalance: newBal,
                      selectedAddress: cBal.contract_address,
                    },
                  };
                  tempTokenAndBalances.push(newTokenAndBal);
                }
              }
            }
            // add base network balance to each token + balance
            if (!baseNetworkAndBalance.networkBalance) {
              baseNetworkAndBalance.networkBalance =
                buildEmptyBalance(networkDb);
              balancesToReturn.push(baseNetworkAndBalance);
              if (onFetch) {
                onFetch(baseNetworkAndBalance);
              }
            }
            for (const tokenAndBal of tempTokenAndBalances) {
              if (!baseNetworkAndBalance.networkBalance) break;
              tokenAndBal.networkBalance = baseNetworkAndBalance.networkBalance;
              if (onFetch) {
                onFetch(baseNetworkAndBalance);
              }
            }
            balancesToReturn = balancesToReturn.concat(tempTokenAndBalances);
            // if we got here... indexing was successful... so add network to indexed list
            indexedNetworks.push(networkDb);
          }
        } catch (e) {
          console.warn(
            `Unable to get indexed balances for ${networkDb.fullName}`
          );
        }
      }
    }
    return {
      indexedNetworks: indexedNetworks,
      tokensAndBals: balancesToReturn,
    };
  };

  // add base network balance
  addBaseBalance(
    tickerNetworkDict: { [ticker: string]: IBalance },
    bals: TokenAndNetwork[]
  ) {
    for (const tokenAndNetwork of bals) {
      if (!tokenAndNetwork.networkBalance) {
        let networkBalalance =
          tickerNetworkDict[tokenAndNetwork.baseNetworkDb.ticker];
        if (networkBalalance) {
          tokenAndNetwork.networkBalance = networkBalalance;
        }
      }
    }
  }

  // TODO: Update to support tx. based networks
  async getBalanceAllNetworks(params: {
    walletUser: IWallet;
    onFetch?: OnFetch;
    isAdvanced: boolean;
    indexedNetworks: NetworkDb[];
  }): Promise<TokenAndNetwork[]> {
    const { walletUser, isAdvanced, indexedNetworks, onFetch } = { ...params };
    let networksFromDb = this.getSupportedNetworkDbs();
    // initialize return array
    let balanceAndNetworks: TokenAndNetwork[] = [];
    for (const nw of networksFromDb) {
      // only show testnets to advanced users
      if (nw.isTestnet && !isAdvanced) {
        if (onFetch) {
          onFetch(null);
        }
        continue;
      }
      if (indexedNetworks.includes(nw)) {
        continue;
      }
      // gets all addresses for network
      let accountAddress: string = await getAddressForNetworkDb(walletUser, nw);
      let NetworkBalanceParams: NetworkBalanceParameters = {
        accountAddress: accountAddress,
        networkDb: nw,
      };
      try {
        let networkBalance: TokenAndNetwork | null =
          await this.getBalanceNetwork(NetworkBalanceParams);
        // push balance obj to balance data array
        if (networkBalance) balanceAndNetworks.push(networkBalance);
        if (onFetch) {
          onFetch(networkBalance);
        }
      } catch (e) {
        if (onFetch) {
          onFetch(null);
        }
        console.warn(`Unable to fetch network balance for ${nw.fullName}`);
      }
    }
    return balanceAndNetworks;
  }

  // gets balance for a single erc20 token
  async getBalanceErc20Token(
    params: TokenBalanceParameters
  ): Promise<TokenAndNetwork> {
    if (!params.erc20Params)
      throw new Error(
        "Error: Contract must be provided to fetch erc20 token balance."
      );
    let evmParams: TokenParamsEVM = {
      contractAddress: params.erc20Params.erc20Contract.address,
    };
    // fetch price
    let priceUSD = await getPriceOfTicker(params.tokenDb.coingeckoId);
    // fetch balance
    console.log(
      `getting ${params.tokenDb.name} ERC20 balance for ${params.accountAddress}`
    );
    let fetchedTokenAmount: number = Number(
      await params.erc20Params.erc20Contract.balanceOf(params.accountAddress)
    );
    let tokenBalance: number = divByDecimals(
      fetchedTokenAmount,
      params.tokenDb.decimals
    ).asNumber;
    // prettify token balance
    let networkBalanceString = tokenBalance.toString();
    let amountUSD = priceUSD * tokenBalance;
    // create new object for balance data
    let newBalanceObj: IBalance = {
      fullName: params.tokenDb.name,
      ticker: params.tokenDb.symbol,
      iconPath: params.tokenDb.logoURI,
      iconPathSecondary: params.networkDb.iconPath,
      amountCrypto: networkBalanceString,
      amountUSD: amountUSD.toString(),
      baseNetworkTicker: params.networkDb.ticker,
    };
    let tokenAndNetwork: TokenAndNetwork = {
      baseNetworkDb: params.networkDb,
      tokenData: {
        tokenDb: params.tokenDb,
        tokenParamsEVM: evmParams,
        tokenBalance: newBalanceObj,
        selectedAddress: evmParams.contractAddress,
      },
    };
    tokenAndNetwork;
    return tokenAndNetwork;
  }

  async getBalanceNep141Token(
    params: TokenBalanceParameters
  ): Promise<TokenAndNetwork> {
    if (!params.nep141Params)
      throw new Error(
        "Error: Contract must be provided to fetch nep141 token balance."
      );
    let kryptikProvider = await this.getKryptikProviderForNetworkDb(
      params.networkDb
    );
    if (!kryptikProvider.nearProvider)
      throw new Error(
        `Error: no provider specified for ${params.networkDb.fullName}`
      );

    let nearNetworkProvider: Near = kryptikProvider.nearProvider;
    // fetch price
    let priceUSD = await getPriceOfTicker(params.tokenDb.coingeckoId);
    // fetch balance
    console.log(
      `getting ${params.tokenDb.name} balance for ${params.accountAddress}`
    );
    let networkBalance: number;
    try {
      let nearAccount = await nearNetworkProvider.account(
        params.accountAddress
      );
      // call token contract balance method
      let response = await nearAccount.viewFunction(
        params.nep141Params.tokenAddress,
        "ft_balance_of",
        { account_id: params.accountAddress }
      );
      networkBalance = divByDecimals(
        Number(response),
        params.tokenDb.decimals
      ).asNumber;
    } catch (e) {
      networkBalance = 0;
    }
    // prettify token balance
    let networkBalanceString = networkBalance.toString();
    let amountUSD = roundUsdAmount(priceUSD * networkBalance);
    // create new object for balance data
    let newBalanceObj: IBalance = {
      fullName: params.tokenDb.name,
      ticker: params.tokenDb.symbol,
      iconPath: params.tokenDb.logoURI,
      iconPathSecondary: params.networkDb.iconPath,
      amountCrypto: networkBalanceString,
      amountUSD: amountUSD.toString(),
      baseNetworkTicker: params.networkDb.ticker,
    };
    let tokenAndNetwork: TokenAndNetwork = {
      baseNetworkDb: params.networkDb,
      tokenData: {
        tokenDb: params.tokenDb,
        tokenBalance: newBalanceObj,
        selectedAddress: params.nep141Params.tokenAddress,
      },
    };
    return tokenAndNetwork;
  }

  async getBalanceSplToken(
    params: TokenBalanceParameters
  ): Promise<TokenAndNetwork> {
    if (!params.splParams)
      throw new Error(`Error: spl balance parameters not provided.`);
    let kryptikProvider = await this.getKryptikProviderForNetworkDb(
      params.networkDb
    );
    if (!kryptikProvider.solProvider)
      throw new Error(
        `Error: no provider specified for ${params.networkDb.fullName}`
      );
    // fetch price
    let priceUSD = await getPriceOfTicker(params.tokenDb.coingeckoId);
    // fetch balance
    // UPDATE TO SUPPORT ARRAY OF CHAIN DATA
    let tokenAccount = await createSolTokenAccount(
      params.accountAddress,
      params.splParams.tokenAddress
    );
    let tokenBalance: number;
    // if no token account exists, value should be 0
    try {
      let repsonse: RpcResponseAndContext<TokenAmount> =
        await kryptikProvider.solProvider.getTokenAccountBalance(tokenAccount);
      tokenBalance = divByDecimals(
        Number(repsonse.value.amount),
        repsonse.value.decimals
      ).asNumber;
    } catch (e) {
      tokenBalance = 0;
    }
    // prettify token balance
    let networkBalanceString = tokenBalance.toString();
    let amountUSD = priceUSD * tokenBalance;
    // create new object for balance data
    let newBalanceObj: IBalance = {
      fullName: params.tokenDb.name,
      ticker: params.tokenDb.symbol,
      iconPath: params.tokenDb.logoURI,
      iconPathSecondary: params.networkDb.iconPath,
      amountCrypto: networkBalanceString,
      amountUSD: amountUSD.toString(),
      baseNetworkTicker: params.networkDb.ticker,
    };
    let tokenAndNetwork: TokenAndNetwork = {
      baseNetworkDb: params.networkDb,
      tokenData: {
        tokenDb: params.tokenDb,
        tokenBalance: newBalanceObj,
        selectedAddress: params.splParams.tokenAddress,
      },
    };
    return tokenAndNetwork;
  }

  // TODO: UPDATE TOKEN BALANCE FUNCS TO FILTER ON FAMILY
  // get balances for all erc20 networks
  async getBalanceAllERC20Tokens(params: {
    walletUser: IWallet;
    onFetch?: OnFetch;
    indexedNetworks: NetworkDb[];
  }): Promise<TokenAndNetwork[]> {
    const { walletUser, indexedNetworks, onFetch } = { ...params };
    let erc20balances: TokenAndNetwork[] = [];

    for (const erc20Db of this.tokenDbs) {
      const tokenPrice = this.kryptikPrices?.getPriceById(erc20Db.coingeckoId);
      for (const chainInfo of erc20Db.chainData) {
        // get ethereum network db
        let networkDb: NetworkDb | null = this.getNetworkDbByTicker(
          chainInfo.ticker
        );
        if (
          !networkDb ||
          NetworkFamilyFromFamilyName(networkDb?.networkFamilyName) !=
            NetworkFamily.EVM
        ) {
          if (onFetch) {
            onFetch(null);
          }
          continue;
        }
        if (indexedNetworks.includes(networkDb)) continue;
        // get chain data
        let erc20ChainData: ChainData | null = getChainDataForNetwork(
          networkDb,
          erc20Db
        );
        if (!erc20ChainData) {
          if (onFetch) {
            onFetch(null);
          }
          continue;
        }
        // get provider
        let provider = await this.getKryptikProviderForNetworkDb(networkDb);
        if (!provider.ethProvider) {
          throw new Error(
            `Error: no provider specified for ${networkDb.fullName}`
          );
        }
        let ethProvider: JsonRpcProvider = provider.ethProvider;
        //create erc20 contract
        let erc20Contract = new Contract(erc20ChainData.address, erc20Abi);
        erc20Contract = erc20Contract.connect(ethProvider);

        if (!erc20Contract) {
          if (onFetch) {
            onFetch(null);
          }
          continue;
        }
        let accountAddress = getAddressForNetworkDb(walletUser, networkDb);
        let erc20Params: ERC20Params = {
          erc20Contract: erc20Contract,
        };

        // get balance for contract
        let tokenBalParams: TokenBalanceParameters = {
          priceUsd: tokenPrice || undefined,
          erc20Params: erc20Params,
          tokenDb: erc20Db,
          accountAddress: accountAddress,
          networkDb: networkDb,
        };
        try {
          let tokenBalance: TokenAndNetwork = await this.getBalanceErc20Token(
            tokenBalParams
          );
          if (onFetch) {
            onFetch(tokenBalance);
          }
          // push balance data to balance array
          erc20balances.push(tokenBalance);
        } catch (e) {
          if (onFetch) {
            onFetch(null);
          }
          console.warn(
            `Unable to get balance for ${tokenBalParams.tokenDb.name} on ${networkDb.fullName}`
          );
          continue;
        }
      }
    }
    return erc20balances;
  }

  // get balances for all Nep141 tokens
  async getBalanceAllNep141Tokens(params: {
    walletUser: IWallet;
    onFetch?: OnFetch;
    indexedNetworks: NetworkDb[];
  }): Promise<TokenAndNetwork[]> {
    console.log("getting nep141 balances");
    const { walletUser, indexedNetworks, onFetch } = { ...params };
    let nep141Balances: TokenAndNetwork[] = [];
    for (const nep141Db of this.tokenDbs) {
      const tokenPrice = this.kryptikPrices?.getPriceById(nep141Db.coingeckoId);
      for (const chainInfo of nep141Db.chainData) {
        let networkDb: NetworkDb | null = this.getNetworkDbByTicker(
          chainInfo.ticker
        );
        if (
          !networkDb ||
          NetworkFamilyFromFamilyName(networkDb?.networkFamilyName) !=
            NetworkFamily.Near
        ) {
          if (onFetch) {
            onFetch(null);
          }
          continue;
        }
        console.log(`GETTING Nep141 balance FOR ${chainInfo.ticker}`);
        let accountAddress = await getAddressForNetworkDb(
          walletUser,
          networkDb
        );
        // get balance for contract
        let nep141Params: Nep141Params = { tokenAddress: chainInfo.address };
        let tokenParams: TokenBalanceParameters = {
          priceUsd: tokenPrice || undefined,
          tokenDb: nep141Db,
          nep141Params: nep141Params,
          accountAddress: accountAddress,
          networkDb: networkDb,
        };
        try {
          let tokenBalance: TokenAndNetwork = await this.getBalanceNep141Token(
            tokenParams
          );
          // push balance data to balance array
          nep141Balances.push(tokenBalance);
          if (onFetch) {
            onFetch(tokenBalance);
          }
        } catch (e) {
          if (onFetch) {
            onFetch(null);
          }
          console.warn(
            `Unable to fetch balance for ${nep141Db.name} on ${networkDb.fullName}.`
          );
        }
      }
    }
    return nep141Balances;
  }

  // get balances for all spl tokens
  async getBalanceAllSplTokens(params: {
    walletUser: IWallet;
    onFetch?: OnFetch;
    indexedNetworks: NetworkDb[];
  }): Promise<TokenAndNetwork[]> {
    let splBalances: TokenAndNetwork[] = [];
    const { walletUser, indexedNetworks, onFetch } = { ...params };
    for (const splDb of this.tokenDbs) {
      const tokenPrice = this.kryptikPrices?.getPriceById(splDb.coingeckoId);
      for (const chainInfo of splDb.chainData) {
        let networkDb: NetworkDb | null = this.getNetworkDbByTicker(
          chainInfo.ticker
        );
        if (
          !networkDb ||
          NetworkFamilyFromFamilyName(networkDb?.networkFamilyName) !=
            NetworkFamily.Solana
        ) {
          if (onFetch) {
            onFetch(null);
          }
          continue;
        }
        if (indexedNetworks.includes(networkDb)) continue;
        console.log(`GETTING SPL balance FOR ${chainInfo.ticker}`);
        let accountAddress = await getAddressForNetworkDb(
          walletUser,
          networkDb
        );
        // get balance for contract
        let splParams: SplParams = { tokenAddress: chainInfo.address };
        let tokenParams: TokenBalanceParameters = {
          priceUsd: tokenPrice || undefined,
          tokenDb: splDb,
          splParams: splParams,
          accountAddress: accountAddress,
          networkDb: networkDb,
        };
        try {
          let tokenBalance: TokenAndNetwork = await this.getBalanceSplToken(
            tokenParams
          );
          // push balance data to balance array
          splBalances.push(tokenBalance);
          if (onFetch) {
            onFetch(tokenBalance);
          }
        } catch (e) {
          console.warn(
            `Unable to fetch balance for ${splDb.name} on ${networkDb.fullName}.`
          );
          if (onFetch) {
            onFetch(null);
          }
        }
      }
    }
    return splBalances;
  }

  private async getAllSupportedPrices() {
    let ids: string[] = [];
    for (const nw of this.NetworkDbs) {
      ids.push(nw.coingeckoId);
    }
    for (const token of this.tokenDbs) {
      ids.push(token.coingeckoId);
    }
    let priceResponse: PricesDict = await getPriceOfMultipleTickers(ids);
    if (!this.kryptikPrices) {
      const newPriceHolder: KryptikPriceHolder = new KryptikPriceHolder({
        prices: priceResponse,
      });
      this.kryptikPrices = newPriceHolder;
    } else {
      this.kryptikPrices.updatePrices(priceResponse);
    }
    return this.kryptikPrices;
  }

  // TODO: ADD Individual price fetches
  async getTokenPrice(tokenId: string): Promise<number> {
    const cachedPrice = this.kryptikPrices
      ? this.kryptikPrices.getPriceById(tokenId)
      : null;
    let priceUSD = cachedPrice || getPriceOfTicker(tokenId);
    return priceUSD;
  }
}

export default Web3Service;
