import { Network, NetworkFamily } from "hdseedloop";
import { networkFromNetworkDb } from "../../helpers/utils/networkUtils";
import { KryptikTransaction } from "../../models/transactions";
import { KryptikProvider } from "../../services/models/provider";
import { TokenAndNetwork } from "../../services/models/token";
import { BuildHopBridgeTransaction } from "./bridges/hop/hopBridge";
import { BuildEVMSwapTransaction } from "./EVMSwap";
import { BuildSolSwapTransaction } from "./SolanaSwap";
import { isSwapAvailable, isValidHopBridge } from "./utils";

export interface IBuildSwapParams{
    // price of the underlying network coin
    baseCoinPrice:number
    sellTokenAndNetwork:TokenAndNetwork,
    buyTokenAndNetwork:TokenAndNetwork,
    tokenAmount:number,
    // price of the sell base network token
    sellNetworkTokenPriceUsd:number,
    fromAccount:string,
    kryptikProvider:KryptikProvider,
    slippage?:number
}

export async function BuildSwapTokenTransaction(swapParams:IBuildSwapParams):Promise<KryptikTransaction|null>{
    const{sellTokenAndNetwork, buyTokenAndNetwork, sellNetworkTokenPriceUsd, fromAccount, kryptikProvider} = {...swapParams}
    const sellBaseNetwork:Network = networkFromNetworkDb(sellTokenAndNetwork.baseNetworkDb);
    const buyBaseNetwork:Network = networkFromNetworkDb(buyTokenAndNetwork.baseNetworkDb);
    if(!isSwapAvailable(buyTokenAndNetwork, sellTokenAndNetwork)){
        return null;
    }
    // make sure we route same network swaps to 0x
    if(isValidHopBridge(buyTokenAndNetwork, sellTokenAndNetwork)){
        console.log("Routing swap to hop bridge builder")
        let kryptikBridgeTx:KryptikTransaction|null = await BuildHopBridgeTransaction(swapParams);
        return kryptikBridgeTx;
    }
    if(buyBaseNetwork.networkFamily == NetworkFamily.EVM && sellBaseNetwork.networkFamily == NetworkFamily.EVM){
        console.log("Routing swap to 0x swap builder")
        let kryptikEVMTx:KryptikTransaction|null = await BuildEVMSwapTransaction(swapParams);
        return kryptikEVMTx;
    }
    if(buyBaseNetwork.networkFamily == NetworkFamily.Solana && sellBaseNetwork.networkFamily == NetworkFamily.Solana){
        console.log("Routing swap to Solana swap builder")
        let kryptikSolTx:KryptikTransaction|null = await BuildSolSwapTransaction(swapParams);
        return kryptikSolTx;
    }
    return null;
}