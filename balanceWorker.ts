import { TokenContract } from "@prisma/client";
import {
  Connection,
  PublicKey,
  RpcResponseAndContext,
  TokenAmount,
} from "@solana/web3.js";
import AlgodClient from "algosdk/dist/types/client/v2/algod/algod";
import { utils, Contract } from "ethers";
import { NetworkFamily, NetworkFamilyFromFamilyName } from "hdseedloop";
import { Near } from "near-api-js";
import { JsonRpcProvider } from "@ethersproject/providers";
import { erc20Abi } from "./src/abis/erc20Abi";
import { AccountBalance as NearAccountBalance } from "near-api-js/lib/account";
import {
  createEd25519PubKey,
  createSolTokenAccount,
  getActiveNetworkAddress,
} from "./src/helpers/utils/accountUtils";
import { getContractByNetwork } from "./src/helpers/utils/networkUtils";
import {
  divByDecimals,
  lamportsToSol,
  roundUsdAmount,
} from "./src/helpers/utils/numberUtils";
import { IBalance } from "./src/services/models/IBalance";
import { defaultNetworkDb, NetworkDb } from "./src/services/models/network";
import { KryptikProvider } from "./src/services/models/provider";
import {
  ERC20Params,
  Nep141Params,
  SplParams,
  TokenAndNetwork,
  TokenParamsEVM,
} from "./src/services/models/token";
import {
  IFetchAllBalancesParams,
  IFetchNetworkBalanceParams,
  IFetchTokenBalanceParams,
} from "./src/helpers/balances";
import { OnDoneBalances, OnFetch } from "./src/services/types";

/** Returns balances for all supported networks and tokens. */
export async function getAllBalances(
  params: IFetchAllBalancesParams
): Promise<TokenAndNetwork[]> {
  const {
    isAdvanced,
    addresses,
    prices,
    tokens,
    networks,
    providers,
    onDone,
    onFetch,
  } = {
    ...params,
  };
  // default try cached value is true
  // const getCached = tryCached != undefined ? tryCached : true;
  // use cached balances if fresh
  // if (getCached && this.kryptikBalances && this.kryptikBalances.isFresh()) {
  //   return this.kryptikBalances;
  // }
  let masterBalances: TokenAndNetwork[] = [];
  // get remaining balances manually via rpc provider
  let tickerToNetworkBalance: { [ticker: string]: IBalance } = {};
  const [
    networkBalances,
    erc20Balances,
    nep141Balances,
    splBalances,
    algoBalances,
  ] = await Promise.all([
    getBalanceAllNetworks({
      addresses: addresses,
      isAdvanced: isAdvanced ? isAdvanced : false,
      prices: prices,
      networks: networks,
      tokens: tokens,
      providers: providers,
      onFetch: onFetch,
      onDone: onDone,
    }),
    getBalanceAllERC20Tokens({
      addresses: addresses,
      isAdvanced: isAdvanced ? isAdvanced : false,
      prices: prices,
      networks: networks,
      tokens: tokens,
      providers,
      onFetch: onFetch,
      onDone: onDone,
    }),
    getBalanceAllNep141Tokens({
      addresses: addresses,
      isAdvanced: isAdvanced ? isAdvanced : false,
      prices: prices,
      networks: networks,
      tokens: tokens,
      providers: providers,
      onFetch: onFetch,
      onDone: onDone,
    }),
    getBalanceAllSplTokens({
      addresses: addresses,
      isAdvanced: isAdvanced ? isAdvanced : false,
      prices: prices,
      networks: networks,
      tokens: tokens,
      providers: providers,
      onFetch: onFetch,
      onDone: onDone,
    }),
    getBlanceAllAlgoTokens({
      addresses: addresses,
      isAdvanced: isAdvanced ? isAdvanced : false,
      prices: prices,
      networks: networks,
      tokens: tokens,
      providers: providers,
      onFetch: onFetch,
      onDone: onDone,
    }),
  ]);
  for (const tokenAndNetwork of networkBalances) {
    if (tokenAndNetwork.networkBalance) {
      tickerToNetworkBalance[tokenAndNetwork.baseNetworkDb.ticker] =
        tokenAndNetwork.networkBalance;
    }
  }
  // add base network balance to token and network objects... in place
  // TODO: update, so we don't take a second pass over balances
  formatBalances(tickerToNetworkBalance, erc20Balances);
  formatBalances(tickerToNetworkBalance, nep141Balances);
  formatBalances(tickerToNetworkBalance, splBalances);
  formatBalances(tickerToNetworkBalance, algoBalances);
  // add to master balance list
  masterBalances = masterBalances.concat(networkBalances);
  masterBalances = masterBalances.concat(erc20Balances);
  masterBalances = masterBalances.concat(nep141Balances);
  masterBalances = masterBalances.concat(splBalances);
  masterBalances = masterBalances.concat(algoBalances);
  if (onDone) {
    onDone(masterBalances);
  }
  // init new kryptik balance holder
  return masterBalances;
}

// TODO: Update to support tx. based networks
async function getBalanceAllNetworks(
  params: IFetchAllBalancesParams
): Promise<TokenAndNetwork[]> {
  const { addresses, isAdvanced, networks, prices, providers, onFetch } = {
    ...params,
  };

  // initialize return array
  let balanceAndNetworks: TokenAndNetwork[] = [];
  for (const nw of networks) {
    // only show testnets to advanced users
    if (nw.isTestnet && !isAdvanced) {
      if (onFetch) {
        onFetch(null);
      }
      continue;
    }
    const accountAddress = getActiveNetworkAddress(addresses, nw);
    const provider = getProviderForNetwork(nw, providers);
    // ensure provider exists
    if (!provider) {
      if (onFetch) onFetch(null);
      continue;
    }
    let NetworkBalanceParams: IFetchNetworkBalanceParams = {
      address: accountAddress,
      network: nw,
      prices: prices,
      provider: provider,
    };
    try {
      let networkBalance: TokenAndNetwork | null = await getBalanceNetwork(
        NetworkBalanceParams
      );
      // push balance obj to balance data array
      if (networkBalance) balanceAndNetworks.push(networkBalance);
      if (onFetch) onFetch(networkBalance);
    } catch (e) {
      if (onFetch) {
        onFetch(null);
      }
      console.warn(`Unable to fetch network balance for ${nw.fullName}`);
    }
  }
  return balanceAndNetworks;
}

// GET BALANCE FOR A SINGLE NETWORK
async function getBalanceNetwork(
  params: IFetchNetworkBalanceParams
): Promise<TokenAndNetwork | null> {
  const { address, network, prices, provider } = { ...params };
  const cachedPrice = prices.getPriceById(network.coingeckoId);
  if (!cachedPrice)
    throw new Error(`No price available for ${network.fullName}`);
  let balanceNetwork: number;
  const networkFamily: NetworkFamily = NetworkFamilyFromFamilyName(
    network.networkFamilyName
  );
  let kryptikProvider: KryptikProvider = provider;
  // get balance in layer 1 token amount
  switch (networkFamily) {
    case NetworkFamily.EVM: {
      if (!kryptikProvider.ethProvider) return null;
      let ethNetworkProvider: JsonRpcProvider = kryptikProvider.ethProvider;
      balanceNetwork = Number(
        utils.formatEther(await ethNetworkProvider.getBalance(address))
      );
      break;
    }
    case NetworkFamily.Algorand: {
      if (!kryptikProvider.algorandProvider) return null;
      const algoNetworkProvider: AlgodClient = kryptikProvider.algorandProvider;
      const res = await algoNetworkProvider.accountInformation(address).do();
      const formattedAmount = divByDecimals(res.amount, network.decimals);
      balanceNetwork = formattedAmount.asNumber;
      break;
    }
    case NetworkFamily.Solana: {
      // gets pub key for solana network
      let solPubKey: PublicKey = createEd25519PubKey(address);
      // ensures provider is set
      if (!kryptikProvider.solProvider)
        throw new Error("No near provider is set up.");
      const solNetworkProvider: Connection = kryptikProvider.solProvider;
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
        let nearAccount = await nearNetworkProvider.account(address);
        let nearBalanceObject: NearAccountBalance =
          await nearAccount.getAccountBalance();
        balanceNetwork = divByDecimals(
          Number(nearBalanceObject.total),
          network.decimals
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
  let amountUSD = cachedPrice * balanceNetwork;
  // HANDLE ICONS FOR LAYER TWO NETWORKS
  let iconMain = network.iconPath;
  let iconSecondary = undefined;
  // UPDATE IF SO any second layer maps with main layer
  if (network.ticker == "eth(arbitrum)") {
    iconMain = defaultNetworkDb.iconPath;
    iconSecondary = network.iconPath;
  }
  // create new balance obj for balance data
  let newBalanceObj: IBalance = {
    fullName: network.fullName,
    ticker: network.ticker,
    iconPath: iconMain,
    iconPathSecondary: iconSecondary,
    amountCrypto: networkBalanceString,
    amountUSD: amountUSD.toString(),
    baseNetworkTicker: network.ticker,
  };

  return { baseNetworkDb: network, networkBalance: newBalanceObj };
}

// gets balance for a single erc20 token
async function getBalanceErc20Token(
  params: IFetchTokenBalanceParams
): Promise<TokenAndNetwork> {
  if (!params.erc20Params)
    throw new Error(
      "Error: Contract must be provided to fetch erc20 token balance."
    );
  const { address, token, prices, network, provider } = { ...params };
  let evmParams: TokenParamsEVM = {
    contractAddress: params.erc20Params.erc20Contract.address,
  };
  // fetch price
  let priceUSD = await prices.getPriceById(token.coingeckoId);
  if (!priceUSD) {
    throw new Error(`No price available for ${token.name}`);
  }
  let fetchedTokenAmount: number = Number(
    await params.erc20Params.erc20Contract.balanceOf(address)
  );
  let tokenBalance: number = divByDecimals(
    fetchedTokenAmount,
    token.decimals
  ).asNumber;
  // prettify token balance
  let networkBalanceString = tokenBalance.toString();
  let amountUSD = priceUSD * tokenBalance;
  // create new object for balance data
  let newBalanceObj: IBalance = {
    fullName: token.name,
    ticker: token.ticker,
    iconPath: token.logoURI,
    iconPathSecondary: network.iconPath,
    amountCrypto: networkBalanceString,
    amountUSD: amountUSD.toString(),
    baseNetworkTicker: network.ticker,
  };
  let tokenAndNetwork: TokenAndNetwork = {
    baseNetworkDb: network,
    tokenData: {
      tokenDb: token,
      tokenParamsEVM: evmParams,
      tokenBalance: newBalanceObj,
      selectedAddress: evmParams.contractAddress,
    },
  };
  tokenAndNetwork;
  return tokenAndNetwork;
}

async function getBalanceNep141Token(
  params: IFetchTokenBalanceParams
): Promise<TokenAndNetwork> {
  if (!params.nep141Params)
    throw new Error(
      "Error: Contract must be provided to fetch nep141 token balance."
    );
  const { address, token, prices, network, provider } = { ...params };
  let kryptikProvider = provider;
  if (!kryptikProvider.nearProvider)
    throw new Error(`Error: no provider specified for ${network.fullName}`);

  const nearNetworkProvider: Near = kryptikProvider.nearProvider;
  // fetch price
  const priceUSD = await prices.getPriceById(token.coingeckoId);
  if (!priceUSD) {
    throw new Error(`No price available for ${token.name}`);
  }
  let networkBalance: number;
  try {
    let nearAccount = await nearNetworkProvider.account(address);
    // call token contract balance method
    let response = await nearAccount.viewFunction(
      params.nep141Params.tokenAddress,
      "ft_balance_of",
      { account_id: address }
    );
    networkBalance = divByDecimals(Number(response), token.decimals).asNumber;
  } catch (e) {
    networkBalance = 0;
  }
  // prettify token balance
  let networkBalanceString = networkBalance.toString();
  let amountUSD = roundUsdAmount(priceUSD * networkBalance);
  // create new object for balance data
  let newBalanceObj: IBalance = {
    fullName: token.name,
    ticker: token.ticker,
    iconPath: token.logoURI,
    iconPathSecondary: network.iconPath,
    amountCrypto: networkBalanceString,
    amountUSD: amountUSD.toString(),
    baseNetworkTicker: network.ticker,
  };
  let tokenAndNetwork: TokenAndNetwork = {
    baseNetworkDb: network,
    tokenData: {
      tokenDb: token,
      tokenBalance: newBalanceObj,
      selectedAddress: params.nep141Params.tokenAddress,
    },
  };
  return tokenAndNetwork;
}

async function getBalanceSplToken(
  params: IFetchTokenBalanceParams
): Promise<TokenAndNetwork> {
  if (!params.splParams)
    throw new Error(`Error: spl balance parameters not provided.`);
  const { address, token, prices, network, provider } = { ...params };
  let kryptikProvider = provider;
  if (!kryptikProvider.solProvider)
    throw new Error(`Error: no provider specified for ${network.fullName}`);
  // fetch price
  const priceUSD = await prices.getPriceById(token.coingeckoId);
  if (!priceUSD) {
    throw new Error(`No price available for ${token.name}`);
  }
  // fetch balance
  // UPDATE TO SUPPORT ARRAY OF CHAIN DATA
  let tokenAccount = await createSolTokenAccount(
    address,
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
    fullName: token.name,
    ticker: token.ticker,
    iconPath: token.logoURI,
    iconPathSecondary: network.iconPath,
    amountCrypto: networkBalanceString,
    amountUSD: amountUSD.toString(),
    baseNetworkTicker: network.ticker,
  };
  let tokenAndNetwork: TokenAndNetwork = {
    baseNetworkDb: network,
    tokenData: {
      tokenDb: token,
      tokenBalance: newBalanceObj,
      selectedAddress: params.splParams.tokenAddress,
    },
  };
  return tokenAndNetwork;
}

async function getBlanceAllAlgoTokens(
  params: IFetchAllBalancesParams
): Promise<TokenAndNetwork[]> {
  const { tokens, networks, addresses, providers, prices, onFetch } = {
    ...params,
  };
  let algobalances: TokenAndNetwork[] = [];
  for (const token of tokens) {
    for (const contract of token.contracts) {
      const networkDb: NetworkDb | null = getNetworkDbById(
        contract.networkId,
        networks
      );
      // ensure network is part of algorand family
      if (
        !networkDb ||
        NetworkFamilyFromFamilyName(networkDb?.networkFamilyName) !=
          NetworkFamily.Algorand
      ) {
        continue;
      }
      // get provider
      let provider: KryptikProvider | null = getProviderForNetwork(
        networkDb,
        providers
      );
      if (!provider || !provider.algorandProvider) {
        throw new Error(
          `Error: no provider specified for ${networkDb.fullName}`
        );
      }
      const algoProvider: AlgodClient = provider.algorandProvider;
      const accountAddress = getActiveNetworkAddress(addresses, networkDb);
      // now fetch balance for network
      try {
        const assetAccountInfo = await algoProvider
          .accountAssetInformation(accountAddress, Number(contract.address))
          .do();

        const tokenAmount = divByDecimals(
          assetAccountInfo["asset-holding"].amount,
          token.decimals
        );

        const priceUSD = await prices.getPriceById(token.coingeckoId);
        if (!priceUSD) {
          throw new Error(`No price available for ${token.name}`);
        }
        // prettify token balance
        let networkBalanceString = tokenAmount.asString;
        let amountUSD = roundUsdAmount(priceUSD * tokenAmount.asNumber);
        // create new object for balance data
        let newBalanceObj: IBalance = {
          fullName: token.name,
          ticker: token.ticker,
          iconPath: token.logoURI,
          iconPathSecondary: networkDb.iconPath,
          amountCrypto: networkBalanceString,
          amountUSD: amountUSD.toString(),
          baseNetworkTicker: networkDb.ticker,
        };
        let tokenAndNetwork: TokenAndNetwork = {
          baseNetworkDb: networkDb,
          tokenData: {
            tokenDb: token,
            tokenBalance: newBalanceObj,
            selectedAddress: contract.address,
          },
        };
        // add formatted balance to result
        algobalances.push(tokenAndNetwork);
      } catch (e) {
        if (onFetch) {
          onFetch(null);
        }
        console.warn(
          `Unable to get balance for ${token.name} on ${networkDb.fullName}`
        );
      }
    }
  }
  return algobalances;
}

// TODO: UPDATE TOKEN BALANCE FUNCS TO FILTER ON FAMILY
// get balances for all erc20 networks
async function getBalanceAllERC20Tokens(
  params: IFetchAllBalancesParams
): Promise<TokenAndNetwork[]> {
  const { tokens, networks, addresses, providers, prices, onFetch, onDone } = {
    ...params,
  };
  let erc20balances: TokenAndNetwork[] = [];

  for (const erc20Db of tokens) {
    const tokenPrice = await prices.getPriceById(erc20Db.coingeckoId);
    if (!tokenPrice) {
      throw new Error(`No price available for ${erc20Db.name}`);
    }
    for (const contract of erc20Db.contracts) {
      // get ethereum network db
      let networkDb: NetworkDb | null = getNetworkDbById(
        contract.networkId,
        networks
      );
      if (
        !networkDb ||
        NetworkFamilyFromFamilyName(networkDb?.networkFamilyName) !=
          NetworkFamily.EVM
      ) {
        continue;
      }
      // get chain data
      let erc20ContractData: TokenContract | null = getContractByNetwork(
        networkDb,
        erc20Db
      );
      if (!erc20ContractData) {
        if (onFetch) {
          onFetch(null);
        }
        continue;
      }
      // get provider
      let provider = await getProviderForNetwork(networkDb, providers);
      if (!provider || !provider.ethProvider) {
        throw new Error(
          `Error: no provider specified for ${networkDb.fullName}`
        );
      }
      let ethProvider: JsonRpcProvider = provider.ethProvider;
      //create erc20 contract
      let erc20Contract = new Contract(erc20ContractData.address, erc20Abi);
      erc20Contract = erc20Contract.connect(ethProvider);

      if (!erc20Contract) {
        if (onFetch) {
          onFetch(null);
        }
        continue;
      }
      let accountAddress = getActiveNetworkAddress(addresses, networkDb);
      let erc20Params: ERC20Params = {
        erc20Contract: erc20Contract,
      };

      // get balance for contract
      const tokenBalParams: IFetchTokenBalanceParams = {
        address: accountAddress,
        prices: prices,
        network: networkDb,
        token: erc20Db,
        provider: provider,
        erc20Params: erc20Params,
        onFetch: onFetch,
        onDone: onDone,
      };

      try {
        let tokenBalance: TokenAndNetwork = await getBalanceErc20Token(
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
          `Unable to get balance for ${erc20Db.name} on ${networkDb.fullName}`
        );
        // console.log(e);
        continue;
      }
    }
  }
  return erc20balances;
}

// get balances for all Nep141 tokens
async function getBalanceAllNep141Tokens(
  params: IFetchAllBalancesParams
): Promise<TokenAndNetwork[]> {
  console.log("getting nep141 balances");
  const { tokens, networks, addresses, providers, prices, onFetch, onDone } = {
    ...params,
  };
  let nep141Balances: TokenAndNetwork[] = [];
  for (const nep141Db of tokens) {
    const tokenPrice = prices.getPriceById(nep141Db.coingeckoId);
    if (!tokenPrice) {
      throw new Error(`No price available for ${nep141Db.name}`);
    }
    for (const contract of nep141Db.contracts) {
      const networkDb: NetworkDb | null = getNetworkDbById(
        contract.networkId,
        networks
      );
      if (
        !networkDb ||
        NetworkFamilyFromFamilyName(networkDb?.networkFamilyName) !=
          NetworkFamily.Near
      ) {
        continue;
      }
      // get provider
      let provider = await getProviderForNetwork(networkDb, providers);
      if (!provider || !provider.nearProvider) {
        throw new Error(
          `Error: no provider specified for ${networkDb.fullName}`
        );
      }
      const accountAddress = getActiveNetworkAddress(addresses, networkDb);
      // get balance for contract
      const nep141Params: Nep141Params = { tokenAddress: contract.address };
      const tokenBalParams: IFetchTokenBalanceParams = {
        address: accountAddress,
        prices: prices,
        network: networkDb,
        token: nep141Db,
        provider: provider,
        nep141Params: nep141Params,
        onFetch: onFetch,
        onDone: onDone,
      };
      try {
        let tokenBalance: TokenAndNetwork = await getBalanceNep141Token(
          tokenBalParams
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
async function getBalanceAllSplTokens(
  params: IFetchAllBalancesParams
): Promise<TokenAndNetwork[]> {
  let splBalances: TokenAndNetwork[] = [];
  const { tokens, networks, addresses, providers, prices, onFetch, onDone } = {
    ...params,
  };
  for (const splDb of tokens) {
    const tokenPrice = await prices.getPriceById(splDb.coingeckoId);

    for (const contract of splDb.contracts) {
      const networkDb: NetworkDb | null = getNetworkDbById(
        contract.networkId,
        networks
      );
      if (
        !networkDb ||
        NetworkFamilyFromFamilyName(networkDb?.networkFamilyName) !=
          NetworkFamily.Solana
      ) {
        continue;
      }
      // get provider
      let provider = await getProviderForNetwork(networkDb, providers);
      if (!provider || !provider.solProvider) {
        throw new Error(
          `Error: no provider specified for ${networkDb.fullName}`
        );
      }
      let accountAddress = getActiveNetworkAddress(addresses, networkDb);
      // get balance for contract
      let splParams: SplParams = { tokenAddress: contract.address };
      const tokenBalParams: IFetchTokenBalanceParams = {
        address: accountAddress,
        prices: prices,
        network: networkDb,
        token: splDb,
        provider: provider,
        splParams: splParams,
        onFetch: onFetch,
        onDone: onDone,
      };

      try {
        let tokenBalance: TokenAndNetwork = await getBalanceSplToken(
          tokenBalParams
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

// -------------------------
// Utils
function getNetworkDbById(id: number, networks: NetworkDb[]): NetworkDb | null {
  let networkDbRes: NetworkDb | undefined = networks.find((n) => n.id == id);
  if (networkDbRes) return networkDbRes;
  return null;
}

function formatBalances(
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

/** Finds the provider for a given network. Returns null if not found. */
function getProviderForNetwork(
  network: NetworkDb,
  providers: { [ticker: string]: KryptikProvider }
): KryptikProvider | null {
  const provider = providers[network.ticker];
  if (provider) {
    return provider;
  } else {
    return null;
  }
}
