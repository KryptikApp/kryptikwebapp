// data model for cryptocurrency networks (blockchains) pulled from firebase

import { Network, NetworkFromTicker } from "hdseedloop";
import { TokenAndNetwork, TokenDb } from "./token";

export interface EVMData {
  chainId: number;
  zeroXSwapUrl?: string;
}

export interface NetworkDb {
  fullName: string;
  ticker: string;
  iconPath: string;
  isSupported: boolean;
  about: string;
  whitePaperPath: string;
  chainId: number;
  evmData?: EVMData;
  decimals: number;
  hexColor: string;
  dateCreated: Date;
  provider: string;
  networkFamilyName: string;
  coingeckoId: string;
  isTestnet: boolean;
  blockExplorerURL: string;
  blockchainId: string;
}

export const defaultNetworkDb: NetworkDb = {
  fullName: "Ethereum",
  ticker: "eth",
  iconPath:
    "https://firebasestorage.googleapis.com/v0/b/kryptikapp-50542.appspot.com/o/eth.png?alt=media&token=cc1091fb-ef28-4008-a91e-5709818c452e",
  isSupported: true,
  about:
    "Ethereum is the community-run technology powering the cryptocurrency ether (ETH) and thousands of decentralized applications.",
  whitePaperPath: "https://ethereum.org/en/whitepaper/",
  blockchainId: "eip155:1",
  blockExplorerURL: "https://etherscan.io/",
  chainId: 60,
  decimals: 18,
  evmData: {
    chainId: 1,
    zeroXSwapUrl: "https://api.0x.org/",
  },
  hexColor: "#3c3c3d",
  networkFamilyName: "evm",
  dateCreated: new Date("July 29, 2015 03:24:00"),
  provider:
    "https://eth-mainnet.alchemyapi.io/v2/NnS19sbjsKljODizz9zB-C8Fw511M-ej",
  coingeckoId: "ethereum",
  isTestnet: false,
};

// refer to blockchain assets repo for up to date uniswap token data
const defaultUniswapTokenData: TokenDb = {
  name: "Uniswap",
  symbol: "UNI",
  coingeckoId: "uniswap",
  hexColor: "#FF007A",
  decimals: 18,
  chainData: [
    {
      chainId: 1,
      ticker: "eth",
      address: "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
    },
    {
      chainId: 3,
      ticker: "eth(ropsten)",
      address: "0xC8F88977E21630Cf93c02D02d9E8812ff0DFC37a",
    },
  ],
  logoURI:
    "https://assets.coingecko.com/coins/images/12504/large/uniswap-uni.png?1600306604",
  extensions: {
    link: "https://uniswap.org/",
    description:
      "UNI is the governance token for Uniswap. UNI was introduced on September 16th, 2020 through an airdrop to users who have interacted with the protocol either by swapping tokens or by providing liquidity. The UNI token allows token holders to participate in the governance of the protocol. Key decisions such as usage of the treasury or future upgrades can be decided through a governance vote.",
  },
  tags: ["defi"],
};

export const placeHolderEVMAddress: string =
  "0xb794f5ea0ba39494ce839613fffba74279579268";

export const placeHolderSolAddress: string =
  "DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK";

export const defaultTokenAndNetwork: TokenAndNetwork = {
  baseNetworkDb: defaultNetworkDb,
};

export const defaultUniswapTokenAndNetwork: TokenAndNetwork = {
  baseNetworkDb: defaultNetworkDb,
  tokenData: {
    tokenDb: defaultUniswapTokenData,
    selectedAddress: "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
  },
};

export interface NetworkBalanceParameters {
  networkDb: NetworkDb;
  accountAddress: string;
}

export const defaultNetwork: Network = NetworkFromTicker("eth");
