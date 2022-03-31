import { ethers } from "ethers";

// adapted from https://github.com/acclrate/cronos-dapp-basic-3/blob/main/src/store/interfaces.tsx
export interface IWallet {
    walletProviderName: string; // could be "metamask", "coinbasewallet", "etc."
    address: string; // 0x ethereum address of the user
    balance: number, // user balance
    browserWeb3Provider: any; // Web3 provider connected to the wallet's browser extension, hence 'browser'
    serverWeb3Provider: ethers.providers.JsonRpcProvider | null; // cloud based Web3 provider for read-only
    wcConnector: any; // connector object provided by some wallet connection methods, stored if relevant
    wcProvider: any; // provider object provided by some wallet connection methods, stored if relevant
    connected: boolean; // is the wallet connected to the Dapp, or not?
    chainId: number; // BIP-044 chain ID. read more here: https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki 
  }