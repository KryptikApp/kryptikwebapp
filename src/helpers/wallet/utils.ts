import { PublicKey } from "@solana/web3.js";
import fromExponential from "from-exponential";
import { Network, NetworkFamily, NetworkFamilyFromFamilyName, NetworkParameters} from "hdseedloop";
import { NetworkDb } from "../../services/models/network";
import { TokenAndNetwork } from "../../services/models/token";
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

export interface IBigNumber{
    asNumber:number,
    asString:string
}

export const multByDecimals = function(amountIn:number, decimals:number):IBigNumber{
    amountIn = roundToDecimals(amountIn, decimals);
    let numToReturn:IBigNumber = {
        asNumber: amountIn*10**decimals,
        asString: fromExponential(amountIn*10**decimals)
    }
    return numToReturn;
}

export const divByDecimals = function(amountIn:number, decimals:number):IBigNumber{
    amountIn = roundToDecimals(amountIn, decimals);
    let numToReturn:IBigNumber = {
        asNumber: amountIn/10**decimals,
        asString: fromExponential(amountIn/10**decimals)
    }
    return numToReturn;
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
    if(tickerIn.toLowerCase().includes("eth")) return "ETH";
    if(tickerIn.toLowerCase().includes("sol")) return "SOL";
    return tickerIn.toUpperCase(); 
}

export const isNetworkArbitrum = function(network:NetworkDb){
    return network.ticker == "eth(arbitrum)";
}


export const formatAmountUi = function(amountIn:string, tokenAndNetwork:TokenAndNetwork, isUsd=false):string{
    let lastChar:string = amountIn.slice(-1);
    let oldAmount:string = amountIn.slice(0, -1);
    let formattedAmount:string = amountIn;
    // allow users to add decimal followed by zero
    // UPDATE TO ALLOW MULTIPLE ZEROS
    if(lastChar == "0" && oldAmount.endsWith(".")){
        formattedAmount = amountIn;
    }
    else{
        // format amount
        if( lastChar != ".")
        {
            if(amountIn == "NaN"){
                formattedAmount = "0";
            }
            else{
                formattedAmount = Number(amountIn).toString();
            }
        }
    }
    let returnAmount:string;
    if(isUsd){
        returnAmount = (lastChar!="." && !(lastChar == "0" && oldAmount.endsWith(".")))?roundToDecimals(Number(formattedAmount), 2).toString():formattedAmount;
    }
    else{
        returnAmount = (lastChar!="." && !(lastChar == "0" && oldAmount.endsWith(".")))?roundDecimalsByNetworkToken(Number(formattedAmount), tokenAndNetwork):formattedAmount;
    };
    console.log("Amount to return:");
    console.log(returnAmount);
    return returnAmount;
}


export const roundDecimalsByNetworkToken = function(amountIn:number, tokenAndNetwork:TokenAndNetwork):string{
    let amount:number;
    if(tokenAndNetwork.tokenData){
        amount = roundToDecimals(amountIn, tokenAndNetwork.tokenData.tokenDb.decimals);
    }
    else{
        amount = roundToDecimals(amountIn, tokenAndNetwork.baseNetworkDb.decimals)
    }
    return amount.toString();
}