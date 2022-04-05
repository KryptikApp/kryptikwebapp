import HDSeedLoop from "hdseedloop"
import { IWallet } from "./IWallet";


// extends Iwallet interface
export const defaultWallet: IWallet = {
  walletProviderName: "",
  balance: 0,
  connected: false,
  seedLoop: new HDSeedLoop(),
  ethAddress: ""
};