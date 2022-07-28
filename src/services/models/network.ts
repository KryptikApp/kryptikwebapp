// data model for cryptocurrency networks (blockchains) pulled from firebase

import { Network, NetworkFromTicker } from "hdseedloop"
import { TokenAndNetwork } from "./token"


export interface EVMData{
    chainId: number,
    zeroXSwapUrl?: string
}

export interface NetworkDb{
    fullName: string,
    ticker: string,
    iconPath: string,
    isSupported: boolean,
    about: string,
    whitePaperPath: string,
    chainId: number,
    evmData?: EVMData,
    decimals: number,
    hexColor: string,
    dateCreated: Date,
    provider:string,
    networkFamilyName:string,
    coingeckoId:string
    isTestnet: boolean
    blockExplorerURL:string
}


export const defaultNetworkDb:NetworkDb = {
    fullName: "Ethereum",
    ticker: "eth",
    iconPath:"https://firebasestorage.googleapis.com/v0/b/kryptikapp-50542.appspot.com/o/eth.png?alt=media&token=cc1091fb-ef28-4008-a91e-5709818c452e",
    isSupported: true,
    about: "Ethereum is the community-run technology powering the cryptocurrency ether (ETH) and thousands of decentralized applications.",
    whitePaperPath: "https://ethereum.org/en/whitepaper/",
    blockExplorerURL: "https://etherscan.io/",
    chainId: 60,
    decimals: 18,
    evmData:{
        chainId:1,
        zeroXSwapUrl:"https://api.0x.org/"
    },
    hexColor: "#3c3c3d",
    networkFamilyName: "evm",
    dateCreated: new Date('July 29, 2015 03:24:00'),
    provider: "https://eth-mainnet.alchemyapi.io/v2/NnS19sbjsKljODizz9zB-C8Fw511M-ej",
    coingeckoId: "ethereum",
    isTestnet: false
}

export const placeHolderEVMAddress:string = "0xb794f5ea0ba39494ce839613fffba74279579268";

export const placeHolderSolAddress:string = "DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK"

export const defaultTokenAndNetwork:TokenAndNetwork = {
    baseNetworkDb:defaultNetworkDb
}

export interface NetworkBalanceParameters{
    networkDb:NetworkDb,
    accountAddress: string
}


export const defaultNetwork:Network = NetworkFromTicker("eth");