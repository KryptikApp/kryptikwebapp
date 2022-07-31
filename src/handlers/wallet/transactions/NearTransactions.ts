import { TransactionParameters } from "hdseedloop";
import { KeyPairEd25519 } from "near-api-js/lib/utils";
import { Transaction, SCHEMA, SignedTransaction, Signature, Action, createTransaction, functionCall, transfer } from "near-api-js/lib/transaction";
import {baseEncode} from "borsh"
import { Near, utils as nearUtils } from "near-api-js";
import * as sha256 from "fast-sha256"
import { FinalExecutionOutcome } from "near-api-js/lib/providers";
import { KeyType, PublicKey } from "near-api-js/lib/utils/key_pair";
import BN from "bn.js";
import { AccessKeyView, BlockResult, ExecutionStatusBasic, FinalExecutionStatusBasic } from "near-api-js/lib/providers/provider";
import { parseNearAmount } from "near-api-js/lib/utils/format";

import { numberToBN } from "../../../helpers/utils";
import { multByDecimals } from "../../../helpers/utils/numberUtils";
import { networkFromNetworkDb, getTransactionExplorerPath } from "../../../helpers/utils/networkUtils";
import {CreateTransferTransactionParameters, TransactionPublishedData, defaultTxPublishedData, NearTransactionParams, ISignAndSendParameters } from "../../../services/models/transaction";
import { DEFAULT_NEAR_FUNCTION_CALL_GAS, FT_MINIMUM_STORAGE_BALANCE_LARGE, FT_STORAGE_DEPOSIT_GAS } from "../../../constants/nearConstants";


export interface ISignAndSendNearParameters extends ISignAndSendParameters{
  txNear:Transaction
}

// signs and sends a transaction to the NEAR Blockchain
export const signAndSendNEARTransaction = async function(params:ISignAndSendNearParameters):Promise<TransactionPublishedData>{
  let txDoneData:TransactionPublishedData = {hash:""};
  const {
    txNear,
    wallet,
    sendAccount,
    kryptikProvider} = params;
  if(!kryptikProvider.nearProvider){
    throw(new Error(`Error: Provider not set for ${kryptikProvider.networkDb.fullName}`))
  }
  let nearProvider = kryptikProvider.nearProvider;
  const serializedTx:Uint8Array = nearUtils.serialize.serialize(SCHEMA, txNear);
  const serializedTxHash = sha256.hash(serializedTx)
  // create transaction parameters
  let kryptikTxParams:TransactionParameters = {
    transactionBuffer: serializedTxHash
  };
  // sign near transaction
  const signature = await wallet.seedLoop.signTransaction(sendAccount, kryptikTxParams, kryptikProvider.network);
  // ensure signature was created
  if(!signature.nearFamilyTx){
    throw(new Error(`Error: Unable to create signature for ${kryptikProvider.networkDb.fullName} base layer transaction`))
  }
  // tx and signature that will be published to the blockchain
  const signedTransaction:SignedTransaction = new SignedTransaction({
    transaction: txNear,
    signature: new Signature({keyType: KeyType.ED25519, data: signature.nearFamilyTx})
  });
  // publish transaction to the blockchain
  try{
      const txPostResult:FinalExecutionOutcome = await nearProvider.connection.provider.sendTransaction(signedTransaction)
      console.log("NEAR POST RESULT");
      console.log(txPostResult);
      if(typeof txPostResult.status === 'object' && typeof txPostResult.status.Failure === 'object'){
        throw(new Error(`Error: NEAR transaction failed with error: ${txPostResult.status.Failure.error_message}`));
      }
      txDoneData.hash = txPostResult.transaction.hash;
  }
  catch(e:any){
    throw(e);
  }
  // set tx. explorer path
  let txExplorerPath:string|null = getTransactionExplorerPath(kryptikProvider.networkDb, txDoneData);
  txDoneData.explorerPath = txExplorerPath? txExplorerPath:txDoneData.explorerPath;
  return txDoneData;
}

// creates, signs, and publishes NEAR transfer transaction to the blockchain
export const PublishNEARTransferTx = async function(params:CreateTransferTransactionParameters){
    const {tokenAndNetwork,
        amountCrypto,
        contractAddress,
        kryptikService,
        wallet,
        toAddress,
        fromAddress,
        errorHandler} = params;
    let network =  networkFromNetworkDb(tokenAndNetwork.baseNetworkDb);
    let kryptikProvider = kryptikService.getProviderForNetwork(tokenAndNetwork.baseNetworkDb);
    let txDoneData:TransactionPublishedData = defaultTxPublishedData;
    if(!kryptikProvider.nearProvider){
        errorHandler(`Error: Provider not set for ${network.fullName}`);
        return null;
    }
    let nearProvider = kryptikProvider.nearProvider;
    // get special address for near
    let tokenWallet = wallet.seedLoop.getWalletForAddress(network, fromAddress);
    if(!tokenWallet) return null;
    let keyPair:nacl.SignKeyPair = tokenWallet.createKeyPair();
    let nearKey:KeyPairEd25519 = new KeyPairEd25519(baseEncode(keyPair.secretKey));
    let nearPubKeyString:string = nearKey.publicKey.toString();
    let txIn:NearTransactionParams = {
      sendAccount: fromAddress,
      nearPubKeyString: nearPubKeyString,
      toAddress: toAddress,
      contractAddress: contractAddress,
      valueNear: Number(amountCrypto),
      kryptikProvider: kryptikProvider,
      decimals: tokenAndNetwork.tokenData?tokenAndNetwork.tokenData.tokenDb.decimals:tokenAndNetwork.baseNetworkDb.decimals,
      networkDb: tokenAndNetwork.baseNetworkDb
    }
    let txNear:Transaction;
    // create near token tx.
    if(tokenAndNetwork.tokenData && tokenAndNetwork.tokenData.tokenParamsNep141){
      // add contract address
      txIn.contractAddress = tokenAndNetwork.tokenData.tokenParamsNep141.contractAddress;
      txNear = await createNearTokenTransaction(txIn);
    }
    // create base layer near tx.
    else{
      txNear = await createNearTransaction(txIn);
    }
    // sign and publish tx.
    let sendParams:ISignAndSendNearParameters = {
      kryptikProvider: kryptikProvider,
      sendAccount: fromAddress,
      txNear: txNear,
      wallet: wallet,
    }
    try{
      let publishResponse = await signAndSendNEARTransaction(sendParams);
      txDoneData = publishResponse;
    }
    catch(e:any){
      errorHandler(e.message, true)
      return null;
    }
    return txDoneData;
}


// tx: basic send of base near coin
export const createNearTransaction = async function(txIn:NearTransactionParams):Promise<Transaction>{
  if(!txIn.kryptikProvider.nearProvider) throw(new Error(`No provider set for ${txIn.networkDb.fullName}. Unable to create transaction.`));
  let nearProvider = txIn.kryptikProvider.nearProvider;
  // convert near amount to yocto units.. similar to wei for ethereum
  let amountYocto:string|null = parseNearAmount(txIn.valueNear.toString());
  if(!amountYocto) throw(new Error("Error: Unable to parse near amount"));
  // basic transfer type
  console.log(amountYocto);
  let bnAmount = numberToBN(amountYocto);
  const actions:Action[] = [transfer(bnAmount)];
  let pubkey = PublicKey.fromString(txIn.nearPubKeyString);
  const accessKeyResponse = await nearProvider.connection.provider.query<AccessKeyView>({
      request_type: 'view_access_key',
      account_id: txIn.sendAccount,
      public_key: pubkey.toString(),
      finality: 'optimistic'
  });
  let block:BlockResult = await nearProvider.connection.provider.block({ finality: 'final' });
  let recentBlockhash:Buffer = nearUtils.serialize.base_decode(block.header.hash); 
  const transaction:Transaction =  createTransaction(
      txIn.sendAccount,
      pubkey,
      txIn.toAddress,
      accessKeyResponse.nonce+1,
      actions,
      recentBlockhash
    );
  return transaction;
}

export const createNearTokenTransaction = async function(txIn:NearTransactionParams){
  if(!txIn.kryptikProvider.nearProvider) throw(new Error(`No provider set for ${txIn.networkDb.fullName}. Unable to create transaction.`));
  if(!txIn.contractAddress) throw(new Error("Error: No contract address provided for Near Token Transfer."));
  let nearProvider = txIn.kryptikProvider.nearProvider;
  // convert near amount to yocto units.. similar to wei for ethereum
  let amountToken:string = multByDecimals(txIn.valueNear, txIn.decimals).asString;
  // arguments to pass in to function call
  let callArgs = {amount: amountToken,
      receiver_id: txIn.toAddress}
  // hardcoded deposit amount of 1 yocto
  // smallest nonzero amount possible
  let depositAmount:BN = numberToBN("1");
  let actions:Action[] = [];
  let storageAvailable = await isStorageBalanceAvailable(nearProvider, txIn.sendAccount, txIn.contractAddress);
  console.log("Storage Available boolean");
  console.log(storageAvailable);
  // add contract storage if needed
  if(!storageAvailable){
    console.log("Adding deposit transfer action");
    let storageTransferAction = functionCall(
      'storage_deposit',
      {
          account_id: txIn.toAddress,
          registration_only: true,
      },
      new BN(FT_STORAGE_DEPOSIT_GAS),
      new BN(FT_MINIMUM_STORAGE_BALANCE_LARGE)
     )
     actions.push(storageTransferAction);
  }
  actions.push(functionCall("ft_transfer", callArgs, DEFAULT_NEAR_FUNCTION_CALL_GAS, depositAmount))
  let pubkey = PublicKey.fromString(txIn.nearPubKeyString);
  const accessKeyResponse = await nearProvider.connection.provider.query<AccessKeyView>({
      request_type: 'view_access_key',
      account_id: txIn.sendAccount,
      public_key: pubkey.toString(),
      finality: 'optimistic'
  });
  let block:BlockResult = await nearProvider.connection.provider.block({ finality: 'final' });
  let recentBlockhash:Buffer = nearUtils.serialize.base_decode(block.header.hash); 
  const transaction:Transaction =  createTransaction(
      txIn.sendAccount,
      pubkey,
      txIn.contractAddress,
      accessKeyResponse.nonce+1,
      actions,
      recentBlockhash
    );
  return transaction;
}

const getStorageBalance = async function(nearProvider:Near, accountId:string, contractAddress:string){
  let nearAccount = await nearProvider.account(accountId);
  let storageBalance = await nearAccount.viewFunction(contractAddress, 'storage_balance_of', 
            {account_id:accountId});
  return storageBalance;
}

const isStorageBalanceAvailable = async function(nearProvider:Near, accountId:string, contractAddress:string){
  const storageBalance = await getStorageBalance(nearProvider, accountId, contractAddress);
  console.log(storageBalance);
  return storageBalance?.available == storageBalance?.total;
}