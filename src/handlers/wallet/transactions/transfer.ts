import { Transaction as SolTransaction } from "@solana/web3.js";
import { NetworkFamily } from "hdseedloop";
import { networkFromNetworkDb } from "../../../helpers/utils/networkUtils";
import { KryptikTransaction } from "../../../models/transactions";
import { TokenParamsSpl } from "../../../services/models/token";
import { CreateTransferTransactionParameters, EVMTransferTxParams, NearTransactionParams, SolTransactionParams, TxType } from "../../../services/models/transaction"
import { createEVMTransferTransaction} from "./EVMTransaction";
import { BuildNEARTransfer } from "./NearTransactions";
import { createSolTokenTransferTransaction, createSolTransferTransaction} from "./SolTransactions";

export async function BuildTransferTx(params:CreateTransferTransactionParameters):Promise<KryptikTransaction|null>{
    const{kryptikProvider, fromAddress, toAddress, amountCrypto, tokenAndNetwork, tokenPriceUsd} = {...params}
    let txType:TxType = tokenAndNetwork.tokenData?TxType.TransferToken:TxType.TransferNative;
    let network =  networkFromNetworkDb(params.tokenAndNetwork.baseNetworkDb);
    console.log(`building transfer tx... from ${fromAddress} to ${toAddress} `)
    // UPDATE TO REFLECT ERROR IN UI
    switch(network.networkFamily){
      case (NetworkFamily.EVM): { 
        let txIn:EVMTransferTxParams = {
            sendAccount: fromAddress,
            toAddress: toAddress,
            valueCrypto: Number(amountCrypto),
            kryptikProvider: kryptikProvider,
            tokenAndNetwork: tokenAndNetwork,
            tokenPriceUsd: tokenPriceUsd
          }
         let tx:KryptikTransaction|null = await createEVMTransferTransaction(txIn)
         return tx;
         break;
      } 
      case(NetworkFamily.Solana):{
          let txIn:SolTransactionParams = {
            sendAccount: fromAddress,
            toAddress: toAddress,
            valueSol: Number(amountCrypto),
            kryptikProvider: kryptikProvider,
            decimals: tokenAndNetwork.tokenData?tokenAndNetwork.tokenData.tokenDb.decimals:tokenAndNetwork.baseNetworkDb.decimals,
            tokenAndNetwork: tokenAndNetwork,
            tokenPriceUsd: tokenPriceUsd
          }
          let tx:KryptikTransaction;
          if(tokenAndNetwork.tokenData && tokenAndNetwork.tokenData.tokenParamsSol){
            // add sol token data to input params
            let txSolData:TokenParamsSpl = tokenAndNetwork.tokenData.tokenParamsSol;
            txIn.tokenParamsSol = txSolData;
            tx = await createSolTokenTransferTransaction(txIn);
          }
          // create base layer sol tx.
          else{
            tx = await createSolTransferTransaction(txIn);
          }
          return tx;
      }
      case(NetworkFamily.Near):{
        let txIn:NearTransactionParams = {
            sendAccount: fromAddress,
            toAddress: toAddress,
            valueNear: Number(amountCrypto),
            kryptikProvider: kryptikProvider,
            decimals: tokenAndNetwork.tokenData?tokenAndNetwork.tokenData.tokenDb.decimals:tokenAndNetwork.baseNetworkDb.decimals,
            tokenAndNetwork: tokenAndNetwork,
            tokenPriceUsd: tokenPriceUsd,
            txType: txType
        }
        let tx:KryptikTransaction|null = await BuildNEARTransfer(txIn)
        return tx;
      }
      default: { 
          params.errorHandler(`Error: Unable to build transaction for ${params.tokenAndNetwork.baseNetworkDb.fullName}`)
          return null;
          break; 
      } 
    }
}