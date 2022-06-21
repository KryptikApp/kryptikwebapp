import { TokenDb } from "../services/models/token";

export function searchTokenListByTicker(tokenList:TokenDb[], ticker:string):TokenDb|null{
    ticker = ticker.toLowerCase();
    for(const tokenDb of tokenList){
        if(tokenDb.symbol.toLowerCase() == ticker){
            return tokenDb;
        }
    }
    return null
}