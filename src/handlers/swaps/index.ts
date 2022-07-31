import { Network, NetworkFamily } from "hdseedloop";
import { networkFromNetworkDb } from "../../helpers/utils/networkUtils";
import { KryptikTransaction } from "../../models/transactions";
import { KryptikProvider } from "../../services/models/provider";
import { TokenAndNetwork } from "../../services/models/token";
import { BuildEVMSwapTransaction, IBuildEVMSwapParams } from "./EVMSwap";
import { isSwapAvailable } from "./utils";

export interface IBuildSwapParams{
    sellTokenAndNetwork:TokenAndNetwork,
    buyTokenAndNetwork:TokenAndNetwork,
    tokenAmount:number,
    // price of the sell base network token
    sellNetworkTokenPriceUsd:number,
    fromAccount:string,
    kryptikProvider:KryptikProvider
}

export async function BuildSwapTokenTransaction(swapParams:IBuildSwapParams):Promise<KryptikTransaction|null>{
    const{sellTokenAndNetwork, buyTokenAndNetwork, sellNetworkTokenPriceUsd, fromAccount, kryptikProvider} = {...swapParams}
    const sellBaseNetwork:Network = networkFromNetworkDb(sellTokenAndNetwork.baseNetworkDb);
    const buyBaseNetwork:Network = networkFromNetworkDb(buyTokenAndNetwork.baseNetworkDb);
    if(!isSwapAvailable(buyTokenAndNetwork.baseNetworkDb, sellTokenAndNetwork.baseNetworkDb)){
        return null;
    }
    if(buyBaseNetwork.networkFamily == NetworkFamily.EVM && sellBaseNetwork.networkFamily == NetworkFamily.EVM){
        let kryptikEVMTx:KryptikTransaction|null = await BuildEVMSwapTransaction(swapParams);
        return kryptikEVMTx;
    }
    return null;
}