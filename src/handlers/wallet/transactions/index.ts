import { Transaction as SolTransaction } from "@solana/web3.js";
import { Transaction as AlgoTransaction } from "algosdk";
import {
  Network,
  NetworkFamily,
  SignedTransaction,
  TransactionParameters,
} from "hdseedloop";
import { Transaction as NearTransaction } from "near-api-js/lib/transaction";
import { getAddressForNetwork } from "../../../helpers/utils/accountUtils";
import { networkFromNetworkDb } from "../../../helpers/utils/networkUtils";
import { IWallet } from "../../../models/KryptikWallet";
import { NetworkDb } from "../../../services/models/network";
import { TokenAndNetwork } from "../../../services/models/token";
import {
  IErrorHandler,
  TransactionPublishedData,
  TransactionRequest,
} from "../../../services/models/transaction";
import {
  ISignAndSendAlgoParameters,
  signAndSendAlgoTransaction,
} from "./AlgorandTransaction";
import {
  ISignAndSendEVMParameters,
  signAndSendEVMTransaction,
} from "./EVMTransaction";
import {
  ISignAndSendNearParameters,
  signAndSendNEARTransaction,
} from "./NearTransactions";
import {
  ISignAndSendSolParameters,
  signAndSendSOLTransaction,
} from "./SolTransactions";

export interface ISignAndSendWrapperParams {
  solParams?: ISignAndSendSolParameters;
  nearParams?: ISignAndSendNearParameters;
  evmParams?: ISignAndSendEVMParameters;
  algoParams?: ISignAndSendAlgoParameters;
  tokenAndNetwork: TokenAndNetwork;
  errorHandler: IErrorHandler;
}

export interface TxFamilyWrapper {
  evmTx?: TransactionRequest;
  solTx?: SolTransaction[];
  nearTx?: NearTransaction;
  algoTx?: AlgoTransaction[];
}

export const handleSignAndSendTransaction = async function (
  params: ISignAndSendWrapperParams
): Promise<TransactionPublishedData | null> {
  const {
    tokenAndNetwork,
    evmParams,
    nearParams,
    solParams,
    algoParams,
    errorHandler,
  } = {
    ...params,
  };
  let network = networkFromNetworkDb(tokenAndNetwork.baseNetworkDb);
  console.log(
    `Beginning sign and send procedure for ${params.tokenAndNetwork.baseNetworkDb.fullName}.`
  );
  // UPDATE TO REFLECT ERROR IN UI
  switch (network.networkFamily) {
    case NetworkFamily.Algorand: {
      if (!algoParams) {
        errorHandler(
          `Error: Unable to build transaction for ${params.tokenAndNetwork.baseNetworkDb.fullName}. Transaction parameters not provided. Please contact the Kryptik team.`,
          true
        );
        return null;
      }
      try {
        let txPub = await signAndSendAlgoTransaction(algoParams);
        return txPub;
      } catch (e: any) {
        errorHandler(e.message, true);
        return null;
      }
    }
    case NetworkFamily.EVM: {
      if (!evmParams) {
        errorHandler(
          `Error: Unable to build transaction for ${params.tokenAndNetwork.baseNetworkDb.fullName}. Transaction parameters not provided. Please contact the Kryptik team.`,
          true
        );
        return null;
      }
      try {
        let txPub = await signAndSendEVMTransaction(evmParams);
        return txPub;
      } catch (e: any) {
        errorHandler(e.message, true);
        return null;
      }
    }
    case NetworkFamily.Solana: {
      if (!solParams) {
        errorHandler(
          `Error: Unable to build transaction for ${params.tokenAndNetwork.baseNetworkDb.fullName}. Transaction parameters not provided. Please contact the Kryptik team.`,
          true
        );
        return null;
      }
      try {
        let txPub = await signAndSendSOLTransaction(solParams);
        return txPub;
      } catch (e: any) {
        errorHandler(e.message, true);
        return null;
      }
    }
    case NetworkFamily.Near: {
      if (!nearParams) {
        errorHandler(
          `Error: Unable to build transaction for ${params.tokenAndNetwork.baseNetworkDb.fullName}. Transaction parameters not provided. Please contact the Kryptik team.`,
          true
        );
        return null;
      }
      try {
        let txPub = await signAndSendNEARTransaction(nearParams);
        return txPub;
      } catch (e: any) {
        errorHandler(e.message, true);
        return null;
      }
    }
    default: {
      params.errorHandler(
        `Error: Unable to build transaction for ${params.tokenAndNetwork.baseNetworkDb.fullName}. This network is not yet supported.`,
        true
      );
      return null;
      break;
    }
  }
};

/** Signs a given transaction. Note that if multiple transactions are provided (example: multiple solana transactions) only the first tx will be signed.*/
export async function signTransaction(
  wallet: IWallet,
  tx: TxFamilyWrapper,
  networkDb: NetworkDb
): Promise<SignedTransaction | null> {
  const network: Network = networkFromNetworkDb(networkDb);
  const address = getAddressForNetwork(wallet, network);
  const txParams: TransactionParameters = {};
  switch (network.networkFamily) {
    case NetworkFamily.EVM: {
      txParams.evmTransaction = tx.evmTx;
      break;
    }
    case NetworkFamily.Solana: {
      if (!tx.solTx) return null;
      const txBuffer = tx.solTx[0].serialize();
      txParams.transactionBuffer = txBuffer;
      break;
    }
    case NetworkFamily.Algorand: {
      if (!tx.algoTx) return null;
      const txBuffer = tx.algoTx[0].bytesToSign();
      txParams.transactionBuffer = txBuffer;
      break;
    }
    default: {
      // pass for now
      break;
    }
  }
  console.log("Signing tx with params:");
  console.log(txParams);
  console.log(tx);
  const sigResult = wallet.seedLoop.signTransaction(address, txParams, network);
  return sigResult;
}
