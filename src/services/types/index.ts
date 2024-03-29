import { IBalance } from "../models/IBalance";
import { NetworkDb } from "../models/network";
import { TokenAndNetwork } from "../models/token";

enum ServiceState {
  started = 0,
  stopped = 1,
  unstarted = 2,
}

enum Status {
  Success = 0,
  Failure = 1,
  Pending = 2,
  Done = 3,
}

enum TxProgress {
  Begin = 0,
  SetParamaters = 1,
  Rewiew = 2,
  Complete = 3,
  Failure = 4,
}

enum WaitlistProgress {
  Begin = 0,
  Complete = 1,
  Failure = 2,
}

export type GetNetworkDbByTicker = (ticker: string) => NetworkDb | null;

export type OnFetch = (balance: TokenAndNetwork | null) => void;

export type OnDoneBalances = (balances: TokenAndNetwork[]) => void;

export { ServiceState, Status, TxProgress, WaitlistProgress };
