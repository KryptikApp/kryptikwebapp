import { TransactionParameters } from "hdseedloop";
import { KeyPairEd25519 } from "near-api-js/lib/utils";
import { Transaction, SCHEMA, SignedTransaction, Signature, Action, createTransaction, functionCall, transfer } from "near-api-js/lib/transaction";
import {baseEncode} from "borsh"
import { utils as nearUtils } from "near-api-js";
import * as sha256 from "fast-sha256"
import { FinalExecutionOutcome } from "near-api-js/lib/providers";
import { KeyType, PublicKey } from "near-api-js/lib/utils/key_pair";
import BN from "bn.js";
import { AccessKeyView, BlockResult } from "near-api-js/lib/providers/provider";
import { parseNearAmount } from "near-api-js/lib/utils/format";

import { numberToBN } from "../../../helpers/utils";
import { multByDecimals } from "../../../helpers/utils/numberUtils";
import { networkFromNetworkDb, getTransactionExplorerPath } from "../../../helpers/utils/networkUtils";
import { CreateTransactionParameters, TransactionPublishedData, defaultTxPublishedData, NearTransactionParams, ISignAndSendParameters } from "../../../services/models/transaction";
import { DEFAULT_NEAR_FUNCTION_CALL_GAS } from "../../../constants/nearConstants";



export interface ISignAndSendNearParameters extends ISignAndSendParameters{
  txNear:Transaction
}

// signs and sends a transaction to the NEAR Blockchain
export const signAndSendNEARTransaction = async function(params:ISignAndSendNearParameters):Promise<TransactionPublishedData>{
  let txDoneData:TransactionPublishedData = defaultTxPublishedData;
  const {
    txNear,
    wallet,
    sendAccount,
    networkDb,
    kryptikProvider} = params;
  let network = networkFromNetworkDb(networkDb)
  if(!kryptikProvider.nearProvider){
    throw(new Error(`Error: Provider not set for ${network.fullName}`))
  }
  let nearProvider = kryptikProvider.nearProvider;
  const serializedTx:Uint8Array = nearUtils.serialize.serialize(SCHEMA, txNear);
  const serializedTxHash = sha256.hash(serializedTx)
  // create transaction parameters
  let kryptikTxParams:TransactionParameters = {
    transactionBuffer: serializedTxHash
  };
  // sign near transaction
  const signature = await wallet.seedLoop.signTransaction(sendAccount, kryptikTxParams, network);
  // ensure signature was created
  if(!signature.nearFamilyTx){
    throw(new Error(`Error: Unable to create signature for ${network.fullName} base layer transaction`))
  }
  // tx and signature that will be published to the blockchain
  const signedTransaction:SignedTransaction = new SignedTransaction({
    transaction: txNear,
    signature: new Signature({keyType: KeyType.ED25519, data: signature.nearFamilyTx})
  });
  // publish transaction to the blockchain
  try{
      const txPostResult:FinalExecutionOutcome = await nearProvider.connection.provider.sendTransaction(signedTransaction)
      txDoneData.hash = txPostResult.transaction.hash;
  }
  catch(e:any){
    throw(e);
  }
  // set tx. explorer path
  let txExplorerPath:string|null = getTransactionExplorerPath(networkDb, txDoneData);
  txDoneData.explorerPath = txExplorerPath? txExplorerPath:txDoneData.explorerPath;
  return txDoneData;
}

// creates, signs, and publishes NEAR transfer transaction to the blockchain
export const PublishNEARTransferTx = async function(params:CreateTransactionParameters){
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
      valueNear: Number(amountCrypto),
      kryptikProvider: kryptikProvider,
      decimals: tokenAndNetwork.tokenData?tokenAndNetwork.tokenData.tokenDb.decimals:tokenAndNetwork.baseNetworkDb.decimals,
      networkDb: tokenAndNetwork.baseNetworkDb
    }
    let txNear:Transaction;
    // create near token tx.
    if(tokenAndNetwork.tokenData && tokenAndNetwork.tokenData.tokenParamsNep141){
      txNear = await createNearTokenTransaction(txIn);
    }
    // create base layer sol tx.
    else{
      txNear = await createNearTransaction(txIn);
    }
    // sign and publish tx.
    let sendParams:ISignAndSendNearParameters = {
      kryptikProvider: kryptikProvider,
      networkDb: tokenAndNetwork.baseNetworkDb,
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
  let nearProvider = txIn.kryptikProvider.nearProvider;
  // convert near amount to yocto units.. similar to wei for ethereum
  let amountToken:string = multByDecimals(txIn.valueNear, txIn.decimals).asString;
  // arguments to pass in to function call
  let callArgs = {receiver_id: txIn.toAddress,
      amount: amountToken,
      memo: null}
  // hardcoded deposit amount of 1 yocto
  // smallest nonzero amount possible
  let depositAmount:BN = numberToBN("1");
  const actions:Action[] = [functionCall("ft_transfer", callArgs, DEFAULT_NEAR_FUNCTION_CALL_GAS, depositAmount)];
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