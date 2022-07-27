import { Near } from "near-api-js";
import { BlockResult } from "near-api-js/lib/providers/provider";
import { INetworkFeeDataParams } from ".";
import { multByDecimals, divByDecimals } from "../../helpers/utils/numberUtils";
import { KryptikProvider } from "../../services/models/provider";
import TransactionFeeData, { TxType, defaultEVMGas } from "../../services/models/transaction";


export interface FeeDataNearParameters extends INetworkFeeDataParams{
    txType:TxType
}

export async function getTransactionFeeDataNear(params:FeeDataNearParameters){
    let kryptikProvider:KryptikProvider = params.kryptikProvider;
    // validate provider
    if(!kryptikProvider.nearProvider){
        throw(new Error(`Error: No provider specified for ${kryptikProvider.network.fullName}`));
    }
    let nearProvider:Near = kryptikProvider.nearProvider;
    let block:BlockResult = await nearProvider.connection.provider.block({ finality: 'final' });
    // NEAR gas is calculated in TGAS
    // 1 TGAS = 10^12
    let gasUsed:number = multByDecimals(1, 12).asNumber
    // hardcoded gas amounts are based on protocol paramters
    // more info. on NEAR gas here: https://docs.near.org/docs/concepts/gas#thinking-in-gas
    switch(params.txType){
        case(TxType.TransferNative):{
            gasUsed = 1*gasUsed;
            break;
        }
        case(TxType.TransferToken):{
            gasUsed = 14*gasUsed;
            break;
        }
        default:{
            // UPDATE DEFAULT... should it be avg. gas required?
            gasUsed = 10*gasUsed;
            break;
        }
    }
    // fetch latest gas price
    let gasPrice:number = Number((await nearProvider.connection.provider.gasPrice(block.header.hash)).gas_price);
    console.log(gasPrice);
    // convert gas to near amount
    let feeInNear:number = divByDecimals((Number(gasPrice)*gasUsed), params.networkDb.decimals).asNumber; 
    let feeInUsd:number = params.tokenPriceUsd*feeInNear;
    let transactionFeeData:TransactionFeeData = {
        network: kryptikProvider.network,
        isFresh: true,
        lowerBoundCrypto: feeInNear,
        lowerBoundUSD: feeInUsd,
        upperBoundCrypto: feeInNear,
        upperBoundUSD: feeInUsd,
        EVMGas: defaultEVMGas
    };
    return transactionFeeData;
}
