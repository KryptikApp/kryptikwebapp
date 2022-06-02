export const roundCryptoAmount = function(amountIn:number):number{
    return Number(amountIn.toPrecision(4));
}

export const roundUsdAmount = function(amountIn:number):number{
    return Number(amountIn.toPrecision(4));
}