import fromExponential from "from-exponential";
import { TokenAndNetwork } from "../../services/models/token";

export const roundCryptoAmount = function (
  amountIn: number,
  decimals: number = 4
): number {
  return Number(amountIn.toFixed(decimals));
};

export const roundUsdAmount = function (
  amountIn: number,
  decimals: number = 2
): number {
  return Number(amountIn.toFixed(decimals));
};

export const roundToDecimals = function (
  amountIn: number,
  decimals: number = 18
) {
  return Number(amountIn.toFixed(decimals));
};

export interface IBigNumber {
  asNumber: number;
  asString: string;
}

export const multByDecimals = function (
  amountIn: number,
  decimals: number
): IBigNumber {
  amountIn = roundToDecimals(amountIn, decimals);
  let numToReturn: IBigNumber = {
    asNumber: amountIn * 10 ** decimals,
    asString: fromExponential(amountIn * 10 ** decimals),
  };
  return numToReturn;
};

export const divByDecimals = function (
  amountIn: number,
  decimals: number
): IBigNumber {
  amountIn = roundToDecimals(amountIn, decimals);
  let numToReturn: IBigNumber = {
    asNumber: amountIn / 10 ** decimals,
    asString: fromExponential(amountIn / 10 ** decimals),
  };
  return numToReturn;
};

export const lamportsToSol = function (amountIn: number): number {
  return Math.floor(amountIn / 1000000000);
};

export const solToLamports = function (amountIn: number): number {
  return Math.floor(amountIn * 1000000000);
};

export const formatAmountUi = function (
  amountIn: string,
  tokenAndNetwork: TokenAndNetwork,
  isUsd = false
): string {
  let lastChar: string = amountIn.slice(-1);
  let oldAmount: string = amountIn.slice(0, -1);
  let formattedAmount: string = amountIn;
  // allow users to add decimal followed by zero
  // UPDATE TO ALLOW MULTIPLE ZEROS
  if (lastChar == "0" && oldAmount.endsWith(".")) {
    formattedAmount = amountIn;
  } else {
    // format amount
    if (lastChar != ".") {
      if (amountIn == "NaN") {
        formattedAmount = "0";
      } else {
        formattedAmount = Number(amountIn).toString();
      }
    }
  }
  let returnAmount: string;
  if (isUsd) {
    returnAmount =
      lastChar != "." && !(lastChar == "0" && oldAmount.endsWith("."))
        ? roundToDecimals(Number(formattedAmount), 2).toString()
        : formattedAmount;
  } else {
    returnAmount =
      lastChar != "." && !(lastChar == "0" && oldAmount.endsWith("."))
        ? roundDecimalsByNetworkToken(Number(formattedAmount), tokenAndNetwork)
        : formattedAmount;
  }
  return returnAmount;
};

export const roundDecimalsByNetworkToken = function (
  amountIn: number,
  tokenAndNetwork: TokenAndNetwork
): string {
  let amount: number;
  let maxDecimals: number = 8;
  if (tokenAndNetwork.tokenData) {
    // show max 4 decimal places
    let decimals: number =
      tokenAndNetwork.tokenData.tokenDb.decimals < maxDecimals
        ? tokenAndNetwork.tokenData.tokenDb.decimals
        : maxDecimals;
    amount = roundToDecimals(amountIn, decimals);
  } else {
    // show max 4 decimal places
    let decimals: number =
      tokenAndNetwork.baseNetworkDb.decimals < maxDecimals
        ? tokenAndNetwork.baseNetworkDb.decimals
        : maxDecimals;
    amount = roundToDecimals(amountIn, decimals);
  }
  return amount.toString();
};
