import { Transaction } from "@solana/web3.js";
import { BigNumber, BigNumberish, BytesLike } from "ethers";
import { AccessListish } from "ethers/lib/utils";
import { Network } from "hdseedloop";
import { IWallet } from "../../models/KryptikWallet";
import Web3Service from "../Web3Service";
import { defaultNetwork, NetworkDb } from "./network";
import { KryptikProvider } from "./provider";
import { TokenAndNetwork, TokenData, TokenParamsEVM, TokenParamsNep141, TokenParamsSpl } from "./token";

// TODO: UPDATE TO BE CLASS WITH PERSISTENT CHECKS FOR FRESHNESS
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


// all units should be in wei or wei equivalent
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

export interface SolTransactionParams extends TransactionParams{
    decimals: number,
    valueSol:number,
    tokenParamsSol?:TokenParamsSpl
}

export interface NearTransactionParams extends TransactionParams{
    contractAddress?:string,
    nearPubKeyString:string,
    decimals: number,
    valueNear:number
}

export interface EVMTransactionParams extends TransactionParams{
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

export interface TransactionParams{
    sendAccount:string,
    kryptikProvider:KryptikProvider,
    networkDb:NetworkDb
    toAddress:string,
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
    networkDb:NetworkDb, sendAccount:string, txType:TxType, solTransaction?:Transaction, tokenData?:TokenData, amountToken:string
}

export interface FeeDataSolParameters{
    transaction:Transaction,
    tokenPriceUsd:number,
    networkDb:NetworkDb
}

export enum TxType{
  TransferNative=0,
  TransferToken=1
}

export interface FeeDataNearParameters{
    tokenPriceUsd:number,
    networkDb:NetworkDb,
    txType:TxType
}

export interface FeeDataEvmParameters{
    network:NetworkDb, tokenPriceUsd:number, tokenData?:TokenData, amountToken:string
}

export type IErrorHandler = (message:string, isFatal?:boolean)=>void

export const defaultErrorHandler = function(message:string, isFatal?:boolean){
    console.log("Kryptik App Encountered An Error:");
    console.warn(message);
}

export interface CreateTransferTransactionParameters{
    tokenAndNetwork:TokenAndNetwork,
    amountCrypto: string,
    txFeeData: TransactionFeeData,
    kryptikService: Web3Service,
    wallet: IWallet,
    toAddress:string,
    fromAddress:string,
    contractAddress?:string,
    errorHandler: IErrorHandler
}

export interface ISignAndSendParameters{
    sendAccount:string,
    wallet:IWallet,
    kryptikProvider:KryptikProvider,
    errorHandler?:IErrorHandler
}

export interface AmountTotalBounds{
    lowerBoundTotalUsd: string,
    upperBoundTotalUsd: string
  }
export const defaultAmountTotalBounds = {lowerBoundTotalUsd: "0", upperBoundTotalUsd: "0"};