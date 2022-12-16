// class that 'holds' and manages balances
import { NetworkFamily, NetworkFamilyFromFamilyName } from "hdseedloop";
import { sumFiatBalances } from "../../helpers/balances";
import { TokenAndNetwork } from "./token";

// wrapper for common transaction data

export interface IKryptikBalanceParams {
  tokenAndBalances: TokenAndNetwork[];
  // freshness window
  freshWindow?: number;
}

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

export class KryptikBalanceHolder {
  id: number;
  private lastUpdated: number;
  // number of seconds we consider these balances to be 'fresh'
  private freshWindow: number;
  private tokenAndBalances: TokenAndNetwork[];
  // null if not calculated yet
  private totalBalanceFiat: number | null;

  constructor(params: IKryptikBalanceParams) {
    const { tokenAndBalances, freshWindow } = { ...params };
    tokenAndBalances.sort(sortTokenAndBalances);
    this.tokenAndBalances = tokenAndBalances;
    this.lastUpdated = Date.now();
    // use provided number of seconds or default to five minutes
    this.freshWindow = freshWindow ? freshWindow : 300;
    this.id = Math.random();
    this.totalBalanceFiat = null;
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

  getLastUpdateDatestamp(): string {
    let date = new Date(this.lastUpdated);
    return date.toString();
  }

  getLastUpdateTimestamp(): string {
    let date = new Date(this.lastUpdated);
    return date.toLocaleTimeString("en-US");
  }
}
