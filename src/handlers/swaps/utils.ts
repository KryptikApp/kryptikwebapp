import { Network, NetworkFamily } from "hdseedloop";
import { networkFromNetworkDb } from "../../helpers/utils/networkUtils";
import { NetworkDb } from "../../services/models/network";

export function isSwapAvailable(buyTokenNetworkDb:NetworkDb, sellTokenNetworkDb:NetworkDb):boolean{
    const buyTokenNetwork:Network = networkFromNetworkDb(buyTokenNetworkDb);
    const sellTokenNetwork:Network = networkFromNetworkDb(sellTokenNetworkDb);
    // TODO: UPDATE TO SUPPORT NONEVM + CROSSCHAIN SWAPS
    if(buyTokenNetwork.networkFamily == NetworkFamily.EVM && sellTokenNetwork.networkFamily == NetworkFamily.EVM)
    {
        return true;
    }
    return false;
}