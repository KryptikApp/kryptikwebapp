import { Transaction } from "@solana/web3.js";
import { BigNumber, BigNumberish, BytesLike } from "ethers";
import { AccessListish } from "ethers/lib/utils";
import { Network } from "hdseedloop";
import { IWallet } from "../../models/IWallet";
import Web3Service from "../Web3Service";
import { defaultNetwork, NetworkDb } from "./network";
import { KryptikProvider } from "./provider";
import { TokenAndNetwork, TokenData, TokenParamsEVM, TokenParamsNep141, TokenParamsSpl } from "./token";

export default interface TransactionFeeData{
    network: Network,
    // gas price denominated in network token, e.g. eth for Ethereum
    lowerBoundCrypto: number,
    // gas price denominated in the dollar
    lowerBoundUSD: number,
    upperBoundCrypto: number,
    upperBoundUSD: number,
    isFresh: boolean,
    EVMGas: EVMGas
}


export interface EVMGas{
    gasPrice:BigNumberish,
    gasLimit:BigNumberish,
    maxFeePerGas:BigNumberish,
    maxPriorityFeePerGas:BigNumberish,
}

export const defaultEVMGas:EVMGas = {
    gasPrice: 0,
    gasLimit: 0,
    maxFeePerGas: 0,
    maxPriorityFeePerGas: 0
}

export const defaultTransactionFeeData:TransactionFeeData = {
    network: defaultNetwork,
    isFresh: false,
    lowerBoundCrypto: 0,
    lowerBoundUSD: 0,
    upperBoundCrypto: 0,
    upperBoundUSD: 0,
    EVMGas: defaultEVMGas
}

export interface SolTransactionParams{
    sendAccount:string,
    toAddress: string,
    decimals: number,
    kryptikProvider:KryptikProvider,
    networkDb:NetworkDb,
    valueSol:number,
    tokenParamsSol?:TokenParamsSpl
}

export interface NearTransactionParams{
    sendAccount:string,
    toAddress: string,
    decimals: number,
    kryptikProvider:KryptikProvider,
    networkDb:NetworkDb,
    valueNear:number,
    tokenParamsSol?:TokenParamsNep141
}

export interface EVMTransactionParams{
    sendAccount:string,
    kryptikProvider:KryptikProvider,
    networkDb:NetworkDb
    toAddress:string,
    gasPrice: BigNumberish,
    // how much gas we're willing to use
    gasLimit: BigNumberish,
    // max fee per gas unit we're willing to pay
    maxFeePerGas: BigNumberish,
    // max tip per gas unit we're willing to pay
    maxPriorityFeePerGas: BigNumberish,
    // value in token we are sending
    value: BigNumberish
}

export type TransactionRequest = {
    to?: string,
    from?: string,
    nonce?: BigNumberish,

    gasLimit?: BigNumberish,
    gasPrice?: BigNumberish,

    data?: BytesLike,
    value?: BigNumberish,
    chainId?: number

    type?: number;
    accessList?: AccessListish;

    maxPriorityFeePerGas?: BigNumberish;
    maxFeePerGas?: BigNumberish;

    customData?: Record<string, any>;
    ccipReadEnabled?: boolean;
}

export interface TransactionPublishedData{
    // transaction hash on network
    hash: string
    explorerPath?:string
}

export const defaultTxPublishedData:TransactionPublishedData = {
    // genesis tx. hash on ethereum network
    hash: "0xc8cc9c54f19f6cb85c3fa27f493d50e136374ce5b2e3f5307b3c5eea113a003b"
}

export interface FeeDataParameters{
    networkDb:NetworkDb, solTransaction?:Transaction, tokenData?:TokenData, amountToken:string
}

export interface FeeDataSolParameters{
    transaction:Transaction,
    tokenPriceUsd:number,
    networkDb:NetworkDb
}

export interface FeeDataEvmParameters{
    network:NetworkDb, tokenPriceUsd:number, tokenData?:TokenData, amountToken:string
}

export interface CreateTransactionParameters{
    tokenAndNetwork:TokenAndNetwork,
    amountCrypto: string,
    txFeeData: TransactionFeeData,
    kryptikService: Web3Service,
    wallet: IWallet,
    toAddress:string,
    fromAddress:string,
    errorHandler: (message:string, isFatal?:boolean)=>void
}