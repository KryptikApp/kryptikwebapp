import {
    JsonRpcProvider,
} from '@ethersproject/providers';
import { BigNumber, utils } from "ethers";
import { INetworkFeeDataParams } from '.';
import { isNetworkArbitrum, networkFromNetworkDb } from "../../helpers/utils/networkUtils";
import { roundToDecimals } from "../../helpers/utils/numberUtils";
import { placeHolderEVMAddress } from "../../services/models/network";
import { KryptikProvider } from "../../services/models/provider";
import { TokenData } from '../../services/models/token';
import TransactionFeeData from "../../services/models/transaction";

export interface FeeDataEvmParameters extends INetworkFeeDataParams{
   amountToken: string;
   tokenData?:TokenData,
}

// estimate tx. fee for EIP 1559 compatible networks
export async function getTransactionFeeData1559Compatible(params:FeeDataEvmParameters):Promise<TransactionFeeData>{
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
        // calculate fees in token amount
        let baseFeePerGas:number = Number(utils.formatEther(feeData.gasPrice));
        let maxFeePerGas:number = Number(utils.formatEther(feeData.maxFeePerGas));
        let maxTipPerGas:number = Number(utils.formatEther(feeData.maxPriorityFeePerGas));
        let baseTipPerGas:number = maxTipPerGas*.3;
        // amount hardcoded to gas required to transfer ether to someone else
        let lowerBoundCrypto:number = gasLimit*(baseFeePerGas+baseTipPerGas);
        let lowerBoundUSD:number = lowerBoundCrypto*params.tokenPriceUsd;
        let upperBoundCrypto:number = gasLimit*(maxFeePerGas+maxTipPerGas);
        let upperBoundUsd:number = upperBoundCrypto*params.tokenPriceUsd;
        // create new fee data object
        let transactionFeeData:TransactionFeeData = {
            network: kryptikProvider.network,
            isFresh: true,
            lowerBoundCrypto: lowerBoundCrypto,
            lowerBoundUSD: lowerBoundUSD,
            upperBoundCrypto: upperBoundCrypto,
            upperBoundUSD: upperBoundUsd,
            EVMGas:{
                // add inputs in original wei amount
                gasLimit: gasLimit,
                gasPrice: feeData.gasPrice,
                maxFeePerGas: feeData.maxFeePerGas,
                maxPriorityFeePerGas: feeData.maxPriorityFeePerGas 
            }
        }
        return transactionFeeData;
}