import { Keypair, PublicKey, SystemProgram, Transaction, TransactionInstruction } from "@solana/web3.js";
import { createEd25519PubKey, createSolTokenAccount, networkFromNetworkDb, roundToDecimals, solToLamports } from "../../helpers/wallet/utils";
import { EVMTransaction, SolTransaction, TransactionRequest } from "../../services/models/transaction"
import { NetworkDb } from "../../services/models/network";
import { ChainData, TokenDb } from "../../services/models/token";
import * as splToken from "@solana/spl-token"
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";


// tx: basic send of base sol coin
export const createSolTransaction = async function(txIn:SolTransaction):Promise<Transaction>{
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
export const createSolTokenTransaction = async function(txIn:SolTransaction){
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
    if(!toAccountInfo){
        // create token account for to account if none
        console.log("Adding create account instruction");
        transaction.add(
            splToken.createAssociatedTokenAccountInstruction(fromPubKey, toTokenAccount , toPubkey, mintPubKey)
        );
    }
    let amountlamparts = solToLamports(roundToDecimals(txIn.valueSol, 9));
    // UPDATE TO USE ACTUAL NUMBER OF DECIMALS
    transaction.add(
        splToken.createTransferInstruction(
          fromTokenAccount,
          toTokenAccount,
          fromPubKey,
          amountlamparts,
          [],
          TOKEN_PROGRAM_ID
        )
    );
    let lastBlockHash = await txIn.kryptikProvider.solProvider.getLatestBlockhash('finalized');
    transaction.recentBlockhash = lastBlockHash.blockhash;
    transaction.feePayer = fromPubKey;
    return transaction;
}

export const createEVMTransaction = async function(txIn:EVMTransaction):Promise<TransactionRequest>{
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


export const getChainDataForNetwork = function(network:NetworkDb, tokenData:TokenDb):ChainData|null{
    let chainDataArray:ChainData[] = tokenData.chainData;
    for(const chainInfo of chainDataArray){
        // each contract has a different address depending on the chain
        // we use the network chainId to extract the correct chaindata
        if(chainInfo.chainId == network.chainIdEVM){
            return chainInfo
        }
    }
    // we return null if there is no chain data specified for network
    return null;
}




