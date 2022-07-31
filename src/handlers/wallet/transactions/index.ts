import { Transaction as SolTransaction } from "@solana/web3.js";
import { NetworkFamily } from "hdseedloop";
import { Transaction as NearTransaction } from "near-api-js/lib/transaction";
import { networkFromNetworkDb } from "../../../helpers/utils/networkUtils";
import { TokenAndNetwork } from "../../../services/models/token";
import { IErrorHandler, TransactionPublishedData, TransactionRequest } from "../../../services/models/transaction";
import { ISignAndSendEVMParameters, signAndSendEVMTransaction } from "./EVMTransaction";
import { ISignAndSendNearParameters, signAndSendNEARTransaction } from "./NearTransactions";
import { ISignAndSendSolParameters, signAndSendSOLTransaction } from "./SolTransactions";

export interface ISignAndSendWrapperParams{
    solParams?:ISignAndSendSolParameters
    nearParams?:ISignAndSendNearParameters
    evmParams?:ISignAndSendEVMParameters
    tokenAndNetwork:TokenAndNetwork
    errorHandler: IErrorHandler
}

export interface TxFamilyWrapper{
    evmTx?:TransactionRequest,
    solTx?:SolTransaction,
    nearTx?:NearTransaction
}

export const handleSignAndSendTransaction = async function(params:ISignAndSendWrapperParams):Promise<TransactionPublishedData|null>{
    const {tokenAndNetwork, evmParams, nearParams, solParams, errorHandler} = {...params}
    let network =  networkFromNetworkDb(tokenAndNetwork.baseNetworkDb);
    // UPDATE TO REFLECT ERROR IN UI
    switch(network.networkFamily){
      case (NetworkFamily.EVM): { 
         if(!evmParams){
            errorHandler(`Error: Unable to build transaction for ${params.tokenAndNetwork.baseNetworkDb.fullName}. Transaction parameters not provided. Please contact the Kryptik team.`, true);
            return null;
         }
         try{
            let txPub = await signAndSendEVMTransaction(evmParams);
            return txPub;
         }
         catch(e:any){
            errorHandler(e.message, true);
            return null;
         }
      } 
      case(NetworkFamily.Solana):{
          if(!solParams){
            errorHandler(`Error: Unable to build transaction for ${params.tokenAndNetwork.baseNetworkDb.fullName}. Transaction parameters not provided. Please contact the Kryptik team.`, true);
            return null;
          }
          try{
             let txPub = await signAndSendSOLTransaction(solParams);
             return txPub;
          }
          catch(e:any){
            errorHandler(e.message, true);
            return null;
          }
      }
      case(NetworkFamily.Near):{
        if(!nearParams){
            errorHandler(`Error: Unable to build transaction for ${params.tokenAndNetwork.baseNetworkDb.fullName}. Transaction parameters not provided. Please contact the Kryptik team.`, true);
            return null;
         }
        try{
          let txPub = await signAndSendNEARTransaction(nearParams);
          return txPub;
        }
        catch(e:any){
          errorHandler(e.message, true);
          return null;
        }
      }
      default: { 
          params.errorHandler(`Error: Unable to build transaction for ${params.tokenAndNetwork.baseNetworkDb.fullName}. This network is not yet supported.`, true)
          return null;
          break; 
      } 
    }
  }