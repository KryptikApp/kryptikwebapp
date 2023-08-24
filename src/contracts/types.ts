import { Web3App } from "../explore/apps/types";

export interface IContract {
  address: string;
  networkTicker: string;
  stats: Stats;
  numberOfTransactions: number;
  appMetaData: Web3App;
}

export type Stats = {
  totalTransactionsLastHour: number;
  lastBlockChecked: number;
  updatedAt: number;
};
