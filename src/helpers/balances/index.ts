import { SOL_COVALENT_CHAINID } from "../../constants/solConstants";
import { CovalentBalance} from "../../requests/covalent";
import { IBalance } from "../../services/models/IBalance"
import { NetworkDb } from "../../services/models/network"
import { TokenAndNetwork } from "../../services/models/token";
import { formatTicker } from "../utils/networkUtils";
import { divByDecimals, IBigNumber } from "../utils/numberUtils";

// covalent supported chain ids in order:
// ethereum, polygon, arbitrum, avalanche, solana
export const covalentSupportedChainIds:number[] = [1, 137, 42161, 43114, SOL_COVALENT_CHAINID];

export const isCovalentSupportedChain = function(chainId:number){
    return covalentSupportedChainIds.includes(chainId);
}


// transforms covalent response into Kryptik IBalance object
export const covalentDataToBalance = function(networkDb:NetworkDb, covalentBal:CovalentBalance):IBalance{
    // account for custom layer two network balances
    let ticker:string = covalentBal.contract_ticker_symbol.toLowerCase()=="eth"?networkDb.ticker:formatTicker(covalentBal.contract_ticker_symbol);
    let fullName:string = covalentBal.contract_name;
    let iconPath:string = covalentBal.logo_url;
    let amountCrypto:IBigNumber = divByDecimals(Number(covalentBal.balance), covalentBal.contract_decimals);
    let amountUsd:string = covalentBal.quote.toString();
    let balance:IBalance = {
        ticker: ticker,
        fullName: fullName,
        iconPath: iconPath,
        amountUSD: amountUsd,
        amountCrypto: amountCrypto.asString,
        baseNetworkTicker:networkDb.ticker,
    }
    return balance;
}

    /** Returns fiat sum of token/balance array.*/
export const sumFiatBalances = function(tokenAndBalances:TokenAndNetwork[]):number{
        let totalBalance = 0;
        for(const tokenAndBal of tokenAndBalances){
            let newBalToAdd:number = 0;
            if(tokenAndBal.tokenData && tokenAndBal.tokenData.tokenBalance){
                newBalToAdd = Number(tokenAndBal.tokenData.tokenBalance.amountUSD);
            }
            else{
                if(tokenAndBal.networkBalance){
                    newBalToAdd = Number(tokenAndBal.networkBalance.amountUSD);
                }
            }
            totalBalance = totalBalance + newBalToAdd;
        }
        return totalBalance;
}


