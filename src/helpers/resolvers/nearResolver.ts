import { Network, NetworkFamily } from "hdseedloop";
import { networkFromNetworkDb } from "../utils/networkUtils";
import { IAccountResolverParams, IResolvedAccount } from "./accountResolver";

export const resolveNEARAccount = async function(params:IAccountResolverParams):Promise<IResolvedAccount|null>{
    const{account, kryptikProvider, networkDB} = params;
    let network:Network = networkFromNetworkDb(networkDB);
    if(!kryptikProvider.nearProvider) return null;
    if(network.networkFamily != NetworkFamily.Near) return null;
    let nearProvider = kryptikProvider.nearProvider;
    // even though solana and near use different address representations
    // they use the same underlying curve 
    try{
        let nearAccount = await nearProvider.account(account);
        // if account is valid then return resolved object
        let resolvedAccount:IResolvedAccount = {
            address: account,
            isResolved: true,
            name: (nearAccount.accountId != account)?nearAccount.accountId:undefined
        }
        return resolvedAccount;
    }
    catch(e){
        if(!validateNearImplicitAddress(account)) return null;
        let resolvedAccount:IResolvedAccount = {
            address: account,
            isResolved: true
        }
        return resolvedAccount;
    }
}

// update to run thorough validation
const validateNearImplicitAddress = function(address:string){
    if(address.length === 64 && !address.includes('.')) return true;
    return false;
}