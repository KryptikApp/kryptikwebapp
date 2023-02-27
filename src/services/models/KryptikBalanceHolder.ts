// class that 'holds' and manages balances
import { NetworkFamily, NetworkFamilyFromFamilyName } from "hdseedloop";
import { getAllBalances } from "../../../balanceWorker";
import {
  IFetchAllBalancesParams,
  sumFiatBalances,
} from "../../helpers/balances";
import { TokenAndNetwork } from "./token";
import { PubSub } from "pubsub-ts";

export interface IKryptikBalanceParams {
  tokenAndBalances?: TokenAndNetwork[];
  // freshness window
  freshWindow?: number;
}

export type ActiveAddresses = {
  eth: string;
  sol: string;
  near: string;
  algo: string;
};

/**
 * Returns a  positive number if token b has a greater token value than token a
 *
 * @remarks
 * This method is useful as a sorting function.
 */
function sortTokenAndBalances(a: TokenAndNetwork, b: TokenAndNetwork) {
  let tokenAAmount: number = 0;
  let tokenBAmount: number = 0;
  // set a token amount
  if (a.tokenData && a.tokenData.tokenBalance) {
    tokenAAmount = Number(a.tokenData.tokenBalance.amountUSD);
  } else if (a.networkBalance) {
    tokenAAmount = Number(a.networkBalance.amountUSD);
  } else {
    tokenAAmount = 0;
  }
  // set b token amount
  if (b.tokenData && b.tokenData.tokenBalance) {
    tokenBAmount = Number(b.tokenData.tokenBalance.amountUSD);
  } else if (b.networkBalance) {
    tokenBAmount = Number(b.networkBalance.amountUSD);
  } else {
    tokenBAmount = 0;
  }

  const difference = tokenBAmount - tokenAAmount;
  if (difference < 0) {
    return -1;
  } else {
    return 1;
  }
}

export class KryptikBalanceHolder extends PubSub.Publisher {
  id: number;
  private lastUpdated: number;
  // number of seconds we consider these balances to be 'fresh'
  private freshWindow: number;
  private tokenAndBalances: TokenAndNetwork[];
  // null if not calculated yet
  private totalBalanceFiat: number | null;

  public isLoading: boolean;
  public hasCache: boolean;
  private totalFetched: number;

  constructor(params: IKryptikBalanceParams) {
    super();
    const { tokenAndBalances, freshWindow } = {
      ...params,
    };
    if (tokenAndBalances) {
      tokenAndBalances.sort(sortTokenAndBalances);
      this.tokenAndBalances = tokenAndBalances;
    } else {
      this.tokenAndBalances = [];
    }
    this.lastUpdated = Date.now();
    // use provided number of seconds or default to five minutes
    this.freshWindow = freshWindow ? freshWindow : 300;
    this.id = Math.random();
    this.totalBalanceFiat = null;
    this.isLoading = false;
    this.hasCache = false;
    this.totalFetched = 0;
  }

  isFresh(): boolean {
    // seconds since last update
    let secondsElapsed: number = (Date.now() - this.lastUpdated) / 1000;
    return secondsElapsed < this.freshWindow;
  }

  getNetworkBalances(): TokenAndNetwork[] {
    const balsToReturn: TokenAndNetwork[] = this.tokenAndBalances.filter(
      (b) => !b.tokenData
    );
    return balsToReturn;
  }

  getErc20Balances(): TokenAndNetwork[] {
    const balsToReturn: TokenAndNetwork[] = this.tokenAndBalances.filter(
      (b) =>
        (b.tokenData &&
          NetworkFamilyFromFamilyName(b.baseNetworkDb.networkFamilyName)) ==
        NetworkFamily.EVM
    );
    return balsToReturn;
  }

  getNep141Balances(): TokenAndNetwork[] {
    const balsToReturn: TokenAndNetwork[] = this.tokenAndBalances.filter(
      (b) =>
        (b.tokenData &&
          NetworkFamilyFromFamilyName(b.baseNetworkDb.networkFamilyName)) ==
        NetworkFamily.Near
    );
    return balsToReturn;
  }
  getSplBalances(): TokenAndNetwork[] {
    const balsToReturn: TokenAndNetwork[] = this.tokenAndBalances.filter(
      (b) =>
        (b.tokenData &&
          NetworkFamilyFromFamilyName(b.baseNetworkDb.networkFamilyName)) ==
        NetworkFamily.Solana
    );
    return balsToReturn;
  }

  getAllBalances(): TokenAndNetwork[] {
    return this.tokenAndBalances;
  }

  getNonzeroBalances(includeTestnets: boolean = false) {
    let tempTokenAndBals: TokenAndNetwork[] = [];
    for (const bal of this.tokenAndBalances) {
      // add non zero balances to array
      if (bal.tokenData && bal.tokenData.tokenBalance?.amountCrypto != "0") {
        // nonzero token balances

        // filter testnets
        if (
          includeTestnets ||
          (!includeTestnets && !bal.baseNetworkDb.isTestnet)
        ) {
          tempTokenAndBals.push(bal);
        }
      } else {
        // nonzero base network balances
        if (!bal.tokenData && bal.networkBalance?.amountCrypto != "0") {
          // filter testnets
          if (
            includeTestnets ||
            (!includeTestnets && !bal.baseNetworkDb.isTestnet)
          ) {
            tempTokenAndBals.push(bal);
          }
        }
      }
    }
    return tempTokenAndBals;
  }

  updateBalances(newTokenAndBalances: TokenAndNetwork[]) {
    newTokenAndBalances.sort(sortTokenAndBalances);
    this.tokenAndBalances = newTokenAndBalances;
    this.lastUpdated = Date.now();
    this.hasCache = true;
  }

  /** Returns the total value of current balances (in fiat). */
  getTotalBalance() {
    if (this.totalBalanceFiat) {
      return this.totalBalanceFiat;
    }
    const newTotalBalance = sumFiatBalances(this.tokenAndBalances);
    this.totalBalanceFiat = newTotalBalance;
    return newTotalBalance;
  }

  getLastUpdateTimestamp(): string {
    let date = new Date(this.lastUpdated);
    return date.toLocaleTimeString("en-US");
  }

  handleFetchIncrement(bal: TokenAndNetwork | null) {
    this.totalFetched++;
    this.notify("incrementBalance", {
      balance: bal,
      fetchCount: this.totalFetched,
    });
  }

  handleFetchDone(bals: TokenAndNetwork[]) {
    this.updateBalances(bals);
    this.isLoading = false;
    this.notify("loading", false);
  }

  async refresh(params: IFetchAllBalancesParams) {
    this.isLoading = true;
    this.totalFetched = 0;
    params.onDone = (b) => {
      this.handleFetchDone(b);
    };
    params.onFetch = (b) => {
      this.handleFetchIncrement(b);
    };
    this.totalFetched = 0;
    // run asynchronous fetch of balances
    getAllBalances(params);
  }
}
