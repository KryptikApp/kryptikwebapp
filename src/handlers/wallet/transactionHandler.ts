import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { Contract } from "ethers";
import { networkFromNetworkDb, solToLamports } from "../../helpers/wallet/utils";
import { EVMTransaction, SolTransaction, TransactionRequest } from "../../services/models/transaction"
import { ChainData, ERC20Db } from "../../services/models/erc20";
import { NetworkDb } from "../../services/models/network";
import { JsonRpcProvider } from "@ethersproject/providers";
import { CreateEVMContractParameters } from "../../services/models/token";


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


export const getChainDataForNetwork = function(network:NetworkDb, erc20Data:ERC20Db):ChainData|null{
    let chainDataArray:ChainData[] = erc20Data.chainData;
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

