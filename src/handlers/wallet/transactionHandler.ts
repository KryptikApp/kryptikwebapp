import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { solToLamports } from "../../helpers/wallet/utils";
import { EVMTransaction, SolTransaction, TransactionRequest } from "../../services/models/transaction"


export const createSolTransaction = async function(txIn:SolTransaction):Promise<Transaction>{
    if(!txIn.kryptikProvider.solProvider) throw(new Error(`No provider set for ${txIn.networkDb.fullName}. Unable to create transaction.`))
    let lastBlockHash = await txIn.kryptikProvider.solProvider.getLatestBlockhash('finalized');
    let fromPubKey:PublicKey = new PublicKey(txIn.sendAccount);
    let toPubKey:PublicKey = new PublicKey(txIn.toAddress);
    var transaction:Transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: fromPubKey,
          toPubkey: toPubKey,
          lamports: solToLamports(txIn.valueSol) //Remember 1 Lamport = 10^-9 SOL.
        }),
    );
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
    const tx:TransactionRequest= {
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
    return tx;
}