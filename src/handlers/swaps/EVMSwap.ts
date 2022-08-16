import { BigNumber, BigNumberish, Contract } from "ethers";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import { IBuildSwapParams } from ".";
import { erc20Abi } from "../../abis/erc20Abi";
import { getPriceOfTicker } from "../../helpers/coinGeckoHelper";
import { formatTicker, isEVMTxTypeTwo } from "../../helpers/utils/networkUtils";
import { multByDecimals, roundToDecimals } from "../../helpers/utils/numberUtils";
import { IKryptikTxParams, KryptikTransaction } from "../../models/transactions";
import { ISwapData } from "../../parsers/0xData";
import { fetch0xSwapOptions, zeroXParams } from "../../requests/swaps/0xSwaps";
import { KryptikProvider } from "../../services/models/provider";
import { TokenAndNetwork } from "../../services/models/token";
import TransactionFeeData, { TransactionRequest, TxType } from "../../services/models/transaction";
import { getTransactionFeeDataEVM } from "../fees/EVMFees";
import { isSwapAvailable } from "./utils";


export interface IBuildEVMSwapParams extends IBuildSwapParams{
  // empty for now
}

/**
 * Builds a token allowance EVM transaction
 * @param sellTokenAndNetwork token and network 
 * @param sendAccount wallet address of person initiating approval
 * @param allowanceTarget address to approve
 * @param maxApproval token denominated amount (NOT in Wei) to approve
 * @param tokenPrice optional price base network coin. Used for fee estimate.
 * @returns signable kryptik tx
*/

export async function BuildEVMTokenApproval(sellTokenAndNetwork:TokenAndNetwork, kryptikProvider:KryptikProvider, 
    sendAccount:string, allowanceTarget:string, maxApproval:number, 
    tokenPrice?:number):Promise<KryptikTransaction|null>{
    // no need to approve base network coin sell- not part of ERC20 token standard
    if(!sellTokenAndNetwork.tokenData) return null;
    // TODO: THROW ERROR IF NO EVM DATA PROVIDED?
    if(!sellTokenAndNetwork.baseNetworkDb.evmData){
        return null;
    }
    if(!kryptikProvider.ethProvider){
        throw(new Error(`Error: No EVM provider specified for: ${sellTokenAndNetwork.baseNetworkDb}`));
    };
    // get basic tx metadata
    let evmProvider = kryptikProvider.ethProvider;
    let accountNonce = await evmProvider.getTransactionCount(sendAccount, "latest");
    let chainIdEVM = sellTokenAndNetwork.baseNetworkDb.evmData.chainId;
    let contractAddress = sellTokenAndNetwork.tokenData.selectedAddress;
    // ensure address is selected
    if(!contractAddress) return null;
    let tokenDecimals:number = sellTokenAndNetwork.tokenData.tokenDb.decimals;
    let roundedAmountCrypto = roundToDecimals(maxApproval, tokenDecimals);
    // amount in smallest token units
    let approvalAmount:BigNumber = parseUnits(roundedAmountCrypto.toString(), tokenDecimals);
    // build contract
    let erc20Contract = new Contract(contractAddress, erc20Abi);
    if(!erc20Contract){
            return null;
    }
    erc20Contract = erc20Contract.connect(evmProvider);
    // check if approve amount > new max approve amount
    let allowanceAmount = Number(formatUnits(await erc20Contract.allowance(sendAccount, allowanceTarget), tokenDecimals));
    // if we already have a high enough allowance... no need to create token approval tx
    if(allowanceAmount>maxApproval){
        console.log(`Current ${sellTokenAndNetwork.tokenData.tokenDb.name} token allowance is enough. No need for allowance approval transaction.`);
        return null;
    }
    let tx:TransactionRequest = await erc20Contract.populateTransaction.approve(allowanceTarget, approvalAmount);
    tx.from = sendAccount;
    tx.chainId = chainIdEVM;
    tx.nonce = accountNonce;
    let tokenPriceUsd:number;
    // set token price for fee data calculation
    if(tokenPrice){
        tokenPriceUsd = tokenPrice;
    }
    else{
        let coingeckoId:string = sellTokenAndNetwork.baseNetworkDb.coingeckoId;
        tokenPriceUsd = await getPriceOfTicker(coingeckoId);
    }
    let kryptikFeeData:TransactionFeeData = await getTransactionFeeDataEVM({tx:tx, kryptikProvider:kryptikProvider, tokenPriceUsd:tokenPriceUsd, networkDb:sellTokenAndNetwork.baseNetworkDb});

    // build kryptik transaction 
    let kryptikTxParams:IKryptikTxParams = {
        feeData: kryptikFeeData,
        kryptikTx:{
            evmTx:tx
        },
        txType: TxType.Approval,
        tokenAndNetwork: sellTokenAndNetwork,
        tokenPriceUsd: tokenPriceUsd,
    }
    tx.gasLimit = Number(kryptikFeeData.EVMGas.gasLimit) + Number(kryptikFeeData.EVMGas.gasLimit)*.05
    if(isEVMTxTypeTwo(sellTokenAndNetwork.baseNetworkDb)){
        tx.type = 2;
        tx.maxPriorityFeePerGas = kryptikFeeData.EVMGas.maxPriorityFeePerGas;
        tx.maxFeePerGas = kryptikFeeData.EVMGas.maxFeePerGas;
    }
    else{
        tx.gasPrice = kryptikFeeData.EVMGas.gasPrice;
    }
    let kryptikTx:KryptikTransaction = new KryptikTransaction(kryptikTxParams);
    return kryptikTx;
}

export async function BuildEVMSwapTransaction(params:IBuildEVMSwapParams):Promise<KryptikTransaction|null>{
    const {tokenAmount, sellTokenAndNetwork, buyTokenAndNetwork, fromAccount, kryptikProvider, sellNetworkTokenPriceUsd, baseCoinPrice, slippage} = {...params};
    // fetch 0x swap data
    let tokenDecimals:number = sellTokenAndNetwork.tokenData?sellTokenAndNetwork.tokenData.tokenDb.decimals:sellTokenAndNetwork.baseNetworkDb.decimals;
    let swapAmount = multByDecimals(tokenAmount, tokenDecimals);
    // use address for token and symbol for base network coin. Will return undefined if token and network selected address is undefined
    const sellTokenId:string|undefined = sellTokenAndNetwork.tokenData?sellTokenAndNetwork.tokenData.selectedAddress:formatTicker(sellTokenAndNetwork.baseNetworkDb.ticker);
    const buyTokenId:string|undefined = buyTokenAndNetwork.tokenData?buyTokenAndNetwork.tokenData.selectedAddress:formatTicker(buyTokenAndNetwork.baseNetworkDb.ticker);
    // ensure we have required params for 0x fetch
    if(!sellTokenId || !buyTokenId || !sellTokenAndNetwork.baseNetworkDb.evmData || !sellTokenAndNetwork.baseNetworkDb.evmData.zeroXSwapUrl) return null;
    // slippage currently set as default of 3%
    let slippagePercentage:number = slippage?slippage:.03;
    let swapReqParams:zeroXParams = {baseUrl:sellTokenAndNetwork.baseNetworkDb.evmData.zeroXSwapUrl, buyTokenId:buyTokenId, sellTokenId:sellTokenId, sellAmount:swapAmount.asNumber, slippagePercentage:slippagePercentage}
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
    
    let tx:TransactionRequest = {
        from: fromAccount,
            to: swapData.evmData.to,
            value: swapData.evmData.value,
            nonce: accountNonce,
            data: swapData.evmData.data,
            chainId: swapData.chainId,
    }
    let kryptikFeeData:TransactionFeeData = await getTransactionFeeDataEVM({tx:tx, kryptikProvider:kryptikProvider, tokenPriceUsd:baseCoinPrice, networkDb:sellTokenAndNetwork.baseNetworkDb});
    let paddedGasLimit = Number(kryptikFeeData.EVMGas.gasLimit) + Math.ceil(Number(kryptikFeeData.EVMGas.gasLimit)*.025)
    tx.gasLimit =  paddedGasLimit;
    if(isEVMTxTypeTwo(sellTokenAndNetwork.baseNetworkDb)){
        tx.maxFeePerGas = kryptikFeeData.EVMGas.maxFeePerGas;
        tx.maxPriorityFeePerGas = kryptikFeeData.EVMGas.maxPriorityFeePerGas;
        tx.type = 2;
    }
    else{
        tx.gasPrice = kryptikFeeData.EVMGas.gasPrice;
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
        txType: TxType.Swap,
        tokenAndNetwork: sellTokenAndNetwork,
        //TODO: UPDATE TO ADD BASE NETWORK PRICE
        tokenPriceUsd: sellNetworkTokenPriceUsd,
    }
    let kryptikTx:KryptikTransaction = new KryptikTransaction(kryptikTxParams);
    return kryptikTx;
}
