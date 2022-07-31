import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import * as splToken from "@solana/spl-token"
import { TransactionParameters } from "hdseedloop";

import { createEd25519PubKey, createSolTokenAccount } from "../../../helpers/utils/accountUtils";
import { networkFromNetworkDb, formatTicker, getTransactionExplorerPath } from "../../../helpers/utils/networkUtils";
import { lamportsToSol, multByDecimals, roundCryptoAmount, solToLamports } from "../../../helpers/utils/numberUtils";
import { TokenParamsSpl } from "../../../services/models/token";
import { CreateTransferTransactionParameters, defaultTxPublishedData, ISignAndSendParameters, SolTransactionParams, TransactionPublishedData } from "../../../services/models/transaction";

export interface SolFamilyTx{
  txSol:Transaction
}

export interface ISignAndSendSolParameters extends ISignAndSendParameters{
    txSol:Transaction
}

// signs and sends any sol transaction
export const signAndSendSOLTransaction = async function(params:ISignAndSendSolParameters):Promise<TransactionPublishedData>{
    let txDoneData:TransactionPublishedData = {hash:""};
    const {
        txSol,
        wallet,
        sendAccount,
        kryptikProvider} = params;
     // create transaction parameters
     let kryptikTxParams:TransactionParameters = {
        transactionBuffer: txSol.serializeMessage()
      };
      let network = networkFromNetworkDb(kryptikProvider.networkDb)
      if(!kryptikProvider.solProvider){
        throw(new Error(`Error: Provider not set for ${network.fullName}`))
      }
      let solProvider = kryptikProvider.solProvider;
      // sign sol transaction
      const signature = await wallet.seedLoop.signTransaction(sendAccount, kryptikTxParams, network);
      // ensure signature was created
      if(!signature.solanaFamilyTx){
        throw(new Error(`Error: Unable to create signature for ${network.fullName} transaction`)); 
      }
      txSol.addSignature(new PublicKey(sendAccount), Buffer.from(signature.solanaFamilyTx));
      // verify signature
      if(!txSol.verifySignatures()){
        throw(new Error(`Error: Unable to verify signature for ${network.fullName} transaction`));
      }
      try{
        const txPostResult = await solProvider.sendRawTransaction(txSol.serialize());
        txDoneData.hash = txPostResult;
      } 
      catch(e:any){
        // add custom error message if rent issue
        if(e.message && typeof(e.message)=="string" && e.message.includes("rent")){
            let fromPubKey:PublicKey = new PublicKey(params.sendAccount);
            let accountInfo = await solProvider.getAccountInfo(fromPubKey);
            let dataLength:number = accountInfo?accountInfo.data.length:50;
            let minimumAmountSol:number = lamportsToSol(await solProvider.getMinimumBalanceForRentExemption(dataLength));
            let msg = `Unable to publish ${kryptikProvider.networkDb.fullName} transaction. Note: Your Solana Account must hold at least ${roundCryptoAmount(minimumAmountSol)} ${formatTicker(kryptikProvider.networkDb.ticker)} to pay 'rent' for space used on the blockchain.`;
            throw(new Error(msg));
        }
        throw(e);
      }
      // set tx. explorer path
      let txExplorerPath:string|null = getTransactionExplorerPath(kryptikProvider.networkDb, txDoneData);
      txDoneData.explorerPath = txExplorerPath? txExplorerPath:txDoneData.explorerPath;
      return txDoneData;
}


// creates, signs, and publishes transfer transaction to the blockchain
export const PublishSolTransferTx = async function(params:CreateTransferTransactionParameters){
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
      let txIn:SolTransactionParams = {
        sendAccount: fromAddress,
        toAddress: toAddress,
        valueSol: Number(amountCrypto),
        kryptikProvider: kryptikProvider,
        decimals: tokenAndNetwork.tokenData?tokenAndNetwork.tokenData.tokenDb.decimals:tokenAndNetwork.baseNetworkDb.decimals,
        networkDb: tokenAndNetwork.baseNetworkDb
      }
      let txSol:Transaction;
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
       // sign and publish tx.
      let sendParams:ISignAndSendSolParameters = {
        kryptikProvider: kryptikProvider,
        sendAccount: fromAddress,
        txSol: txSol,
        wallet: wallet,
      }
      try{
        txDoneData = await signAndSendSOLTransaction(sendParams)
      }
      catch(e:any){
        if(e.message){
            errorHandler(e.message, true)
        }
        else{
            errorHandler(`Unable to publish ${txIn.networkDb.fullName} transaction.`)
        }
        return null;
      }
      return txDoneData;
  }


  // tx: basic send of base sol coin
export const createSolTransaction = async function(txIn:SolTransactionParams):Promise<Transaction>{
    if(!txIn.kryptikProvider.solProvider) throw(new Error(`No provider set for ${txIn.networkDb.fullName}. Unable to create transaction.`));
    let fromPubKey:PublicKey = new PublicKey(txIn.sendAccount);
    let toPubKey:PublicKey = new PublicKey(txIn.toAddress);
    let transaction:Transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: fromPubKey,
          toPubkey: toPubKey,
          lamports: solToLamports(txIn.valueSol) //Remember 1 Lamport = 10^-9 SOL.
        }),
    );
    let lastBlockHash = await txIn.kryptikProvider.solProvider.getLatestBlockhash('finalized');
    transaction.recentBlockhash = lastBlockHash.blockhash;
    transaction.feePayer = fromPubKey;
    return transaction;
}

// tx: send token that lives on solana blockchain
export const createSolTokenTransaction = async function(txIn:SolTransactionParams){
    if(!txIn.kryptikProvider.solProvider) throw(new Error(`No provider set for ${txIn.networkDb.fullName}. Unable to create transaction.`));
    if(!txIn.tokenParamsSol) throw(new Error(`No token data provided for ${txIn.networkDb.fullName}. Unable to create transaction.`));
    let transaction:Transaction = new Transaction();
    // destination token account for transfer
    let toPubkey = createEd25519PubKey(txIn.toAddress);
    let toTokenAccount = await createSolTokenAccount(txIn.toAddress, txIn.tokenParamsSol.contractAddress);
    // from token account for transfer
    let fromPubKey:PublicKey = new PublicKey(txIn.sendAccount);
    let fromTokenAccount = await createSolTokenAccount(txIn.sendAccount, txIn.tokenParamsSol.contractAddress);
    let mintPubKey = createEd25519PubKey(txIn.tokenParamsSol.contractAddress);
    // test if to account already exists
    const toAccountInfo = await txIn.kryptikProvider.solProvider.getAccountInfo(toTokenAccount);
    console.log(toAccountInfo);
    if(!toAccountInfo){
        // create token account for to account if none
        console.log("Adding create account instruction");
        transaction.add(
            splToken.createAssociatedTokenAccountInstruction(fromPubKey, toTokenAccount , toPubkey, mintPubKey)
        );
    }
    let amountToken:number = multByDecimals(txIn.valueSol, txIn.decimals).asNumber;
    // UPDATE TO USE ACTUAL NUMBER OF DECIMALS
    transaction.add(
        splToken.createTransferInstruction(
          fromTokenAccount,
          toTokenAccount,
          fromPubKey,
          amountToken,
          [],
          TOKEN_PROGRAM_ID
        )
    );
    let lastBlockHash = await txIn.kryptikProvider.solProvider.getLatestBlockhash('finalized');
    transaction.recentBlockhash = lastBlockHash.blockhash;
    transaction.feePayer = fromPubKey;
    return transaction;
}