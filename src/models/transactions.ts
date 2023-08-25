import { NetworkFamily } from "hdseedloop";
import {
  handleSignAndSendTransaction,
  ISignAndSendWrapperParams,
  TxFamilyWrapper,
} from "../handlers/wallet/transactions";
import { TOKENS } from "../helpers/DEXs/raydium/tokens";
import { divByDecimals } from "../helpers/utils/numberUtils";
import { IKryptikSwapData } from "../parsers/0xData";

import { KryptikProvider } from "../services/models/provider";
import { TokenAndNetwork } from "../services/models/token";
import TransactionFeeData, {
  defaultErrorHandler,
  IErrorHandler,
  ISignAndSendParameters,
  TransactionPublishedData,
  TxType,
} from "../services/models/transaction";
import { IWallet } from "./KryptikWallet";

export interface IKryptikTxParams {
  feeData: TransactionFeeData;
  tokenPriceUsd: number;
  tokenAndNetwork: TokenAndNetwork;
  kryptikTx: TxFamilyWrapper;
  txType: TxType;
  kryptikProvider?: KryptikProvider;
  swapData?: IKryptikSwapData;
}

export interface TxSignatureParams {
  kryptikWallet: IWallet;
  sendAccount: string;
  kryptikProvider?: KryptikProvider;
  errorHandler?: IErrorHandler;
}

export interface SwapAmounts {
  buyAmountCrypto: number;
  sellAmountCrypto: number;
}

// wrapper for common transaction data
export class KryptikTransaction {
  feeData: TransactionFeeData;
  provider: KryptikProvider | null;
  lastUpdated: number;
  tokenAndNetwork: TokenAndNetwork;
  tokenPriceUsd: number;
  txData: TxFamilyWrapper;
  // swaps
  isSwap: boolean;
  txType: TxType;
  swapData?: IKryptikSwapData;

  constructor(params: IKryptikTxParams) {
    const {
      feeData,
      tokenPriceUsd,
      kryptikTx,
      kryptikProvider,
      tokenAndNetwork,
      swapData,
      txType,
    } = { ...params };
    this.feeData = feeData;
    this.provider = kryptikProvider ? kryptikProvider : null;
    this.tokenPriceUsd = tokenPriceUsd;
    this.tokenAndNetwork = tokenAndNetwork;
    this.lastUpdated = Date.now();
    this.txData = kryptikTx;
    this.txType = txType;
    if (swapData) {
      this.swapData = swapData;
      this.isSwap = true;
    } else {
      this.isSwap = false;
    }
  }

  // TODO: update so transaction is refreshed as well
  updateFeeData(newFeeData: TransactionFeeData) {
    this.feeData = newFeeData;
    this.lastUpdated = Date.now();
  }

  updateProvider(kryptikProvider: KryptikProvider) {
    this.provider = kryptikProvider;
  }

  // return s ui formatted swap amounts from internal swap data
  fetchSwapAmounts(): SwapAmounts | null {
    if (!this.swapData) return null;
    let sellTokenAmount = divByDecimals(
      Number(this.swapData.sellAmount),
      this.swapData.sellTokenAndNetwork.tokenData
        ? this.swapData.sellTokenAndNetwork.tokenData.tokenDb.decimals
        : this.swapData.sellTokenAndNetwork.baseNetworkDb.decimals
    );
    let buyTokenAmount = divByDecimals(
      Number(this.swapData.buyAmount),
      this.swapData.buyTokenAndNetwork.tokenData
        ? this.swapData.buyTokenAndNetwork.tokenData.tokenDb.decimals
        : this.swapData.sellTokenAndNetwork.baseNetworkDb.decimals
    );
    // sol swaps use wrapped sol... so use wrapped sol decimals for base network
    if (
      this.swapData.sellTokenAndNetwork.baseNetworkDb.ticker.toLowerCase() ==
      "sol"
    ) {
      sellTokenAmount = divByDecimals(
        Number(this.swapData.sellAmount),
        this.swapData.sellTokenAndNetwork.tokenData
          ? this.swapData.sellTokenAndNetwork.tokenData.tokenDb.decimals
          : TOKENS.WSOL.decimals
      );
      buyTokenAmount = divByDecimals(
        Number(this.swapData.buyAmount),
        this.swapData.buyTokenAndNetwork.tokenData
          ? this.swapData.buyTokenAndNetwork.tokenData.tokenDb.decimals
          : TOKENS.WSOL.decimals
      );
    }
    return {
      buyAmountCrypto: buyTokenAmount.asNumber,
      sellAmountCrypto: sellTokenAmount.asNumber,
    };
  }

  async SignAndSend(
    params: TxSignatureParams
  ): Promise<TransactionPublishedData | null> {
    const { errorHandler, kryptikWallet, sendAccount, kryptikProvider } = {
      ...params,
    };
    let currProvider = this.provider ? this.provider : kryptikProvider;
    // ensure provider is established
    if (!currProvider) {
      // throw new Error("Error: Unable to sign transaction. No provider is established.");
      return null;
    }
    // set up error handler for signature router
    let currErrorHandler: IErrorHandler = errorHandler
      ? errorHandler
      : defaultErrorHandler;
    let txSignParams: ISignAndSendWrapperParams = {
      tokenAndNetwork: this.tokenAndNetwork,
      errorHandler: currErrorHandler,
    };
    let baseParams: ISignAndSendParameters = {
      wallet: kryptikWallet,
      kryptikProvider: currProvider,
      sendAccount: sendAccount,
    };
    switch (currProvider.network.networkFamily) {
      case NetworkFamily.EVM: {
        if (!this.txData.evmTx) {
          console.warn("No EVM transaction data provided.");
          return null;
        }
        txSignParams.evmParams = {
          ...baseParams,
          txEVM: this.txData.evmTx,
        };
        break;
      }
      case NetworkFamily.Solana: {
        if (!this.txData.solTx) {
          return null;
        }
        txSignParams.solParams = {
          ...baseParams,
          txs: this.txData.solTx,
        };
        break;
      }
      case NetworkFamily.Near: {
        if (!this.txData.nearTx) {
          return null;
        }
        txSignParams.nearParams = {
          ...baseParams,
          txNear: this.txData.nearTx,
        };
        break;
      }
      case NetworkFamily.Algorand: {
        if (!this.txData.algoTx) return null;
        txSignParams.algoParams = {
          ...baseParams,
          algoTxs: this.txData.algoTx,
        };
        break;
      }
      default: {
        return null;
      }
    }
    let pubResults = await handleSignAndSendTransaction(txSignParams);
    return pubResults;
  }
}

// export interface IKryptikEVMTxParams extends IKryptikTxParams{
//     evmTransaction:TransactionRequest,
//     swapData?:IEVMSwapData
// }

// export class KryptikEVMTransaction extends KryptikTransaction{
//     evmTransaction:TransactionRequest
//     isSwap:boolean
//     swapData?:IEVMSwapData
//     constructor(params:IKryptikEVMTxParams) {
//         super(params)
//         const {evmTransaction, swapData} = {...params};
//         this.evmTransaction = evmTransaction;
//         if(swapData){
//             this.swapData = swapData;
//             this.isSwap = true;
//         }
//         else{
//             this.isSwap = false
//         }
//     }
// }
