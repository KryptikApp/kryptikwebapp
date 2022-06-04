import { EVMTransaction, TransactionRequest } from "../../services/models/transaction"




export const createEVMTransaction = async function(txIn:EVMTransaction):Promise<TransactionRequest>{
    const {sendAccount, toAddress, value, gasLimit, maxFeePerGas, maxPriorityFeePerGas, kryptikProvider, networkDb} = txIn;
    if(!kryptikProvider.ethProvider){
        throw(new Error(`Error: No EVM provider specified for ${networkDb.fullName}`));
    };
    let ethProvider = kryptikProvider.ethProvider;
    let accountNonce = await ethProvider.getTransactionCount(sendAccount, "latest");
    const tx:TransactionRequest= {
        from: sendAccount,
        to: toAddress,
        value: value,
        nonce: accountNonce,
        gasLimit: gasLimit,
        maxFeePerGas: maxFeePerGas,
        maxPriorityFeePerGas: maxPriorityFeePerGas,
    }
    return tx;
}