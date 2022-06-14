import { Contract } from "ethers";
import { IWallet } from "../../models/IWallet";
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
    chainData: ChainData[],
    logoURI: string,
    extensions: {
       link: string,
       description: string
    },
    tags:string[]
}

export interface TokenDataEVM{
    tokenContractConnected: Contract,
    tokenBalance?:IBalance
    tokenDb: TokenDb
}

// TODO: Update so this is a class with get balance method
export interface TokenAndNetwork{
    // contract on the underlying blockchain network
    // TO DO: Add non-evm token contracts
    tokenData?:TokenDataEVM,
    networkBalance?:IBalance,
    // blockchain network the token resides on
    baseNetworkDb: NetworkDb
}

export interface TokenBalanceParameters{
    tokenDb:TokenDb, 
    erc20Contract:Contract, 
    accountAddress:string, 
    networkDb:NetworkDb
}

export interface CreateEVMContractParameters{
    erc20Db:TokenDb,
    networkDb:NetworkDb,
    wallet:IWallet
}

