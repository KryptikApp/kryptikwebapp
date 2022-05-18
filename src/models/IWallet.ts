import HDSeedLoop from "hdseedloop";




// adapted from https://github.com/acclrate/cronos-dapp-basic-3/blob/main/src/store/interfaces.tsx
export interface IWallet {
    walletProviderName: string; // could be "metamask", "coinbasewallet", "etc."
    balance: number; // user balance
    connected: boolean; // is the wallet connected to the Dapp, or not?
    seedLoop: HDSeedLoop;
    ethAddress:string;
    uid: string;
  }