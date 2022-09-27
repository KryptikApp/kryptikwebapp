//@ts-ignore

import { Network, NetworkFamily } from "hdseedloop";
import { networkFromNetworkDb } from "../../helpers/utils/networkUtils";
import { NetworkDb } from "../../services/models/network";
import { TokenAndNetwork } from "../../services/models/token";

export function isSwapAvailable(buyTokenAndNetwork:TokenAndNetwork, sellTokenAndNetwork:TokenAndNetwork):boolean{
    const buyTokenNetworkDb = buyTokenAndNetwork.baseNetworkDb;
    const sellTokenNetworkDb = sellTokenAndNetwork.baseNetworkDb;

    const buyTokenNetwork:Network = networkFromNetworkDb(buyTokenNetworkDb);
    const sellTokenNetwork:Network = networkFromNetworkDb(sellTokenNetworkDb);
    // TODO: UPDATE TO SUPPORT NONEVM + CROSSCHAIN SWAPS
    if(buyTokenNetwork.networkFamily == NetworkFamily.EVM && sellTokenNetwork.networkFamily == NetworkFamily.EVM 
        // ensure same chain to and from
        && buyTokenNetwork.fullName.toLowerCase() == sellTokenNetwork.fullName.toLowerCase())
    {
        return true;
    }
    // HOP Protocol supported swaps
    if(isValidHopBridge(buyTokenAndNetwork, sellTokenAndNetwork)){
        return true
    }
    // approve solana swaps
    // TODO: UPDATE TO APPROVE TESTNETS WHEN SUPPORTED
    if(buyTokenNetwork.networkFamily == NetworkFamily.Solana && sellTokenNetwork.networkFamily == NetworkFamily.Solana
         // ensure same chain to and from
         && buyTokenNetwork.fullName.toLowerCase() == sellTokenNetwork.fullName.toLowerCase()
         // ensure not a testnet
         && !buyTokenNetworkDb.isTestnet && !sellTokenNetworkDb.isTestnet){
        return true
    }
    return false;
}

export function isValidHopBridge(buyTokenAndNetwork:TokenAndNetwork, sellTokenAndNetwork:TokenAndNetwork):boolean{
    const buyTokenNetworkDb = buyTokenAndNetwork.baseNetworkDb;
    const sellTokenNetworkDb = sellTokenAndNetwork.baseNetworkDb;

    const isValidNetworkPair = (buyTokenNetworkDb.ticker == "eth" && sellTokenNetworkDb.ticker == "eth(optimism)") || 
    (buyTokenNetworkDb.ticker == "eth(optimism)" && sellTokenNetworkDb.ticker == "eth") || 
    // arbitrum-eth
    (buyTokenNetworkDb.ticker == "eth" && sellTokenNetworkDb.ticker == "eth(arbitrum)") ||
    (buyTokenNetworkDb.ticker == "eth(arbitrum)" && sellTokenNetworkDb.ticker == "eth") ||
    // polygon-eth
    (buyTokenNetworkDb.ticker == "eth" && sellTokenNetworkDb.ticker == "matic") ||
    (buyTokenNetworkDb.ticker == "matic" && sellTokenNetworkDb.ticker == "eth")||
    // polygon-optimism
    (buyTokenNetworkDb.ticker == "eth(optimism)" && sellTokenNetworkDb.ticker == "matic") ||
    (buyTokenNetworkDb.ticker == "matic" && sellTokenNetworkDb.ticker == "eth(optimism)") ||
    // polygon-arbitrum
    (buyTokenNetworkDb.ticker == "eth(arbitrum)" && sellTokenNetworkDb.ticker == "matic") ||
    (buyTokenNetworkDb.ticker == "matic" && sellTokenNetworkDb.ticker == "eth(arbitrum)") ||
    // optimsim-arbitrum
    (buyTokenNetworkDb.ticker == "eth(optimism)" && sellTokenNetworkDb.ticker == "eth(arbitrum)") ||
    (buyTokenNetworkDb.ticker == "eth(arbitrum)" && sellTokenNetworkDb.ticker == "eth(optimism)")

    const isValidBuyAsset:boolean = isValidHopBridgeAsset(buyTokenAndNetwork);
    const isValidSellAsset:boolean = isValidHopBridgeAsset(buyTokenAndNetwork);

    return isValidNetworkPair && isValidBuyAsset && isValidSellAsset;
}

export function isValidHopBridgeAsset(tokenAndNetwork:TokenAndNetwork){
    const tokenNetwork:Network = networkFromNetworkDb(tokenAndNetwork.baseNetworkDb);
    // base evm asset is ok... assuming network itself is valid
    if(!tokenAndNetwork.tokenData && tokenNetwork.networkFamily == NetworkFamily.EVM){
        return true;
    }
    // valid tokens are usdc, tether, and dai
    if(tokenAndNetwork.tokenData && (tokenAndNetwork.tokenData.tokenDb.symbol.toLowerCase() == "usdc" 
    || tokenAndNetwork.tokenData.tokenDb.symbol.toLowerCase() == "usdt" 
    || tokenAndNetwork.tokenData.tokenDb.symbol.toLowerCase() == "dai")){
        return true;
    }
    // if we got here... asset is not valid
    return false;
}

// validator class for swaps
export class SwapValidator{
    fromTokenAndNetwork:TokenAndNetwork
    constructor(fromTokenANdNetwork:TokenAndNetwork) {
        this.fromTokenAndNetwork = fromTokenANdNetwork
    }
    isValidSwapPair(toToken:TokenAndNetwork){
        return isSwapAvailable(this.fromTokenAndNetwork, toToken);
    }
}