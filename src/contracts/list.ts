import {
  CURVE_META,
  ENS_META,
  LIDO_META,
  UNISWAP_META,
} from "../explore/apps/topApps";
import { IContract } from "./types";

export const CONTRACT_LIST: IContract[] = [
  // uniswap v3 ciontract
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
];
