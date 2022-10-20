// wrapper file for onesol calls
//TODO: UPDATE TO REMOVE DEPENDENCY ON ONESOL LIB (USES API ON BACKEND)
import { Distribution, OnesolProtocol } from "@onesol/onesol-sdk";
import { PublicKey, Transaction } from "@solana/web3.js";
import { ISwapData } from "../../../parsers/0xData";

import { KryptikProvider } from "../../../services/models/provider";

export interface IOneSOlSwapParams{
    kryptikProvider:KryptikProvider, amountSellToken:number, sellTokenAddress: string, buyTokenAddress: string, accountAddress:string, slippage:number
}


export async function getOneSolSwapRoutes(params:IOneSOlSwapParams):Promise<Distribution[]|null>{
    const{kryptikProvider, amountSellToken, sellTokenAddress, buyTokenAddress} = {...params};
    if(!kryptikProvider.solProvider) return null;
    const onesolProtocol = new OnesolProtocol(kryptikProvider.solProvider);
    let routes:Distribution[] = await onesolProtocol.getRoutes({amount:amountSellToken, sourceMintAddress:sellTokenAddress, onlyDirect:true, destinationMintAddress:buyTokenAddress, size:10, programIds:["9W959DqEETiGZocYWCQPaJ6sBmUzgfxXfqGeTEdp3aQP"]});
    if(!routes) return null;
    return routes;
}


export interface IOneSOlSwapInfo{
    transactions:Transaction[],
    selectedRoute:Distribution
}


export async function getOneSolSwapTransactions(params:IOneSOlSwapParams):Promise<IOneSOlSwapInfo|null>{
    const{kryptikProvider, accountAddress, slippage} = {...params};
    if(!kryptikProvider.solProvider) return null;
    let routes:Distribution[]|null = await getOneSolSwapRoutes(params);
    if(!routes) return null;
    console.log("routes");
    console.log(routes);
    const onesolProtocol = new OnesolProtocol(kryptikProvider.solProvider);
    // wallet account public key
    let accountPubKey:PublicKey = new PublicKey(accountAddress);
    //TODO: UPDATE TO SELECT FOR 'BEST' ROUTE
    const bestRoute:Distribution = routes[0];
    const transactions:Transaction[] = await onesolProtocol.getTransactions({
        wallet: accountPubKey,
        distribution: routes[0], // one distribution from the results of the `getRoutes`
        slippage: slippage, //default is 0.005
    })
    if(!transactions) return null;
    return {
        transactions: transactions,
        selectedRoute: bestRoute
    }
}