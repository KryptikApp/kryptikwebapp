import { utils } from "ethers";
import { TransactionParameters, SignedTransaction } from "hdseedloop";
import { networkFromNetworkDb, getTransactionExplorerPath } from "../../../helpers/utils/networkUtils";
import { roundToDecimals } from "../../../helpers/utils/numberUtils";
import { CreateTransactionParameters, TransactionPublishedData, defaultTxPublishedData, EVMTransactionParams, TransactionRequest, ISignAndSendParameters } from "../../../services/models/transaction";


export interface ISignAndSendEVMParameters extends ISignAndSendParameters{
    txEVM:TransactionRequest
}

// signs and send basic evm transaction
export const signAndSendEVMTransaction = async function(params:ISignAndSendEVMParameters):Promise<TransactionPublishedData>{
    let txDoneData:TransactionPublishedData = defaultTxPublishedData;
    const {
        txEVM,
        wallet,
        sendAccount,
        kryptikProvider,
        networkDb} = params;
    let network = networkFromNetworkDb(networkDb)
    // get provider
    if(!kryptikProvider.ethProvider){
      throw(new Error(`Error: Provider not set for ${network.fullName}`))
    }
    let evmProvider = kryptikProvider.ethProvider;
    // sign tx.
    let kryptikTxParams:TransactionParameters = {
        evmTransaction: txEVM
    }
    try{
        let signedTx:SignedTransaction = await wallet.seedLoop.signTransaction(sendAccount, kryptikTxParams, network);
        if(!signedTx.evmFamilyTx) throw(new Error("Error: Unable to sign EVM transaction"));
        let txResponse = await evmProvider.sendTransaction(signedTx.evmFamilyTx);
        txDoneData.hash = txResponse.hash;
    }
    catch(e){
        throw(new Error("Error: Unbale to publish transaction"));
    }
    return txDoneData;
}

// creates, signs, and publishes EVM transfer transaction to the blockchain
export const PublishEVMTransferTx = async function(params:CreateTransactionParameters){
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
                 // sign and publish tx.
          let sendParams:ISignAndSendEVMParameters = {
              kryptikProvider: kryptikProvider,
              networkDb: tokenAndNetwork.baseNetworkDb,
              sendAccount: fromAddress,
              txEVM: EVMTransaction,
              wallet: wallet,
          }
          try{
            txDoneData = await signAndSendEVMTransaction(sendParams);
          }
          catch(e:any){
            if(e.message){
                errorHandler(e.message, true)
            }
            else{
                errorHandler(`Unable to publish ${tokenAndNetwork.baseNetworkDb.fullName} transaction.`)
            }
            return null;
          }
      }
      // set tx. explorer path
      let txExplorerPath:string|null = getTransactionExplorerPath(tokenAndNetwork.baseNetworkDb, txDoneData);
      txDoneData.explorerPath = txExplorerPath?txExplorerPath:txDoneData.explorerPath;
      return txDoneData;
}


export const createEVMTransaction = async function(txIn:EVMTransactionParams):Promise<TransactionRequest>{
    const {sendAccount, toAddress, value, gasLimit, maxFeePerGas, maxPriorityFeePerGas, kryptikProvider, networkDb} = txIn;
    if(!kryptikProvider.ethProvider){
        throw(new Error(`Error: No EVM provider specified for ${networkDb.fullName}`));
    };
    let ethProvider = kryptikProvider.ethProvider;
    let accountNonce = await ethProvider.getTransactionCount(sendAccount, "latest");
    let chainIdEVM = networkDb.chainIdEVM;
    let tx:TransactionRequest;
    // UPDATE SO BETTER TYPE 1 VS. TYPE 2 CASING
    if(txIn.networkDb.ticker != "eth(arbitrum)"){
        tx = {
            from: sendAccount,
            to: toAddress,
            value: value,
            nonce: accountNonce,
            gasLimit: gasLimit,
            chainId: chainIdEVM,
            type:2,
            maxFeePerGas: maxFeePerGas,
            maxPriorityFeePerGas: maxPriorityFeePerGas,
        }
    }
    else{
        tx = {
            from: sendAccount,
            to: toAddress,
            value: value,
            nonce: accountNonce,
            gasLimit: gasLimit,
            chainId: chainIdEVM,
            gasPrice: txIn.gasPrice
        }
    }
    return tx;
}