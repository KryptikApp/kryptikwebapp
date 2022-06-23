import { PublicKey, Transaction as SOLTransaction } from "@solana/web3.js";
import { utils} from "ethers";
import { NetworkFamily, TransactionParameters, SignedTransaction } from "hdseedloop";
import { networkFromNetworkDb, roundToDecimals, getTransactionExplorerPath, lamportsToSol, roundCryptoAmount, formatTicker } from "../../helpers/wallet/utils";
import { TokenParamsSpl } from "../../services/models/token";
import { TransactionPublishedData, defaultTxPublishedData, TransactionRequest, SolTransactionParams, CreateTransactionParameters, EVMTransactionParams, NearTransactionParams } from "../../services/models/transaction";
import { createEVMTransaction, createNearTransaction, createSolTokenTransaction, createSolTransaction } from "./transactionHandler";
import { PublishNEARTransaction } from "./transactions/PublishNearTx";


export const handlePublishTransaction = async function(params:CreateTransactionParameters):Promise<TransactionPublishedData|null>{
    let network =  networkFromNetworkDb(params.tokenAndNetwork.baseNetworkDb);
    // UPDATE TO REFLECT ERROR IN UI
    switch(network.networkFamily){
      case (NetworkFamily.EVM): { 
         let txPub = await PublishEVMTransaction(params);
         return txPub;
      } 
      case(NetworkFamily.Solana):{
          let txPub = await PublishSolTransaction(params);
          return txPub;
      }
      case(NetworkFamily.Near):{
        let txPub = await PublishNEARTransaction(params);
        return txPub;
      }
      default: { 
          params.errorHandler(`Error: Unable to build transaction for ${params.tokenAndNetwork.baseNetworkDb.fullName}`)
          return null;
          break; 
      } 
    }
  }

// creates, signs, and publishes transaction to the blockchain
const PublishEVMTransaction = async function(params:CreateTransactionParameters){
    const {tokenAndNetwork,
        amountCrypto,
        txFeeData,
        kryptikService,
        wallet,
        toAddress,
        fromAddress,
        errorHandler} = params;
    let network =  networkFromNetworkDb(tokenAndNetwork.baseNetworkDb);
    let kryptikProvider = kryptikService.getProviderForNetwork(tokenAndNetwork.baseNetworkDb);
    let txDoneData:TransactionPublishedData = defaultTxPublishedData;

    if(!kryptikProvider.ethProvider){
        errorHandler(`Error: Provider not set for ${network.fullName}`);
        return null;
      }
      let ethProvider = kryptikProvider.ethProvider;
      // amount with correct number of decimals
      let tokenDecimals = tokenAndNetwork.tokenData?tokenAndNetwork.tokenData.tokenDb.decimals:tokenAndNetwork.baseNetworkDb.decimals;
      let amountDecimals = roundToDecimals(Number(amountCrypto), tokenDecimals).toString();
      // sign and send erc20 token
      if(tokenAndNetwork.tokenData && tokenAndNetwork.tokenData.tokenParamsEVM){
         let txResponse = await tokenAndNetwork.tokenData.tokenParamsEVM.tokenContractConnected.transfer(toAddress, utils.parseEther(amountDecimals));
         if(txResponse.hash) txDoneData.hash = txResponse.hash;
      }
      // sign and send base layer tx.
      else{
          let evmParams:EVMTransactionParams = {
            value: utils.parseEther(amountDecimals), sendAccount: fromAddress,
            toAddress: toAddress, gasLimit: txFeeData.EVMGas.gasLimit, 
            maxFeePerGas:txFeeData.EVMGas.maxFeePerGas, 
            maxPriorityFeePerGas:txFeeData.EVMGas.maxPriorityFeePerGas, 
            networkDb:tokenAndNetwork.baseNetworkDb, 
            gasPrice: txFeeData.EVMGas.gasPrice,
            kryptikProvider:kryptikService.getProviderForNetwork(tokenAndNetwork.baseNetworkDb)
          }
          let EVMTransaction:TransactionRequest = await createEVMTransaction(evmParams);
          // sign tx.
          let kryptikTxParams:TransactionParameters = {
              evmTransaction: EVMTransaction
          }
          let signedTx:SignedTransaction = await wallet.seedLoop.signTransaction(fromAddress, kryptikTxParams, network);
          if(!signedTx.evmFamilyTx) throw(new Error("Error: Unable to sign EVM transaction"));
          console.log(signedTx.evmFamilyTx);
          let txResponse = await ethProvider.sendTransaction(signedTx.evmFamilyTx);
          txDoneData.hash = txResponse.hash;
      }
      // set tx. explorer path
      let txExplorerPath:string|null = getTransactionExplorerPath(tokenAndNetwork.baseNetworkDb, txDoneData);
      txDoneData.explorerPath = txExplorerPath?txExplorerPath:txDoneData.explorerPath;
      return txDoneData;
}



// creates, signs, and publishes transaction to the blockchain
const PublishSolTransaction = async function(params:CreateTransactionParameters){
  const {tokenAndNetwork,
      amountCrypto,
      kryptikService,
      wallet,
      toAddress,
      fromAddress,
      errorHandler} = params;
  let network =  networkFromNetworkDb(tokenAndNetwork.baseNetworkDb);
  let kryptikProvider = kryptikService.getProviderForNetwork(tokenAndNetwork.baseNetworkDb);
  let txDoneData:TransactionPublishedData = defaultTxPublishedData;
  if(!kryptikProvider.solProvider){
      errorHandler(`Error: Provider not set for ${network.fullName}`);
      return null;
    }
    let solProvider = kryptikProvider.solProvider;
    let txIn:SolTransactionParams = {
      sendAccount: fromAddress,
      toAddress: toAddress,
      valueSol: Number(amountCrypto),
      kryptikProvider: kryptikProvider,
      decimals: tokenAndNetwork.tokenData?tokenAndNetwork.tokenData.tokenDb.decimals:tokenAndNetwork.baseNetworkDb.decimals,
      networkDb: tokenAndNetwork.baseNetworkDb
    }
    let txSol:SOLTransaction;
    // create sol token 
    if(tokenAndNetwork.tokenData && tokenAndNetwork.tokenData.tokenParamsSol){
      // add sol token data to input params
      let txSolData:TokenParamsSpl = tokenAndNetwork.tokenData.tokenParamsSol;
      txIn.tokenParamsSol = txSolData;
      txSol = await createSolTokenTransaction(txIn);
    }
    // create base layer sol tx.
    else{
      txSol = await createSolTransaction(txIn);
    }
    // create transaction parameters
    let kryptikTxParams:TransactionParameters = {
      transactionBuffer: txSol.serializeMessage()
    };
    // sign sol transaction
    const signature = await wallet.seedLoop.signTransaction(fromAddress, kryptikTxParams, network);
    // ensure signature was created
    if(!signature.solanaFamilyTx){
      errorHandler(`Error: Unable to create signature for ${tokenAndNetwork.baseNetworkDb.fullName} transaction`);
      return null;
    }
    txSol.addSignature(new PublicKey(fromAddress), Buffer.from(signature.solanaFamilyTx));
    // verify signature
    if(!txSol.verifySignatures()){
      errorHandler(`Error: Unable to verify signature for ${tokenAndNetwork.baseNetworkDb.fullName} transaction`)
      return null;
    }
    // publish transaction to the blockchain
    try{
      const txPostResult = await solProvider.sendRawTransaction(txSol.serialize());
      txDoneData.hash = txPostResult;
      console.log("Transaction published!")
      console.log(txPostResult);
    }
    catch(e){
      console.log(e);
      let fromPubKey:PublicKey = new PublicKey(txIn.sendAccount);
      let accountInfo = await solProvider.getAccountInfo(fromPubKey);
      let dataLength:number = accountInfo?accountInfo.data.length:50;
      let minimumAmountSol:number = lamportsToSol(await solProvider.getMinimumBalanceForRentExemption(dataLength));
      let msg = `Unable to publish ${tokenAndNetwork.baseNetworkDb.fullName} transaction. Note: Your Solana Account must hold at least ${roundCryptoAmount(minimumAmountSol)} ${formatTicker(tokenAndNetwork.baseNetworkDb.ticker)} to pay 'rent' for space used on the blockchain.`;
      errorHandler(msg, true)
      return null;
    }
    // set tx. explorer path
    let txExplorerPath:string|null = getTransactionExplorerPath(tokenAndNetwork.baseNetworkDb, txDoneData);
    txDoneData.explorerPath = txExplorerPath? txExplorerPath:txDoneData.explorerPath;
    return txDoneData;
}