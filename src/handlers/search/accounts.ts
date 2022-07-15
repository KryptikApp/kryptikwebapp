import { Network, NetworkFamily, truncateAddress } from "hdseedloop";
import router from "next/router";
import { IResolvedAccount } from "../../helpers/resolvers/accountResolver";
import { networkFromNetworkDb } from "../../helpers/utils/networkUtils";
import { NetworkDb } from "../../services/models/network";
import { fetchEnsSuggestions } from "../ens/suggestions";
import { ISearchResult } from "./types";

export interface IAccountClickHandlerParams{
    account:string,
    name?:string,
    networkTicker:string
}

const accountOnclickFunction = function(params:IAccountClickHandlerParams){
    const {account, networkTicker, name} = {...params};
    router.push({ pathname: '../gallery', query:{account:account, networkTicker:networkTicker, name:name}});
}

export const getAccountSearchSuggestions = async function(query:string, networkDb:NetworkDb):Promise<ISearchResult[]>{
    let suggestions:ISearchResult[] = [];
    let network:Network = networkFromNetworkDb(networkDb);
    // get ens suggestions if network is evm
    if(network.networkFamily == NetworkFamily.EVM){
        const ensSuggestions:ISearchResult[] = await getEnsSuggestions(query, networkDb);
        suggestions.push(...ensSuggestions);
    }
    // add query to end of results
    let queryOnclickParams:IAccountClickHandlerParams = {
        account: query,
        networkTicker: networkDb.ticker
    }
    suggestions.push({resultString:query, onClickFunction:accountOnclickFunction, onClickParams:queryOnclickParams})
    return suggestions;
}

const getEnsSuggestions = async function(query:string, networkDb:NetworkDb):Promise<ISearchResult[]>{
    let suggestions:ISearchResult[] = [];
    try{
        let ensSuggestions:IResolvedAccount[] = await fetchEnsSuggestions(query);
        for(const ensAccount of ensSuggestions){
            let name = (ensAccount.names && ensAccount.names[0]!="")?ensAccount.names[0]:ensAccount.address;
            let onClickParams:IAccountClickHandlerParams = {account:ensAccount.address, name:ensAccount.names?ensAccount.names[0]:undefined, networkTicker:networkDb.ticker};
            suggestions.push({resultString:name, iconPath:ensAccount.avatarPath, onClickFunction:accountOnclickFunction, onClickParams:onClickParams})
        }
        return suggestions;
    }
    catch(e){
        console.warn("Error while fetching account search suggestions")
        return [];
    }
}