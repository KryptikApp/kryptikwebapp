import { BigNumber, BigNumberish } from "ethers";
import { toUpper } from "lodash";
import { IBuildSwapParams } from ".";
import { formatTicker, isEVMTxTypeTwo, isNetworkArbitrum } from "../../helpers/utils/networkUtils";
import { multByDecimals } from "../../helpers/utils/numberUtils";
import { IKryptikTxParams, KryptikTransaction } from "../../models/transactions";
import { ISwapData } from "../../parsers/0xData";
import { fetch0xSwapOptions, zeroXParams } from "../../requests/swaps/0xSwaps";
import { TransactionRequest } from "../../services/models/transaction";
import { evmFeeDataFromLimits, IEVMGasLimitsParams } from "../fees/EVMFees";
import { isSwapAvailable } from "./utils";


export interface IBuildEVMSwapParams extends IBuildSwapParams{
  // empty for now
}

export async function BuildEVMSwapTransaction(params:IBuildEVMSwapParams):Promise<KryptikTransaction|null>{
    const {tokenAmount, sellTokenAndNetwork, buyTokenAndNetwork, fromAccount, kryptikProvider, sellNetworkTokenPriceUsd, baseCoinPrice} = {...params};
    // fetch 0x swap data
    let tokenDecimals:number = sellTokenAndNetwork.tokenData?sellTokenAndNetwork.tokenData.tokenDb.decimals:sellTokenAndNetwork.baseNetworkDb.decimals;
    let swapAmount = multByDecimals(tokenAmount, tokenDecimals);
    // use address for token and symbol for base network coin. Will return undefined if token and network selected address is undefined
    const sellTokenId:string|undefined = sellTokenAndNetwork.tokenData?sellTokenAndNetwork.tokenData.selectedAddress:formatTicker(sellTokenAndNetwork.baseNetworkDb.ticker);
    const buyTokenId:string|undefined = buyTokenAndNetwork.tokenData?buyTokenAndNetwork.tokenData.selectedAddress:formatTicker(buyTokenAndNetwork.baseNetworkDb.ticker);
    // ensure we have required params for 0x fetch
    if(!sellTokenId || !buyTokenId || !sellTokenAndNetwork.baseNetworkDb.evmData || !sellTokenAndNetwork.baseNetworkDb.evmData.zeroXSwapUrl) return null;
    // slippage currently set as default of 3%
    let slippagePercentage:number = .1
    let swapReqParams:zeroXParams = {baseUrl:sellTokenAndNetwork.baseNetworkDb.evmData.zeroXSwapUrl, buyTokenId:buyTokenId, sellTokenId:sellTokenId, sellAmount:swapAmount.asNumber, slippagePercentage:slippagePercentage, takerAddress:fromAccount}
    const swapData:ISwapData|null = await fetch0xSwapOptions(swapReqParams);
    // ensure swap data is present
    if(!swapData || !swapData.evmData) return null;
    if(!kryptikProvider.ethProvider){
        throw(new Error(`Error: No EVM provider specified for: ${sellTokenAndNetwork.baseNetworkDb}`));
    };
    let evmProvider = kryptikProvider.ethProvider;
    let accountNonce = await evmProvider.getTransactionCount(fromAccount, "latest");
    let isValidSwap = isSwapAvailable(buyTokenAndNetwork.baseNetworkDb, sellTokenAndNetwork.baseNetworkDb);
    if(!isValidSwap) return null;

    let feeData = await evmProvider.getFeeData();
    // TODO: UPDATE NULL CASE TO BE DEFAULT FEE VALUE?
    let maxFeePerGas:BigNumberish = feeData.maxFeePerGas?feeData.maxFeePerGas:BigNumber.from(0);
    let maxPriorityFeePerGas:BigNumberish = feeData.maxPriorityFeePerGas?feeData.maxPriorityFeePerGas:BigNumber.from(0);
    // validate fee data response
    
    if(!feeData.maxFeePerGas || !feeData.maxPriorityFeePerGas || !feeData.gasPrice){
        // some networks use pre EIP-1559 fee structure
        if(isEVMTxTypeTwo(sellTokenAndNetwork.baseNetworkDb)){
            let baseGas = await evmProvider.getGasPrice();
            feeData.gasPrice = baseGas;
            feeData.maxFeePerGas = baseGas;
            feeData.maxPriorityFeePerGas = BigNumber.from(0);
        }
        else{
            // throw(new Error(`No fee data returned for ${kryptikProvider.network.fullName}`));
            console.warn(`No fee data returned for ${kryptikProvider.network.fullName}`);
            return null;
        }
    }
    // add extra gas cushion to estimated gas required 
    let paddedGasLimit = Number(swapData.evmData.gas) + Number(swapData.evmData.gas)*.1
    let EVMGasLimitsParams:IEVMGasLimitsParams = {
        gasLimit: paddedGasLimit,
        gasPrice: feeData.gasPrice,
        maxFeePerGas: feeData.maxFeePerGas,
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
        networkDb: kryptikProvider.networkDb,
        tokenPriceUsd: baseCoinPrice
    }


    let kryptikFeeData = evmFeeDataFromLimits(EVMGasLimitsParams);
    
    let tx:TransactionRequest = {
        from: fromAccount,
        to: swapData.evmData.to,
        value: swapData.evmData.value,
        nonce: accountNonce,
        data: swapData.evmData.data,
        gasLimit: swapData.evmData.gas,
        chainId: swapData.chainId,
        type:2,
        maxFeePerGas: maxFeePerGas,
        maxPriorityFeePerGas: maxPriorityFeePerGas,
    }
    let kryptikTxParams:IKryptikTxParams = {
        feeData: kryptikFeeData,
        swapData: {
            ...swapData,
            sellTokenAndNetwork: sellTokenAndNetwork,
            buyTokenAndNetwork: buyTokenAndNetwork
        },
        kryptikTx:{
            evmTx:tx
        },
        tokenAndNetwork: sellTokenAndNetwork,
        //TODO: UPDATE TO ADD BASE NETWORK PRICE
        tokenPriceUsd: sellNetworkTokenPriceUsd,
    }
    let kryptikTx:KryptikTransaction = new KryptikTransaction(kryptikTxParams);
    return kryptikTx;
}
