import { formatTicker } from "../../helpers/utils/networkUtils"
import { NetworkDb } from "./network"
import { TokenAndNetwork } from "./token"

export interface IBalance{
    fullName: string,
    ticker:string,
    iconPath:string,
    iconPathSecondary?:string,
    amountCrypto: string,
    amountUSD: string,
    baseNetworkTicker: string
}

export const buildEmptyBalance = function(network:NetworkDb):IBalance{
    return {
        fullName:network.fullName,
        ticker:formatTicker(network.ticker),
        iconPath:network.iconPath,
        amountCrypto:"0",
        amountUSD:"0",
        baseNetworkTicker:formatTicker(network.ticker)
    }
}