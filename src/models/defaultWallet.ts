import HDSeedLoop from "hdseedloop";
import { defaultResolvedAccount } from "../helpers/resolvers/accountResolver";
import { IWallet, WalletStatus } from "./KryptikWallet";

// extends Iwallet interface
export const defaultWallet: IWallet = new IWallet({
  walletProviderName: "",
  balance: 0,
  status: WalletStatus.Disconected,
  seedLoop: new HDSeedLoop(),
  resolvedEthAccount: defaultResolvedAccount,
  uid: "",
});
