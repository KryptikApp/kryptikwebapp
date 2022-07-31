import { NetworkFamily } from "hdseedloop";

import { networkFromNetworkDb } from "../../helpers/utils/networkUtils";
import { TransactionPublishedData, CreateTransferTransactionParameters } from "../../services/models/transaction";
import { PublishEVMTransferTx } from "./transactions/EVMTransaction";
import { PublishNEARTransferTx } from "./transactions/NearTransactions";
import { PublishSolTransferTx } from "./transactions/SolTransactions";


export const handlePublishTransferTransaction = async function(params:CreateTransferTransactionParameters):Promise<TransactionPublishedData|null>{
    let network =  networkFromNetworkDb(params.tokenAndNetwork.baseNetworkDb);
    // UPDATE TO REFLECT ERROR IN UI
    switch(network.networkFamily){
      case (NetworkFamily.EVM): { 
         let txPub = await PublishEVMTransferTx(params);
         return txPub;
      } 
      case(NetworkFamily.Solana):{
          let txPub = await PublishSolTransferTx(params);
          return txPub;
      }
      case(NetworkFamily.Near):{
        let txPub = await PublishNEARTransferTx(params);
        return txPub;
      }
      default: { 
          params.errorHandler(`Error: Unable to build transaction for ${params.tokenAndNetwork.baseNetworkDb.fullName}`)
          return null;
          break; 
      } 
    }
  }


