import HDSeedLoop from "hdseedloop"
import { defaultResolvedAccount } from "../helpers/resolvers/accountResolver";
import { IWallet } from "./KryptikWallet";



// extends Iwallet interface
export const defaultWallet:IWallet = new IWallet({ 
  walletProviderName: "",
  balance: 0,
  connected: false,
  seedLoop: new HDSeedLoop(),
  resolvedEthAccount: defaultResolvedAccount,
  uid: ""})
