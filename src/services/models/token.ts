import { Connection } from "@solana/web3.js";
import { Contract } from "ethers";
import { IWallet } from "../../models/KryptikWallet";
import { IBalance } from "../Web3Service";
import { NetworkDb } from "./network";


export interface ChainData{
    chainId: number,
    address: string,
    ticker:string
}

export interface TokenDb{
    name: string,
    symbol: string,
    decimals: number,
    coingeckoId: string,
    hexColor: string,
    chainData: ChainData[],
    logoURI: string,
    extensions: {
       link: string,
       description: string
    },
    tags:string[]
}

export interface TokenParamsEVM{
    tokenContractConnected: Contract
}

export interface TokenParamsSpl{
    contractAddress: string
}

export interface TokenParamsNep141{
    contractAddress: string
}

export interface TokenData{
    tokenParamsSol?:TokenParamsSpl,
    tokenParamsEVM?:TokenParamsEVM,
    tokenParamsNep141?:TokenParamsNep141,
    tokenBalance?:IBalance
    selectedAddress?: string
    tokenDb: TokenDb
}

// TODO: Update so this is a class with get balance method
export interface TokenAndNetwork{
    // contract on the underlying blockchain network
    // TO DO: Add non-evm token contracts
    tokenData?:TokenData,
    networkBalance?:IBalance,
    // blockchain network the token resides on
    baseNetworkDb: NetworkDb
}

export interface ERC20Params{
    erc20Contract:Contract, 
}

export interface SplParams{
    tokenAddress: string
}

export interface Nep141Params{
    tokenAddress: string
}

export interface TokenBalanceParameters{
    tokenDb:TokenDb, 
    splParams?:SplParams,
    nep141Params?:Nep141Params
    erc20Params?:ERC20Params, 
    accountAddress:string, 
    networkDb:NetworkDb
}

export interface CreateEVMContractParameters{
    erc20Db:TokenDb,
    networkDb:NetworkDb,
    wallet:IWallet
}

