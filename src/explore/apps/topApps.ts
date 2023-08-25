import { Web3App } from "./types";

export const UNISWAP_META = {
  name: "Uniswap",
  description: "Trade tokens",
  url: "https://app.uniswap.org/",
  icon: "/apps/uniswap.webp",
  tags: ["exchange"],
};

export const POOLTOGETHER_META = {
  name: "PoolTogether",
  description: "No-loss prize games",
  url: "https://app.pooltogether.com/",
  icon: "/apps/poolTogether.webp",
  tags: ["games"],
};
export const SABLIER_META = {
  name: "Sablier",
  description: "Stream money in real-time",
  url: "https://app.sablier.finance/",
  icon: "/apps/sablier.webp",
  tags: ["payments"],
};
export const ENS_META = {
  name: "Ethereum Name Service",
  description: "Decentralized naming for wallets, websites, & more",
  url: "https://app.ens.domains/",
  icon: "/apps/ens.webp",
  tags: ["domains"],
};
export const AAVE_META = {
  name: "Aave",
  description: "Lend and borrow with variable interest rates",
  url: "https://aave.com/",
  icon: "/apps/aave.webp",
  tags: ["defi"],
};
export const ZAPPER_META = {
  name: "Zapper",
  description: "Track and manage DeFi assets",
  url: "https://zapper.fi/",
  icon: "/apps/zapper.webp",
  tags: ["dashboard"],
};

export const CURVE_META = {
  name: "Curve",
  description: "Exchange stablecoins",
  url: "https://curve.fi/",
  icon: "/apps/curve.webp",
  tags: ["exchange"],
};

export const LIDO_META = {
  name: "Lido",
  description: "Stake ETH and earn staking rewards",
  url: "https://lido.fi/",
  icon: "/apps/lido.png",
  tags: ["staking"],
};

export const LENS_META = {
  name: "Lens",
  description: "Decentralized social network",
  url: "https://lens.xyz/",
  icon: "/apps/lens.png",
  tags: ["social"],
};

export const topApps: Web3App[] = [
  UNISWAP_META,
  POOLTOGETHER_META,
  SABLIER_META,
  ENS_META,
  AAVE_META,
  ZAPPER_META,
  CURVE_META,
  LIDO_META,
];
