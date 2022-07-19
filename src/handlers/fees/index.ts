
import { Transaction } from "@solana/web3.js";
import { Network, NetworkFamily } from "hdseedloop";
import { getPriceOfTicker } from "../../helpers/coinGeckoHelper";
import { networkFromNetworkDb } from "../../helpers/utils/networkUtils";
import { NetworkDb } from "../../services/models/network";
import { KryptikProvider } from "../../services/models/provider";
import { TokenData } from "../../services/models/token";
import TransactionFeeData, {TxType } from "../../services/models/transaction";
import { getTransactionFeeData1559Compatible } from "./EVMFees";
import { getTransactionFeeDataNear } from "./NearFees";
import { getTransactionFeeDataSolana } from "./SolanaFees";


export interface IFeeDataParameters{
    kryptikProvider:KryptikProvider, networkDb:NetworkDb, sendAccount:string, txType:TxType, solTransaction?:Transaction, tokenData?:TokenData, amountToken:string
}

export interface INetworkFeeDataParams{
    tokenPriceUsd:number,
    networkDb:NetworkDb,
    kryptikProvider:KryptikProvider
}


export async function getTransactionFeeData(params:IFeeDataParameters):Promise<TransactionFeeData|null>{
    let network:Network =  networkFromNetworkDb(params.networkDb);
    let tokenPriceUsd:number = await getPriceOfTicker(params.networkDb.coingeckoId);
    switch(network.networkFamily){
        case (NetworkFamily.EVM): { 
            let transactionFeeData:TransactionFeeData = await getTransactionFeeData1559Compatible({kryptikProvider:params.kryptikProvider, networkDb:params.networkDb, tokenPriceUsd: tokenPriceUsd, tokenData: params.tokenData, amountToken:params.amountToken});
            return transactionFeeData;
            break; 
         } 
         case(NetworkFamily.Solana):{
            if(!params.solTransaction) return null;
            let transactionFeeData:TransactionFeeData = await getTransactionFeeDataSolana({kryptikProvider:params.kryptikProvider, tokenPriceUsd:tokenPriceUsd, transaction:params.solTransaction, networkDb:params.networkDb});
            return transactionFeeData;
            break;
         }
         case(NetworkFamily.Near):{
            let transactionFeeData:TransactionFeeData = await getTransactionFeeDataNear({kryptikProvider:params.kryptikProvider, tokenPriceUsd:tokenPriceUsd, txType:params.txType, networkDb:params.networkDb});
            return transactionFeeData;
            break;
         }
         default: { 
            return null;
            break; 
         } 
    }
}