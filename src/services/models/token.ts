import { Contract } from "ethers";
import { IWallet } from "../../models/KryptikWallet";
import { IBalance } from "./IBalance";
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
    contractAddress:string
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
    selectedAddress: string
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

/**
 * Determines whether two tokenAndNetwork objects represent equivalent assets
 */
export function tokenAndNetworksAreEqual(tn1:TokenAndNetwork, tn2:TokenAndNetwork, checkNetworks:boolean=true){
    // check for equality between base network
    if(checkNetworks && tn1.baseNetworkDb.fullName != tn2.baseNetworkDb.fullName) 
    {
        return false;
    }
    // shld be a correspondance between token data
    if(tn1.tokenData && !tn2.tokenData){
        return false;
    }
    if(!tn1.tokenData && tn2.tokenData){
        return false;
    }
    if(!tn2.tokenData && tn1.tokenData){
        return false;
    }
    // if token data... ensure same token name
    if(tn1.tokenData && tn2.tokenData){
        return tn1.tokenData.tokenDb.name == tn2.tokenData.tokenDb.name;
    }
    if(tn1.baseNetworkDb.fullName == tn2.baseNetworkDb.fullName) return true;
    // if we got here the tn's just represent base networks and are equivalent
    return false;
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
    priceUsd?:number,
    networkDb:NetworkDb
}

export interface CreateEVMContractParameters{
    erc20Db:TokenDb,
    networkDb:NetworkDb,
    wallet:IWallet
}

