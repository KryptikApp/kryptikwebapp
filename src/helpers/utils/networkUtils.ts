import { Network } from "hdseedloop";
import { NetworkDb } from "../../services/models/network";
import { ChainData, TokenDb } from "../../services/models/token";
import { TransactionPublishedData } from "../../services/models/transaction";

export const getTransactionExplorerPath = function(network:NetworkDb, txPublishedData:TransactionPublishedData):string|null{
    let explorerUrl = network.blockExplorerURL;
    // add trailing slash if none
    if(!explorerUrl.endsWith("/")) explorerUrl = explorerUrl + "/";
    let linkPathToReturn:string|null = `${explorerUrl}tx/${txPublishedData.hash}`;
    // near explorer has unique transaction path
    if(network.ticker.toLowerCase() == "near"){
        linkPathToReturn = `${explorerUrl}transactions/${txPublishedData.hash}`;
    } 
    return linkPathToReturn;
}

export const formatTicker = function(tickerIn:string):string{
    // remove extra ticker info. for eth network ticker
    // UPDATE so tickers like weth (wrapped eth) are kept as is
    if(tickerIn.toLowerCase().includes("eth") && tickerIn.includes("(")) return "ETH";
    if(tickerIn.toLowerCase().includes("sol") && tickerIn.includes("(")) return "SOL";
    return tickerIn.toUpperCase(); 
}

export const isNetworkArbitrum = function(network:NetworkDb):boolean{
    return network.ticker.toLowerCase() == "eth(arbitrum)";
}

export const isNetworkOptimism = function(network:NetworkDb):boolean{
    return network.ticker.toLowerCase() == "eth(optimism)";
}

// true if supports type 2 tx., false otherwise
export const isEVMTxTypeTwo = function(network:NetworkDb):boolean{
    if(isNetworkArbitrum(network) || isNetworkOptimism(network) ) return false;
    return true;
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


export const getChainDataForNetwork = function(network:NetworkDb, tokenData:TokenDb):ChainData|null{
    let chainDataArray:ChainData[] = tokenData.chainData;
    if(!network.evmData) return null;
    for(const chainInfo of chainDataArray){
        // each contract has a different address depending on the chain
        // we use the network chainId + symbol to extract the correct chaindata
        // remember: chainId may be specific to network
        if(chainInfo.chainId == network.evmData.chainId && network.ticker.toLowerCase() == chainInfo.ticker.toLowerCase()){
            return chainInfo;
        }
    }
    // we return null if there is no chain data specified for network
    return null;
}