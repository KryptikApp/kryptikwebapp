import fromExponential from "from-exponential";
import { TokenAndNetwork } from "../../services/models/token";

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