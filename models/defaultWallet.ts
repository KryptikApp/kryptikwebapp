import { IWallet } from "./IWallet";

// extends Iwallet interface
export const defaultWallet: IWallet = {
    walletProviderName: "",
    address: "",
    balance: 0,
    browserWeb3Provider: null,
    serverWeb3Provider: null,
    wcConnector: null,
    wcProvider: null,
    connected: false,
    chainId: 0,
  };