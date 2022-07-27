import { TransactionRequest } from "@ethersproject/abstract-provider";
import TransactionFeeData from "../services/models/transaction";

export interface IKryptikTxParams{
    feeData:TransactionFeeData
    tokenPriceUsd:number
}

// wrapper for common transaction data
export class KryptikTransaction{
    feeData: TransactionFeeData
    lastUpdated:number
    tokenPriceUsd:number
    constructor(params:IKryptikTxParams) {
        const {feeData, tokenPriceUsd} = {...params};
        this.feeData = feeData;
        this.tokenPriceUsd = tokenPriceUsd;
        this.lastUpdated = Date.now();
    }
    // TODO: update so transaction is refreshed as well
    updateFeeData(newFeeData:TransactionFeeData){
        this.feeData = newFeeData;
        this.lastUpdated = Date.now();
    }
}


export interface IKryptikEVMTxParams extends IKryptikTxParams{
    evmTransaction:TransactionRequest
}

export class KryptikEVMTransaction extends KryptikTransaction{
    evmTransaction:TransactionRequest
    constructor(params:IKryptikEVMTxParams) {
        super(params)
        const {evmTransaction} = {...params};
        this.evmTransaction = evmTransaction;
    }
}