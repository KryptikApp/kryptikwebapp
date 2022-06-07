// data model for cryptocurrency networks (blockchains) pulled from firebase

import { Network, NetworkFromTicker } from "hdseedloop"

export interface NetworkDb {
    fullName: string,
    ticker: string,
    iconPath: string,
    isSupported: boolean,
    about: string,
    whitePaperPath: string,
    chainId: number,
    chainIdEVM: number,
    hexColor: string,
    dateCreated: Date,
    provider:string,
    networkFamilyName:string,
    coingeckoId:string
    isTestnet: boolean
}


export const defaultNetworkDb:NetworkDb = {
    fullName: "Ethereum",
    ticker: "eth",
    iconPath:"https://firebasestorage.googleapis.com/v0/b/kryptikapp-50542.appspot.com/o/eth.png?alt=media&token=cc1091fb-ef28-4008-a91e-5709818c452e",
    isSupported: true,
    about: "Ethereum is the community-run technology powering the cryptocurrency ether (ETH) and thousands of decentralized applications.",
    whitePaperPath: "https://ethereum.org/en/whitepaper/",
    chainId: 60,
    chainIdEVM: 1,
    hexColor: "#3c3c3d",
    networkFamilyName: "evm",
    dateCreated: new Date('July 29, 2015 03:24:00'),
    provider: "https://eth-mainnet.alchemyapi.io/v2/NnS19sbjsKljODizz9zB-C8Fw511M-ej",
    coingeckoId: "ethereum",
    isTestnet: false
}


export const defaultNetwork:Network = NetworkFromTicker("eth");