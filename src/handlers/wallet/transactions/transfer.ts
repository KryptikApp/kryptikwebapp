import { NetworkFamily } from "hdseedloop";
import { networkFromNetworkDb } from "../../../helpers/utils/networkUtils";
import { KryptikTransaction } from "../../../models/transactions";
import {
  AlgoTransactionParams,
  CreateTransferTransactionParameters,
  EVMTransferTxParams,
  NearTransactionParams,
  SolTransactionParams,
  TxType,
} from "../../../services/models/transaction";
import {
  createAlgoTokenTransferTransaction,
  createAlgoTransferTransaction,
} from "./AlgorandTransaction";
import { createEVMTransferTransaction } from "./EVMTransaction";
import { BuildNEARTransfer } from "./NearTransactions";
import {
  createSolTokenTransferTransaction,
  createSolTransferTransaction,
} from "./SolTransactions";

export async function BuildTransferTx(
  params: CreateTransferTransactionParameters
): Promise<KryptikTransaction | null> {
  const {
    kryptikProvider,
    fromAddress,
    toAddress,
    amountCrypto,
    tokenAndNetwork,
    tokenPriceUsd,
    nearPubKeyString,
  } = { ...params };
  let txType: TxType = tokenAndNetwork.tokenData
    ? TxType.TransferToken
    : TxType.TransferNative;
  let network = networkFromNetworkDb(params.tokenAndNetwork.baseNetworkDb);
  console.log(`building transfer tx... from ${fromAddress} to ${toAddress} `);
  // UPDATE TO REFLECT ERROR IN UI
  switch (network.networkFamily) {
    case NetworkFamily.EVM: {
      console.log("building evm transfer");
      let txIn: EVMTransferTxParams = {
        sendAccount: fromAddress,
        toAddress: toAddress,
        valueCrypto: Number(amountCrypto),
        kryptikProvider: kryptikProvider,
        tokenAndNetwork: tokenAndNetwork,
        tokenPriceUsd: tokenPriceUsd,
      };
      let tx: KryptikTransaction | null = await createEVMTransferTransaction(
        txIn
      );
      return tx;
      break;
    }
    case NetworkFamily.Algorand: {
      console.log("Building algorand transfer transaction.");
      let txIn: AlgoTransactionParams = {
        sendAccount: fromAddress,
        toAddress: toAddress,
        valueAlgo: Number(amountCrypto),
        kryptikProvider: kryptikProvider,
        decimals: tokenAndNetwork.tokenData
          ? tokenAndNetwork.tokenData.tokenDb.decimals
          : tokenAndNetwork.baseNetworkDb.decimals,
        tokenAndNetwork: tokenAndNetwork,
        tokenPriceUsd: tokenPriceUsd,
      };
      let tx: KryptikTransaction;
      if (txType == TxType.TransferToken) {
        /// add contract address
        if (!tokenAndNetwork.tokenData) {
          throw new Error(
            "Error: Token Data not provided for SPL token transfer."
          );
        }
        // add algo token data to input params
        txIn.tokenParamsAlgo = {
          contractAddress: tokenAndNetwork.tokenData.selectedAddress,
        };
        tx = await createAlgoTokenTransferTransaction(txIn);
      }
      // create base layer sol tx.
      else {
        tx = await createAlgoTransferTransaction(txIn);
      }
      return tx;
      break;
    }
    case NetworkFamily.Solana: {
      let txIn: SolTransactionParams = {
        sendAccount: fromAddress,
        toAddress: toAddress,
        valueSol: Number(amountCrypto),
        kryptikProvider: kryptikProvider,
        decimals: tokenAndNetwork.tokenData
          ? tokenAndNetwork.tokenData.tokenDb.decimals
          : tokenAndNetwork.baseNetworkDb.decimals,
        tokenAndNetwork: tokenAndNetwork,
        tokenPriceUsd: tokenPriceUsd,
      };
      let tx: KryptikTransaction;
      if (txType == TxType.TransferToken) {
        // add contract address
        if (!tokenAndNetwork.tokenData) {
          throw new Error(
            "Error: Token Data not provided for SPL token transfer."
          );
        }
        // add sol token data to input params
        txIn.tokenParamsSol = {
          contractAddress: tokenAndNetwork.tokenData.selectedAddress,
        };
        tx = await createSolTokenTransferTransaction(txIn);
      }
      // create base layer sol tx.
      else {
        tx = await createSolTransferTransaction(txIn);
      }
      return tx;
    }
    case NetworkFamily.Near: {
      if (!nearPubKeyString) return null;
      let txIn: NearTransactionParams = {
        sendAccount: fromAddress,
        toAddress: toAddress,
        valueNear: Number(amountCrypto),
        kryptikProvider: kryptikProvider,
        decimals: tokenAndNetwork.tokenData
          ? tokenAndNetwork.tokenData.tokenDb.decimals
          : tokenAndNetwork.baseNetworkDb.decimals,
        tokenAndNetwork: tokenAndNetwork,
        tokenPriceUsd: tokenPriceUsd,
        txType: txType,
        pubKeyString: nearPubKeyString,
      };
      let tx: KryptikTransaction | null = await BuildNEARTransfer(txIn);
      return tx;
    }
    default: {
      params.errorHandler(
        `Error: Unable to build transaction for ${params.tokenAndNetwork.baseNetworkDb.fullName}`
      );
      return null;
      break;
    }
  }
}
