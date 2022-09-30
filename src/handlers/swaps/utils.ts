//@ts-ignore

import { Network, NetworkFamily } from "hdseedloop";
import { RiContactsBookLine } from "react-icons/ri";
import { isLayerTwo, networkFromNetworkDb } from "../../helpers/utils/networkUtils";
import { TokenAndNetwork, tokenAndNetworksAreEqual } from "../../services/models/token";

export function isSwapAvailable(buyTokenAndNetwork:TokenAndNetwork, sellTokenAndNetwork:TokenAndNetwork):boolean{
    const buyTokenNetworkDb = buyTokenAndNetwork.baseNetworkDb;
    const sellTokenNetworkDb = sellTokenAndNetwork.baseNetworkDb;
    const buyTokenNetwork:Network = networkFromNetworkDb(buyTokenNetworkDb);
    const sellTokenNetwork:Network = networkFromNetworkDb(sellTokenNetworkDb);
    // don't allow swap of same asset
    if(tokenAndNetworksAreEqual(buyTokenAndNetwork, sellTokenAndNetwork)) return false;
    // TODO: UPDATE TO SUPPORT NONEVM + CROSSCHAIN SWAPS
    if(buyTokenNetwork.networkFamily == NetworkFamily.EVM && sellTokenNetwork.networkFamily == NetworkFamily.EVM 
        // ensure same chain to and from
        && buyTokenNetwork.fullName.toLowerCase() == sellTokenNetwork.fullName.toLowerCase())
    {
        return true;
    }
    // HOP Protocol supported swaps
    if(isValidHopBridge(buyTokenAndNetwork, sellTokenAndNetwork)){
        return true;
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
    const isValidBuyAsset:boolean = isValidHopBridgeAsset(buyTokenAndNetwork);
    const isValidSellAsset:boolean = isValidHopBridgeAsset(sellTokenAndNetwork);
    // only L1 (ethereum) -> l2 bridge supported at the moment
    const isDestinationLayerTwo:boolean = isLayerTwo(buyTokenAndNetwork.baseNetworkDb)
    const isValidNetworkPair = sellTokenAndNetwork.baseNetworkDb.fullName.toLowerCase().trim() == "ethereum" && isDestinationLayerTwo;
    // test for same token
    const isSameAsset:boolean = tokenAndNetworksAreEqual(buyTokenAndNetwork, sellTokenAndNetwork, false);
    // last condition ensures token assets are the same when bridging tokens
    return isValidNetworkPair && isValidBuyAsset && isValidSellAsset && ((!sellTokenAndNetwork.tokenData && !buyTokenAndNetwork.tokenData)|| isSameAsset);
    // TODO: UNCOMMENT BELOW WHEN WE HAVE FULL HOP BRIDGE RANGE
    // const buyTokenNetworkDb = buyTokenAndNetwork.baseNetworkDb;
    // const sellTokenNetworkDb = sellTokenAndNetwork.baseNetworkDb;
    // const isValidNetworkPair = (buyTokenNetworkDb.ticker == "eth" && sellTokenNetworkDb.ticker == "eth(optimism)") || 
    // (buyTokenNetworkDb.ticker == "eth(optimism)" && sellTokenNetworkDb.ticker == "eth") || 
    // // arbitrum-eth
    // (buyTokenNetworkDb.ticker == "eth" && sellTokenNetworkDb.ticker == "eth(arbitrum)") ||
    // (buyTokenNetworkDb.ticker == "eth(arbitrum)" && sellTokenNetworkDb.ticker == "eth") ||
    // // polygon-eth
    // (buyTokenNetworkDb.ticker == "eth" && sellTokenNetworkDb.ticker == "matic") ||
    // (buyTokenNetworkDb.ticker == "matic" && sellTokenNetworkDb.ticker == "eth")||
    // // polygon-optimism
    // (buyTokenNetworkDb.ticker == "eth(optimism)" && sellTokenNetworkDb.ticker == "matic") ||
    // (buyTokenNetworkDb.ticker == "matic" && sellTokenNetworkDb.ticker == "eth(optimism)") ||
    // // polygon-arbitrum
    // (buyTokenNetworkDb.ticker == "eth(arbitrum)" && sellTokenNetworkDb.ticker == "matic") ||
    // (buyTokenNetworkDb.ticker == "matic" && sellTokenNetworkDb.ticker == "eth(arbitrum)") ||
    // // optimsim-arbitrum
    // (buyTokenNetworkDb.ticker == "eth(optimism)" && sellTokenNetworkDb.ticker == "eth(arbitrum)") ||
    // (buyTokenNetworkDb.ticker == "eth(arbitrum)" && sellTokenNetworkDb.ticker == "eth(optimism)")
}

export function isValidHopBridgeAsset(tokenAndNetwork:TokenAndNetwork){
    const tokenNetwork:Network = networkFromNetworkDb(tokenAndNetwork.baseNetworkDb);
    // base evm asset is ok... assuming network itself is valid
    if(!tokenAndNetwork.tokenData && tokenNetwork.networkFamily == NetworkFamily.EVM){
        return true;
    }
    // no token data and not part of the evm family
    if(!tokenAndNetwork.tokenData) return false;
    const tokenName = tokenAndNetwork.tokenData.tokenDb.symbol.toLowerCase().trim();
    // valid tokens are usdc, tether, and dai
    if(tokenName == "usdc" 
    || tokenName == "usdt" 
    || tokenName == "dai"){
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
        return isSwapAvailable(toToken, this.fromTokenAndNetwork);
    }
}