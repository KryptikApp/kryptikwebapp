import router from "next/router";

import { NetworkDb } from "../../services/models/network";
import { TokenAndNetwork, TokenDb } from "../../services/models/token";
import { SwapValidator } from "../swaps/utils";
import { ISearchResult } from "./types";

export interface ITokenClickHandlerParams{
    tokenTicker:string|undefined,
    networkTicker:string
}

const tokenOnclickFunction = function(params:ITokenClickHandlerParams){
    const {tokenTicker, networkTicker} = {...params};
    if(tokenTicker){
        router.push( { pathname: '../coins/coinInfo', query:{networkTicker:networkTicker, tokenTicker:tokenTicker} } );
    }
    else{
        router.push( { pathname: '../coins/coinInfo', query:{networkTicker:networkTicker} } );
    }
}

export const searchSuggestionsFromTokenAndNetworks = function(query:string, tokenAndNetworks:TokenAndNetwork[], clickHandler?:(selectedToken:TokenAndNetwork)=>void, returnAll:boolean=false):ISearchResult[]{
    let suggestions:ISearchResult[] = [];
    let newSuggestion:ISearchResult;
    const filteredTokens = returnAll?filterTokenAndNetworkListByQuery(tokenAndNetworks, query):tokenAndNetworks;
    for(const token of filteredTokens){
        if(clickHandler){
            newSuggestion = {resultString:token.tokenData?token.tokenData.tokenDb.name:token.baseNetworkDb.fullName, iconPath:token.tokenData?token.tokenData.tokenDb.logoURI:token.baseNetworkDb.iconPath, iconPathSecondary:token.tokenData?token.baseNetworkDb.iconPath:undefined, onClickFunction:clickHandler, onClickParams:token};
        }
        else{
            let queryOnClickParams:ITokenClickHandlerParams = {networkTicker:token.baseNetworkDb.ticker, tokenTicker:token.tokenData?token.tokenData.tokenDb.symbol:undefined}
            newSuggestion = {resultString:token.tokenData?token.tokenData.tokenDb.name:token.baseNetworkDb.fullName, iconPath:token.tokenData?token.tokenData.tokenDb.logoURI:token.baseNetworkDb.iconPath, iconPathSecondary:token.tokenData?token.baseNetworkDb.iconPath:undefined, onClickFunction:tokenOnclickFunction, onClickParams:queryOnClickParams};
        }
        suggestions.push(newSuggestion);
    }
    return suggestions
}

// TODO: update to support any passed in click handler
export const getTokenSearchSuggestions = function(query:string, tickerToNetworkDict:{[ticker:string]:NetworkDb}, networksToSearch:NetworkDb[], tokensToSearch:TokenDb[], returnAll=false, clickHandler?:(selectedToken:TokenAndNetwork)=>void, swapValidator?:SwapValidator):ISearchResult[]{
    let suggestions:ISearchResult[] = [];
    let tokenList:TokenDb[];
    let networkList:NetworkDb[];

    if(returnAll){
        tokenList = tokensToSearch;
        networkList = networksToSearch;
    }
    else{
        tokenList = filterTokenListByQuery(tokensToSearch, query);
        networkList = filterNetworkListByQuery(networksToSearch, query);
    }

    // filter networks
    for(const baseNetwork of networkList){
        let newSuggestion:ISearchResult;
        let tokenAndNetwork:TokenAndNetwork = {baseNetworkDb:baseNetwork};
        // if swap validator is provided ensure... search result is a valid swap pair
        if(swapValidator){
            if(!swapValidator.isValidSwapPair(tokenAndNetwork)) continue;
        }
        // use specified click handler
        if(clickHandler){
            newSuggestion = {resultString:baseNetwork.fullName, iconPath:baseNetwork.iconPath, onClickFunction:clickHandler, onClickParams:tokenAndNetwork};
        }
        else{
            let queryOnClickParams:ITokenClickHandlerParams = {networkTicker:baseNetwork.ticker, tokenTicker:undefined}
            newSuggestion = {resultString:baseNetwork.fullName, iconPath:baseNetwork.iconPath, onClickFunction:tokenOnclickFunction, onClickParams:queryOnClickParams};
        }
        suggestions.push(newSuggestion);
    }
    
    // filter tokens
    for(const token of tokenList){
        // iterate through network specific aspects of chain data
        for(const chainData of token.chainData){
            let newSuggestion:ISearchResult
            // find base network for token by network ticker
            let baseNetwork = tickerToNetworkDict[chainData.ticker];
            if(!baseNetwork) continue;
            let tokenAndNetwork:TokenAndNetwork = {baseNetworkDb:baseNetwork, tokenData:{tokenDb:token, selectedAddress:chainData.address}};
            // if swap validator is provided ensure... search result is a valid swap pair
            if(swapValidator){
                if(!swapValidator.isValidSwapPair(tokenAndNetwork)) continue;
            }
            // use specified click handler
            if(clickHandler){
                newSuggestion = {resultString:token.name, iconPath:token.logoURI, iconPathSecondary:baseNetwork.iconPath, onClickFunction:clickHandler, onClickParams:tokenAndNetwork};
            }
            else{
                let queryOnClickParams:ITokenClickHandlerParams = {networkTicker:baseNetwork.ticker, tokenTicker:token.symbol}
                newSuggestion = {resultString:token.name, iconPath:token.logoURI, iconPathSecondary:baseNetwork.iconPath, onClickFunction:tokenOnclickFunction, onClickParams:queryOnClickParams};
            }
            suggestions.push(newSuggestion);
            }
    }

    return suggestions;
}

export function filterTokenAndNetworkListByQuery(tokenAndNetworks:TokenAndNetwork[], query:string):TokenAndNetwork[]{
    query = query.toLowerCase();
    let filteredResult:TokenAndNetwork[] = tokenAndNetworks.filter(t=>(t.tokenData?t.tokenData.tokenDb.symbol.toLowerCase().includes(query)||t.tokenData.tokenDb.name.toLowerCase().includes(query):t.baseNetworkDb.fullName.toLowerCase().includes(query) ||t.baseNetworkDb.ticker.toLowerCase().includes(query)));
    return filteredResult;
}

export function filterTokenListByQuery(tokenList:TokenDb[], query:string):TokenDb[]{
    query = query.toLowerCase();
    let filteredResult:TokenDb[] = tokenList.filter(token=>(token.name.toLowerCase().includes(query) || token.symbol.toLowerCase().includes(query)));
    return filteredResult;
}

export function filterNetworkListByQuery(networkList:NetworkDb[], query:string):NetworkDb[]{
    query = query.toLowerCase();
    let filteredResult:NetworkDb[] = networkList.filter(network=>(network.fullName.toLowerCase().includes(query) || network.ticker.toLowerCase().includes(query)));
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