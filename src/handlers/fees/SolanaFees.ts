import { Connection, Transaction } from "@solana/web3.js";
import { INetworkFeeDataParams } from ".";
import { lamportsToSol } from "../../helpers/utils/numberUtils";
import { NetworkDb } from "../../services/models/network";
import { KryptikProvider } from "../../services/models/provider";
import TransactionFeeData, {defaultEVMGas, defaultTransactionFeeData} from "../../services/models/transaction";


export interface IFeeDataSolParams extends INetworkFeeDataParams{
    transaction:Transaction,
}

// fetch tx. fee on the solana blockchain
export async function getTransactionFeeDataSolana(params:IFeeDataSolParams):Promise<TransactionFeeData>{
        let kryptikProvider:KryptikProvider = params.kryptikProvider;
        // validate provider
        if(!kryptikProvider.solProvider){
            throw(new Error(`Error: No provider specified for ${kryptikProvider.network.fullName}`));
        }
        let solNetworkProvider:Connection = kryptikProvider.solProvider;
        const feeData = await solNetworkProvider.getFeeForMessage(
            params.transaction.compileMessage(),
            'confirmed',
        );
        let feeInSol:number = lamportsToSol(feeData.value);
        let feeInUsd:number = params.tokenPriceUsd*feeInSol;
        let transactionFeeData:TransactionFeeData = {
            network: kryptikProvider.network,
            isFresh: true,
            lowerBoundCrypto: feeInSol,
            lowerBoundUSD: feeInUsd,
            upperBoundCrypto: feeInSol,
            upperBoundUSD: feeInUsd,
            EVMGas: defaultEVMGas
        };
        return transactionFeeData;
}

// combines multiple fee objects...useful when pushing arrays of transactions
export function AggregateSolFees(txFees:TransactionFeeData[]){
    let network = txFees[0].network;
    let masterFee:TransactionFeeData = {
        network:network,
        lowerBoundCrypto:0,
        upperBoundCrypto:0,
        lowerBoundUSD:0,
        upperBoundUSD:0,
        isFresh:true,
        EVMGas:defaultEVMGas
    }
    for(const txFee of txFees){
        // ensure we're batching fee data for the same network!
        if(txFee.network!=network) return defaultTransactionFeeData;
        masterFee.lowerBoundCrypto = masterFee.lowerBoundCrypto + txFee.lowerBoundCrypto;
        masterFee.upperBoundCrypto = masterFee.upperBoundCrypto + txFee.upperBoundCrypto;
        masterFee.lowerBoundUSD = masterFee.lowerBoundUSD + txFee.lowerBoundUSD;
        masterFee.upperBoundUSD = masterFee.upperBoundUSD + txFee.upperBoundUSD;
    }
    return masterFee;
}