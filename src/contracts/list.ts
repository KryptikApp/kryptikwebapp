import {
  ENS_META,
  FRIEND_TECH_META,
  LENS_META,
  LIDO_META,
  UNISWAP_META,
} from "../explore/apps/topApps";
import { IContract } from "./types";

export const CONTRACT_LIST: IContract[] = [
  // uniswap v3 contract
  {
    address: "0xe592427a0aece92de3edee1f18e0157c05861564",
    networkTicker: "eth",
    appMetaData: UNISWAP_META,
  },
  // ens contract
  {
    address: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e",
    networkTicker: "eth",
    appMetaData: ENS_META,
  },
  // lido contract
  {
    address: "0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84",
    networkTicker: "eth",
    appMetaData: LIDO_META,
  },
  // lens contract
  {
    address: "0xDb46d1Dc155634FbC732f92E853b10B288AD5a1d",
    networkTicker: "matic",
    appMetaData: LENS_META,
  },
  // friend.tech contract
  {
    address: "0xCF205808Ed36593aa40a44F10c7f7C2F67d4A4d4",
    networkTicker: "eth(base)",
    appMetaData: FRIEND_TECH_META,
  },
];
