import {
    JsonRpcProvider,
} from '@ethersproject/providers';
import { BigNumber, utils } from "ethers";
import { INetworkFeeDataParams } from '.';
import { isNetworkArbitrum, networkFromNetworkDb } from "../../helpers/utils/networkUtils";
import { multByDecimals, roundToDecimals } from "../../helpers/utils/numberUtils";
import { NetworkDb, placeHolderEVMAddress } from "../../services/models/network";
import { KryptikProvider } from "../../services/models/provider";
import { TokenData } from '../../services/models/token';
import TransactionFeeData, { EVMGas } from "../../services/models/transaction";

export interface FeeDataEvmParameters extends INetworkFeeDataParams{
   amountToken: string;
   tokenData?:TokenData,
}

// estimate tx. fee for EIP 1559 compatible networks
export async function getSendTransactionFeeData1559Compatible(params:FeeDataEvmParameters):Promise<TransactionFeeData>{
        let kryptikProvider:KryptikProvider = params.kryptikProvider;
        
        // validate provider
        if(!kryptikProvider.ethProvider){
            throw(new Error(`No provider specified for ${kryptikProvider.network.fullName}`));
        }
        let ethNetworkProvider:JsonRpcProvider = kryptikProvider.ethProvider;
        let feeData = await ethNetworkProvider.getFeeData();

        // FIX ASAP
        // ARTIFICIALLY INFLATING ARBITRUM BASE GAS LIMIT, BECAUSE OG VALUE IS TOO SMALL
        let gasLimit:number = isNetworkArbitrum(params.networkDb)?500000:21000;
        if(params.tokenData && params.tokenData.tokenParamsEVM){
            let amount = roundToDecimals(Number(params.amountToken), params.tokenData.tokenDb.decimals);
            // get gaslimit for nonzero amount
            if(amount == 0) amount = 2;
            // get estimated gas limit for token transfer
            gasLimit = Number(await params.tokenData.tokenParamsEVM.tokenContractConnected.estimateGas.transfer(placeHolderEVMAddress, amount));
        }
        
        // validate fee data response
        if(!feeData.maxFeePerGas || !feeData.maxPriorityFeePerGas || !feeData.gasPrice){
            // arbitrum uses pre EIP-1559 fee structure
            if(isNetworkArbitrum(params.networkDb)){
                let baseGas = await ethNetworkProvider.getGasPrice();
                feeData.gasPrice = baseGas;
                feeData.maxFeePerGas = baseGas;
                feeData.maxPriorityFeePerGas = BigNumber.from(0);
            }
            else{
                throw(new Error(`No fee data returned for ${kryptikProvider.network.fullName}`));
            }
        }

        let EVMGasLimitsParams:IEVMGasLimitsParams = {
            gasLimit: gasLimit,
            gasPrice: feeData.gasPrice,
            maxFeePerGas: feeData.maxFeePerGas,
            maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
            networkDb: kryptikProvider.networkDb,
            tokenPriceUsd: params.tokenPriceUsd
        }

        // create new fee data object
        let transactionFeeData:TransactionFeeData = evmFeeDataFromLimits(EVMGasLimitsParams)
        return transactionFeeData;
}


export interface IEVMGasLimitsParams extends EVMGas{
    tokenPriceUsd:number
    networkDb:NetworkDb
}


// calculate u.i. fee data from network fee limits
export function evmFeeDataFromLimits(params:IEVMGasLimitsParams):TransactionFeeData{
    let {gasLimit, gasPrice, maxFeePerGas, maxPriorityFeePerGas, tokenPriceUsd, networkDb} = {...params}
    // calculate u.i. fees in token amount
    let gasPriceConverted:number = Number(utils.formatEther(gasPrice));
    let maxFeePerGasConverted:number = multByDecimals(Number(maxFeePerGas), networkDb.decimals).asNumber;
    let maxPriorityFeePerGasConverted:number = multByDecimals(Number(maxFeePerGas), networkDb.decimals).asNumber;
    let baseFeePerGasConverted:number = maxPriorityFeePerGasConverted*.3;

    let lowerBoundCrypto:number = Number(gasLimit)*(gasPriceConverted+baseFeePerGasConverted);
    let lowerBoundUSD:number = lowerBoundCrypto*params.tokenPriceUsd;
    let upperBoundCrypto:number = Number(gasLimit)**(maxFeePerGasConverted+maxPriorityFeePerGasConverted);
    let upperBoundUsd:number = upperBoundCrypto*tokenPriceUsd;
    let network = networkFromNetworkDb(networkDb);
    // create new fee data object
    let transactionFeeData:TransactionFeeData = {
        network: network,
        isFresh: true,
        lowerBoundCrypto: lowerBoundCrypto,
        lowerBoundUSD: lowerBoundUSD,
        upperBoundCrypto: upperBoundCrypto,
        upperBoundUSD: upperBoundUsd,
        EVMGas:{
            // add inputs in original wei amount
            gasLimit: gasLimit,
            gasPrice: gasPrice,
            maxFeePerGas: maxFeePerGas,
            maxPriorityFeePerGas: maxPriorityFeePerGas
        }
    }
    return transactionFeeData;
}