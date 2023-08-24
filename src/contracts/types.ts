import { AppContract, NetworkDb } from "@prisma/client";
import { Web3App } from "../explore/apps/types";

export interface IContract {
  address: string;
  networkTicker: string;
  stats?: Stats;
  appMetaData: Web3App;
}

export type Stats = {
  totalTransactionsLastHour: number;
  lastBlockChecked: number;
  updatedAt: number;
};

/**
 *
 * @param contractDb contract model from db with network data included
 * @returns
 */
export function contractFromDb(
  contractDb: AppContract & { NetworkDb: NetworkDb }
): IContract {
  // parse contract data
  const contract: IContract = {
    address: contractDb.address,
    networkTicker: contractDb.NetworkDb.ticker,
    appMetaData: {
      name: contractDb.name,
      description: contractDb.description,
      url: contractDb.url,
      icon: contractDb.icon,
      tags: contractDb.tags,
    },
    stats: {
      totalTransactionsLastHour: contractDb.totalTransactionsLastHour,
      lastBlockChecked: contractDb.lastBlockChecked,
      updatedAt: contractDb.updatedAt.getTime(),
    },
  };
  return contract;
}
