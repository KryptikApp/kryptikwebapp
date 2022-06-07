import { Network, NetworkFamily, NetworkFamilyFromFamilyName, NetworkParameters} from "hdseedloop";
import { NetworkDb } from "../../services/models/network";
import { TransactionPublishedData } from "../../services/models/transaction";

export const roundCryptoAmount = function(amountIn:number):number{
    return Number(amountIn.toPrecision(4));
}

export const roundUsdAmount = function(amountIn:number):number{
    return Number(amountIn.toPrecision(4));
}

export const lamportsToSol = function(amountIn:number):number{
    return amountIn/1000000000;
}

export const solToLamports = function(amountIn:number):number{
    return amountIn*1000000000;
}

export const networkFromNetworkDb = function(nw: NetworkDb):Network{
    let networkFamilyNameIn = nw.networkFamilyName;
    if(!networkFamilyNameIn){
        networkFamilyNameIn = "evm";
    }
    let network:Network = new Network({
        fullName: nw.fullName,
        ticker: nw.ticker,
        chainId: nw.chainId,
        networkFamilyName: networkFamilyNameIn
    })
    return network;
}

// UPDATE SO BLOCKCHIAN EXPLORER LINKS ARE INCLUDED WITH NETWORKDB 
export const getTransactionExplorerPath = function(network:NetworkDb, txPublishedData:TransactionPublishedData):string|null{
    let linkPathToReturn:string|null = null;
    switch(network.ticker.toLowerCase()){
        case("eth"):{
            linkPathToReturn = `https://etherscan.io/tx/${txPublishedData.hash}`
            break;
        }
        case("eth(rop.)"):{
            linkPathToReturn = `https://ropsten.etherscan.io/tx/${txPublishedData.hash}`
            break;
        }
        case("sol"):{
            linkPathToReturn = `https://solscan.io/tx/${txPublishedData.hash}`
            break;
        }
        case("matic"):{
            linkPathToReturn = `https://polygonscan.com/tx/${txPublishedData.hash}`
            break;
        }
        default:{
            linkPathToReturn = null;
            break;
        }
    }
    return linkPathToReturn;
}