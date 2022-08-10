import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { TransactionParameters, SignedTransaction } from "hdseedloop";
import { erc20Abi } from "../../../abis/erc20Abi";
import { networkFromNetworkDb, getTransactionExplorerPath, isEVMTxTypeTwo, getChainDataForNetwork } from "../../../helpers/utils/networkUtils";
import { roundDecimalsByNetworkToken, roundToDecimals } from "../../../helpers/utils/numberUtils";
import { IKryptikTxParams, KryptikTransaction } from "../../../models/transactions";
import { ChainData } from "../../../services/models/token";
import { TransactionPublishedData, defaultTxPublishedData, TransactionRequest, ISignAndSendParameters, EVMTransferTxParams, TxType } from "../../../services/models/transaction";
import { getTransactionFeeDataEVM } from "../../fees/EVMFees";


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
        kryptikProvider} = params;
    let network = networkFromNetworkDb(kryptikProvider.networkDb)
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
        // set tx. explorer path
        let txExplorerPath:string|null = getTransactionExplorerPath(kryptikProvider.networkDb, txDoneData);
        txDoneData.explorerPath = txExplorerPath?txExplorerPath:txDoneData.explorerPath;
    }
    catch(e:any){
        let errorMsg:string = e.message.toLowerCase();
        console.log("error message:");
        console.log(errorMsg);
        if(errorMsg.includes("insufficient funds")){
            throw(new Error("Not enough funds to execute transaction."));
        }
        throw(new Error("Unable to publish transaction"));
    }
    return txDoneData;
}

// creates evm transfer transaction for erc20 or coin on base network
export const createEVMTransferTransaction = async function(txIn:EVMTransferTxParams):Promise<KryptikTransaction|null>{
    const {sendAccount, toAddress, valueCrypto, kryptikProvider, tokenAndNetwork, tokenPriceUsd} = txIn;
    if(!kryptikProvider.ethProvider){
        throw(new Error(`Error: No EVM provider specified for ${tokenAndNetwork.baseNetworkDb.fullName}`));
    };
    if(!tokenAndNetwork.baseNetworkDb.evmData){
        throw(new Error(`Error: No EVM DATA specified for ${tokenAndNetwork.baseNetworkDb.fullName} network model`));
    }
    let ethProvider = kryptikProvider.ethProvider;
    let accountNonce = await ethProvider.getTransactionCount(sendAccount, "latest");
    let chainIdEVM = tokenAndNetwork.baseNetworkDb.evmData.chainId;
    let tx:TransactionRequest;
    let tokenDecimals:number = tokenAndNetwork.tokenData?tokenAndNetwork.tokenData.tokenDb.decimals:tokenAndNetwork.baseNetworkDb.decimals;
    let roundedAmountCrypto = roundToDecimals(valueCrypto, tokenDecimals);
    let value = parseUnits(roundedAmountCrypto.toString(), tokenDecimals)
    console.log("EVM tx value:");
    let txType:TxType;
    if(!tokenAndNetwork.tokenData){
        tx = {
            from: sendAccount,
            to: toAddress,
            value: value,
            nonce: accountNonce,
            chainId: chainIdEVM,
        }
        txType = TxType.TransferNative;
    }
    // creates evm transfer tx for ERC20 token
    else{
        txType = TxType.TransferToken;
        let erc20ChainData:ChainData|null = getChainDataForNetwork(txIn.tokenAndNetwork.baseNetworkDb, tokenAndNetwork.tokenData.tokenDb);
        if(!erc20ChainData) return null;
        let erc20Contract = new Contract(erc20ChainData.address, erc20Abi);
        if(!erc20Contract){
            return null;
        }
        tx = await erc20Contract.populateTransaction.transfer(txIn.toAddress, value);
        tx.from = sendAccount;
        tx.chainId = chainIdEVM;
    }
    tx.nonce = accountNonce;

    let kryptikFeeData = await getTransactionFeeDataEVM({kryptikProvider: kryptikProvider, tokenPriceUsd:tokenPriceUsd, tx:tx, networkDb:tokenAndNetwork.baseNetworkDb})


    if(isEVMTxTypeTwo(tokenAndNetwork.baseNetworkDb)){
        tx.type = 2;
        tx.maxPriorityFeePerGas = kryptikFeeData.EVMGas.maxPriorityFeePerGas;
        tx.gasLimit = kryptikFeeData.EVMGas.gasLimit;
        tx.maxFeePerGas = kryptikFeeData.EVMGas.maxFeePerGas
    }
    else{
        tx.gasLimit = kryptikFeeData.EVMGas.gasLimit;
        tx.gasPrice = kryptikFeeData.EVMGas.gasPrice;
    }

    // create krptik tx. object
    let kryptikTxParams:IKryptikTxParams = {
        feeData: kryptikFeeData,
        kryptikTx:{
            evmTx: tx
        },
        txType: TxType.Swap,
        tokenAndNetwork: txIn.tokenAndNetwork,
        tokenPriceUsd: txIn.tokenPriceUsd,
      }
    let kryptikTx:KryptikTransaction = new KryptikTransaction(kryptikTxParams);
    return kryptikTx;
}