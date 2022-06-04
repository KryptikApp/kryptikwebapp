import { BigNumberish, BytesLike } from "ethers";
import { AccessListish } from "ethers/lib/utils";
import { Network } from "hdseedloop";
import { KryptikProvider } from "../Web3Service";
import { defaultNetwork, NetworkDb } from "./network";

export default interface TransactionFeeData{
    network: Network,
    // gas price denominated in network token, e.g. eth for Ethereum
    lowerBoundCrypto: number,
    // gas price denominated in the dollar
    lowerBoundUSD: number,
    upperBoundCrypto: number,
    upperBoundUsd: number,
    isFresh: boolean,
    EVMGas: EVMGas
}

export interface EVMGas{
    gasLimit:BigNumberish,
    maxFeePerGas:BigNumberish,
    maxPriorityFeePerGas:BigNumberish,
}

export const defaultTransactionFeeData:TransactionFeeData = {
    network: defaultNetwork,
    isFresh: false,
    lowerBoundCrypto: 0,
    lowerBoundUSD: 0,
    upperBoundCrypto: 0,
    upperBoundUsd: 0,
    EVMGas: {
        gasLimit: 0,
        maxFeePerGas: 0,
        maxPriorityFeePerGas: 0
    }
}

export interface EVMTransaction{
    sendAccount:string,
    kryptikProvider:KryptikProvider,
    networkDb:NetworkDb
    toAddress:string,
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