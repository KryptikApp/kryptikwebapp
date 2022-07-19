import { KryptikProvider } from "../../services/models/provider";
import { TokenAndNetwork } from "../../services/models/token";
import { IBuildEVMSwapParams } from "./EVMSwap";
import { isSwapAvailable } from "./utils";

export interface IBuildSwapParams{
    sellTokenAndNetwork:TokenAndNetwork,
    buyTokenAndNetwork:TokenAndNetwork,
    fromAccount:string,
    kryptikProvider:KryptikProvider
}

export async function SwapToken(evmSwapParams?:IBuildEVMSwapParams){
    
}