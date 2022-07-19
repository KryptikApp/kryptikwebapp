import { BigNumber, BigNumberish } from "ethers";
import { IBuildSwapParams } from ".";
import { IEVMSwapData } from "../../parsers/0xData";
import { TransactionRequest } from "../../services/models/transaction";
import { isSwapAvailable } from "./utils";


export interface IBuildEVMSwapParams extends IBuildSwapParams{
    swapData: IEVMSwapData
}

export async function BuildEVMSwap(params:IBuildEVMSwapParams):Promise<TransactionRequest|null>{
    const {sellTokenAndNetwork, buyTokenAndNetwork, swapData, fromAccount, kryptikProvider} = {...params};
    if(!kryptikProvider.ethProvider){
        throw(new Error(`Error: No EVM provider specified for: ${sellTokenAndNetwork.baseNetworkDb}`));
    };
    let evmProvider = kryptikProvider.ethProvider;
    let accountNonce = await evmProvider.getTransactionCount(fromAccount, "latest");
    let isValidSwap = isSwapAvailable(buyTokenAndNetwork.baseNetworkDb, sellTokenAndNetwork.baseNetworkDb);
    let evmFeeData = await evmProvider.getFeeData();
    // TODO: UPDATE NULL CASE TO BE DEFAULT FEE VALUE?
    let maxFeePerGas:BigNumberish = evmFeeData.maxFeePerGas?evmFeeData.maxFeePerGas:BigNumber.from(0);
    let maxPriorityFeePerGas:BigNumberish = evmFeeData.maxPriorityFeePerGas?evmFeeData.maxPriorityFeePerGas:BigNumber.from(0);
    if(!isValidSwap) return null;
    let tx:TransactionRequest = {
        from: fromAccount,
        to: swapData.to,
        value: swapData.value,
        nonce: accountNonce,
        data: swapData.data,
        gasLimit: swapData.gas,
        chainId: swapData.chainId,
        type:2,
        maxFeePerGas: maxFeePerGas,
        maxPriorityFeePerGas: maxPriorityFeePerGas,
    }
    return tx;
}