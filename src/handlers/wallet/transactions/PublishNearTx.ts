import { TransactionParameters } from "hdseedloop";
import { KeyPairEd25519 } from "near-api-js/lib/utils";
import { networkFromNetworkDb, getTransactionExplorerPath } from "../../../helpers/wallet/utils";
import { CreateTransactionParameters, TransactionPublishedData, defaultTxPublishedData, NearTransactionParams } from "../../../services/models/transaction";
import { createNearTokenTransaction, createNearTransaction } from "../transactionHandler";
import { Transaction, SCHEMA, SignedTransaction, Signature } from "near-api-js/lib/transaction";
import {baseEncode} from "borsh"
import { utils as nearUtils } from "near-api-js";
import * as sha256 from "fast-sha256"
import { FinalExecutionOutcome } from "near-api-js/lib/providers";
import { KeyType } from "near-api-js/lib/utils/key_pair";



// creates, signs, and publishes NEAR transaction to the blockchain
export const PublishNEARTransaction = async function(params:CreateTransactionParameters){
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
    console.log(txNear);
    const serializedTx:Uint8Array = nearUtils.serialize.serialize(SCHEMA, txNear);
    const serializedTxHash = sha256.hash(serializedTx)
    // create transaction parameters
    let kryptikTxParams:TransactionParameters = {
      transactionBuffer: serializedTxHash
    };
    // sign near transaction
    const signature = await wallet.seedLoop.signTransaction(fromAddress, kryptikTxParams, network);
    // ensure signature was created
    if(!signature.nearFamilyTx){
      errorHandler(`Error: Unable to create signature for ${tokenAndNetwork.baseNetworkDb.fullName} base layer transaction`);
      return null;
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
        console.log("NEAR Transaction published!")
        console.log(txPostResult);
    }
    catch(e){
      let msg = `Unable to publish ${tokenAndNetwork.baseNetworkDb.fullName} transaction.`;
      errorHandler(msg, true)
      return null;
    }
    // set tx. explorer path
    let txExplorerPath:string|null = getTransactionExplorerPath(tokenAndNetwork.baseNetworkDb, txDoneData);
    txDoneData.explorerPath = txExplorerPath? txExplorerPath:txDoneData.explorerPath;
    return txDoneData;
}