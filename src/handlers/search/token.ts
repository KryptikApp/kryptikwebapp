import { Network, NetworkFamily } from "hdseedloop";
import router from "next/router";

import { networkFromNetworkDb } from "../../helpers/utils/networkUtils";
import { defaultNetworkDb, NetworkDb } from "../../services/models/network";
import { TokenDb } from "../../services/models/token";
import Web3Service from "../../services/Web3Service";
import { ISearchResult } from "./types";

export interface ITokenClickHandlerParams{
    tokenTicker:string|undefined,
    networkTicker:string
}

const tokenOnclickFunction = function(params:ITokenClickHandlerParams){
    const {tokenTicker, networkTicker} = {...params};
    router.push( { pathname: '../coins/CoinInfo', query:{networkTicker:networkTicker, tokenTicker:tokenTicker?tokenTicker:undefined} } );
}

export const getTokenSearchSuggestions = function(query:string, networkDb:NetworkDb, kryptikService:Web3Service):ISearchResult[]{
    let suggestions:ISearchResult[] = [];
    let network:Network = networkFromNetworkDb(networkDb);
    let tokenList:TokenDb[] = [];
    let baseNetwork:NetworkDb;
    switch(network.networkFamily){
        case(NetworkFamily.EVM):{
            let tokensToSearch = kryptikService.erc20Dbs;
            tokenList = filterTokenListByQuery(tokensToSearch, query);
            baseNetwork = defaultNetworkDb;
            break;
        }
        case(NetworkFamily.Near):{
            let tokensToSearch = kryptikService.nep141Dbs;
            tokenList = filterTokenListByQuery(tokensToSearch, query);
            let nearNetwork = kryptikService.getNetworkDbByTicker("near");
            if(!nearNetwork) return [];
            baseNetwork = nearNetwork;
            break;
        }
        case(NetworkFamily.Solana):{
            let tokensToSearch = kryptikService.splDbs;
            tokenList = filterTokenListByQuery(tokensToSearch, query);
            let solNetwork = kryptikService.getNetworkDbByTicker("sol");
            if(!solNetwork) return [];
            baseNetwork = solNetwork;
            break;
        }
        default:{
            return [];
        }
    }

    for(const token of tokenList){
        let queryOnClickParams:ITokenClickHandlerParams = {networkTicker:baseNetwork.ticker, tokenTicker:token.symbol}
        let newSuggestion:ISearchResult = {resultString:token.name, iconPath:token.logoURI, onClickFunction:tokenOnclickFunction, onClickParams:queryOnClickParams};
        suggestions.push(newSuggestion);
    }

    return suggestions;
}


export function filterTokenListByQuery(tokenList:TokenDb[], query:string):TokenDb[]{
    query = query.toLowerCase();
    let filteredResult:TokenDb[] = tokenList.filter(token=>token.name.toLowerCase().includes(query));
    return filteredResult;
}

export function searchTokenListByTicker(tokenList:TokenDb[], ticker:string):TokenDb|null{
    ticker = ticker.toLowerCase();

    for(const tokenDb of tokenList){
        if(tokenDb.symbol.toLowerCase() == ticker){
            return tokenDb;
        }
    }
    return null;
}