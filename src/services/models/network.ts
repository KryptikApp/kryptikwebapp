// data model for cryptocurrency networks (blockchains)

import { Network, NetworkFromTicker } from "hdseedloop";
import { TokenAndNetwork, TokenDb } from "./token";
import { NetworkDb as PrismaNetworkDb } from "@prisma/client";

export interface EVMData {
  chainId: number;
  zeroXSwapUrl?: string;
}

export interface NetworkDb extends PrismaNetworkDb {}

export type NetworkDbTemp = {
  id: number;
  about: string;
  blockExplorerURL: string;
  blockchainId: string;
  chainId: number;
  decimals: number;
  fullName: string;
  iconPath: string;
  isSupported: boolean;
  networkFamily: string;
  whitePaperPath: string;
  ticker: string;
  tokens: TokenDb[];
};

export const defaultMaticNetworkDb: NetworkDb = {
  about:
    "Polygon is a secondary scaling solution for the Ethereum blockchain. MATIC is an Ethereum token that powers the Polygon network.",
  blockchainId: "eip155:137",
  blockExplorerURL: "https://polygonscan.com/",
  chainId: 966,
  coingeckoId: "matic-network",
  decimals: 18,
  fullName: "Polygon",
  hexColor: "#A020F0",
  iconPath:
    "https://firebasestorage.googleapis.com/v0/b/kryptikapp-50542.appspot.com/o/matic.png?alt=media&token=6e042b07-2476-442b-b207-c1562f64bf5d",
  isSupported: true,
  networkFamilyName: "evm",
  ticker: "matic",
  whitePaperPath: "https://polygon.technology/lightpaper-polygon.pdf",
  zeroXSwapUrl: "https://polygon.api.0x.org/",
  id: 966,
  isTestnet: false,
  provider: "https://rpc-mainnet.maticvigil.com/",
};

export const defaultNetworkDb: NetworkDb = {
  // TODO: ENSURE PLACEHOLDER ID ISN'T PROBLEMATIC
  id: 3,
  fullName: "Ethereum",
  ticker: "eth",
  iconPath:
    "https://firebasestorage.googleapis.com/v0/b/kryptikapp-50542.appspot.com/o/eth.png?alt=media&token=cc1091fb-ef28-4008-a91e-5709818c452e",
  isSupported: true,
  about:
    "Ethereum is the community-run technology powering the cryptocurrency ether (ETH) and thousands of decentralized applications.",

  blockchainId: "eip155:1",
  blockExplorerURL: "https://etherscan.io/",
  chainId: 60,
  coingeckoId: "ethereum",
  decimals: 18,
  hexColor: "#3c3c3d",
  isTestnet: false,
  networkFamilyName: "evm",
  provider:
    "https://eth-mainnet.alchemyapi.io/v2/NnS19sbjsKljODizz9zB-C8Fw511M-ej",
  whitePaperPath: "https://ethereum.org/en/whitepaper/",
  zeroXSwapUrl: "https://api.0x.org/",
};

// refer to blockchain assets repo for up to date uniswap token data
const defaultUniswapTokenData: TokenDb = {
  name: "Uniswap",
  ticker: "UNI",
  coingeckoId: "uniswap",
  hexColor: "#FF007A",
  decimals: 18,
  logoURI:
    "https://assets.coingecko.com/coins/images/12504/large/uniswap-uni.png?1600306604",
  link: "https://uniswap.org/",
  description:
    "UNI is the governance token for Uniswap. UNI was introduced on September 16th, 2020 through an airdrop to users who have interacted with the protocol either by swapping tokens or by providing liquidity. The UNI token allows token holders to participate in the governance of the protocol. Key decisions such as usage of the treasury or future upgrades can be decided through a governance vote.",
  tags: ["defi"],
  contracts: [
    {
      id: 262,
      address: "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
      contractId: "eth:UNI",
      networkId: 3,
      tokenId: 27,
    },
  ],
  id: 0,
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
