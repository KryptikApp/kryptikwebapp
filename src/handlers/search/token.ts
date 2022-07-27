import { Network, NetworkFamily } from "hdseedloop";
import router from "next/router";

import { networkFromNetworkDb } from "../../helpers/utils/networkUtils";
import { defaultNetworkDb, NetworkDb } from "../../services/models/network";
import { TokenAndNetwork, TokenDb } from "../../services/models/token";
import Web3Service from "../../services/Web3Service";
import { ISearchResult } from "./types";

export interface ITokenClickHandlerParams{
    tokenTicker:string|undefined,
    networkTicker:string
}

const tokenOnclickFunction = function(params:ITokenClickHandlerParams){
    const {tokenTicker, networkTicker} = {...params};
    router.push( { pathname: '../coins/coinInfo', query:{networkTicker:networkTicker, tokenTicker:tokenTicker?tokenTicker:undefined} } );
}

// to do: update to support any passed in click handler
export const getTokenSearchSuggestions = function(query:string, networkDb:NetworkDb, tokensToSearch:TokenDb[], returnAll=false, clickHandler?:(selectedToken:TokenAndNetwork)=>void):ISearchResult[]{
    let suggestions:ISearchResult[] = [];
    let tokenList:TokenDb[];
    if(returnAll){
        tokenList = tokensToSearch;
    }
    else{
        tokenList = filterTokenListByQuery(tokensToSearch, query);
    }
    
    let baseNetwork:NetworkDb = networkDb;

    for(const token of tokenList){
        let newSuggestion:ISearchResult
        // use specified click handler
        if(clickHandler){
            let tokenAndNetwork:TokenAndNetwork = {baseNetworkDb:baseNetwork, tokenData:{tokenDb:token}};
            newSuggestion = {resultString:token.name, iconPath:token.logoURI, onClickFunction:clickHandler, onClickParams:tokenAndNetwork};
        }
        else{
            let queryOnClickParams:ITokenClickHandlerParams = {networkTicker:baseNetwork.ticker, tokenTicker:token.symbol}
            newSuggestion = {resultString:token.name, iconPath:token.logoURI, onClickFunction:tokenOnclickFunction, onClickParams:queryOnClickParams};
        }
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