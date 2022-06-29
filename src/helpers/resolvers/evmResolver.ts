import { Network, NetworkFamily, isValidEVMAddress } from "hdseedloop";
import {
    StaticJsonRpcProvider,
} from '@ethersproject/providers';

import { defaultNetworkDb } from "../../services/models/network";
import { networkFromNetworkDb } from "../utils/networkUtils";
import { IAccountResolverParams, IResolvedAccount } from "./accountResolver";

export const resolveEVMAccount = async function(params:IAccountResolverParams):Promise<IResolvedAccount|null>{
    const{account, kryptikProvider, networkDB} = params;
    let network:Network = networkFromNetworkDb(networkDB);
    if(!kryptikProvider.ethProvider) return null;
    if(network.networkFamily != NetworkFamily.EVM) return null;
    let evmProvider = kryptikProvider.ethProvider;
    let address:string|null = null;
    let avatarPath:string|null = null;
    let name:string|null = null;
    // default ENS is ethereum... other chains are text records 
    if(networkDB.ticker.toLowerCase() == "eth"){
        console.log("made it");
        address = await evmProvider.resolveName(account);
        avatarPath = await evmProvider.getAvatar(account);
    }
    else{
        // get eth provider, for default ENS service
        evmProvider = new StaticJsonRpcProvider(defaultNetworkDb.provider, {name:"homestead", chainId:1});
        let resolver= await evmProvider.getResolver(account);
        if(resolver){
            address = await resolver.getAddress(networkDB.chainId);
            avatarPath = await evmProvider.getAvatar(account);
        }
    }
    // if account resolves then account is an ENS name...
    // check if address is a valid EVM address and set
    // otherwise... no ens name set for account, check if account is valid address
    // if so.. set as address
    if(address && address.toLowerCase()!=account.toLowerCase() && isValidEVMAddress(address)){
       console.log("setting account name");
       address = address;
       name = account;
    }
    else{
        if(isValidEVMAddress(account)){
            address = account;
            // try reverse lookup
            name = await evmProvider.lookupAddress(account)
        }
        else{
            return null;
        }
    }
    let resolvedAccount:IResolvedAccount = {
        address: address,
        isResolved: true,
        avatarPath: avatarPath?avatarPath:undefined,
        names: name?[name]:undefined
    }
    return resolvedAccount;
}