import { PublicKey } from "@solana/web3.js";
import { Network, NetworkFamily, NetworkFamilyFromFamilyName, NetworkParameters} from "hdseedloop";
import { NetworkDb } from "../../services/models/network";
import { TransactionPublishedData } from "../../services/models/transaction";

export const roundCryptoAmount = function(amountIn:number):number{
    return Number(amountIn.toPrecision(4));
}

export const roundUsdAmount = function(amountIn:number):number{
    return Number(amountIn.toPrecision(4));
}

export const roundToDecimals = function(amountIn:number, decimals:number=18){
    return Number(amountIn.toFixed(decimals));
}

export const lamportsToSol = function(amountIn:number):number{
    return amountIn/1000000000;
}

export const solToLamports = function(amountIn:number):number{
    return amountIn*1000000000;
}

// generate a publci key from a given address, using the 
export const createEd25519PubKey = function(address:string):PublicKey{
    let pubKey:PublicKey|null = new PublicKey(address);
    if(!pubKey){
        throw(new Error("Error: Unable to generate public key. Please make sure input address is correct"));
    }
    return pubKey;
}

export const createSolTokenAccount = async function(accountAddress:string, tokenAddress:string):Promise<PublicKey>{
    // smart contract ids defined by solana
    const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
    const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL');
    // user address
    const owner = new PublicKey(accountAddress);
    // token address
    const mint = new PublicKey(tokenAddress);
    const [pubKey] = await PublicKey.findProgramAddress(
        [owner.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
        ASSOCIATED_TOKEN_PROGRAM_ID
    );
    return pubKey;
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

export const getTransactionExplorerPath = function(network:NetworkDb, txPublishedData:TransactionPublishedData):string|null{
    let linkPathToReturn:string|null = `${network.blockExplorerURL}tx/${txPublishedData.hash}`;
    return linkPathToReturn;
}

export const formatTicker = function(tickerIn:string):string{
    let ticker:string;
    // remove extra ticker info. for eth network ticker
    // UPDATE so tickers like weth (wrapped eth) stay o.g.
    if(tickerIn.toLowerCase().includes("eth")) return "ETH";
    return tickerIn.toUpperCase(); 
}

export const isNetworkArbitrum = function(network:NetworkDb){
    return network.ticker == "eth(arbitrum)";
}