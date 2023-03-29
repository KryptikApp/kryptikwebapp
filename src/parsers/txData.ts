import { Transaction as SolTransaction } from "@solana/web3.js";
import { Transaction as NearTransaction } from "near-api-js/lib/transaction";
import { encodeAddress, Transaction as AlgoTransaction } from "algosdk";

import { TxFamilyWrapper } from "../handlers/wallet/transactions";
import { networkFromNetworkDb } from "../helpers/utils/networkUtils";
import { NetworkDb } from "../services/models/network";
import { TransactionRequest } from "../services/models/transaction";
import { Network, NetworkFamily, truncateAddress } from "hdseedloop";
import { IParsedWcRequest, WcRequestType } from "../handlers/connect/types";
import {
  getRequestEnum,
  getSignParamsMessage,
} from "../handlers/connect/utils";
import { SignClientTypes } from "@walletconnect/types";

interface IParseTxData {
  network: Network;
  networkDb: NetworkDb;
}

interface IParseAlgoData extends IParseTxData {
  tx: AlgoTransaction;
}

interface IParseEvmData extends IParseTxData {
  tx: TransactionRequest;
}

interface IParseNearData extends IParseTxData {
  tx: NearTransaction;
}
interface IParseSolData extends IParseTxData {
  tx: SolTransaction;
}

/** Creates human readable form of transaction data. */
export function parseTxData(
  txData: TxFamilyWrapper | null,
  networkDb: NetworkDb | null
): string {
  console.log("parsinggggg with data:");
  console.log(txData);
  // TODO: add bettter default string
  const defaultResponse: string = "No request data to display.";
  if (!networkDb || !txData) return defaultResponse;
  const network = networkFromNetworkDb(networkDb);

  switch (network.networkFamily) {
    case NetworkFamily.EVM: {
      if (!txData.evmTx) return defaultResponse;
      const params: IParseEvmData = {
        tx: txData.evmTx,
        network: network,
        networkDb: networkDb,
      };
      return parseEvmData(params);
    }
    case NetworkFamily.Solana: {
      if (!txData.solTx) return defaultResponse;
      const params: IParseSolData = {
        tx: txData.solTx[0],
        network: network,
        networkDb: networkDb,
      };
      return parseSolData(params);
    }
    case NetworkFamily.Algorand: {
      if (!txData.algoTx) return defaultResponse;
      const params: IParseAlgoData = {
        tx: txData.algoTx[0],
        network: network,
        networkDb: networkDb,
      };
      return parseAlgoData(params);
    }
    case NetworkFamily.Near: {
      if (!txData.nearTx) return defaultResponse;
      const params: IParseNearData = {
        tx: txData.nearTx,
        network: network,
        networkDb: networkDb,
      };
      return parseNearData(params);
    }
    default: {
      return defaultResponse;
    }
  }
}

function parseEvmData(params: IParseEvmData) {
  const { tx, network, networkDb } = { ...params };
  const to: string = tx.to ? truncateAddress(tx.to, network) : "Unknown";
  const from: string = tx.from ? truncateAddress(tx.from, network) : "Unknown";
  const value: string = tx.value ? tx.value.toString() : "Unknown";
  const dataString: string = `To: ${to}\nFrom: ${from}\nvalue:${value}`;
  return dataString;
}

function parseSolData(params: IParseSolData) {
  const { tx, network, networkDb } = { ...params };
  const feePayerString: any = tx.feePayer;
  const feePayer: string = tx.feePayer
    ? truncateAddress(feePayerString, network)
    : "Unknown";
  const numInstructions: string = tx.instructions.length.toString();
  const dataString: string = `Fee Payer: ${feePayer}\nInstruction Count: ${numInstructions}`;
  return dataString;
}

function parseNearData(params: IParseNearData) {
  const { tx, network, networkDb } = { ...params };
  const fromAddress: string = tx.publicKey
    ? truncateAddress(tx.publicKey.toString(), network)
    : "Unknown";
  const numInstructions: string = tx.actions.length.toString();
  const dataString: string = `From: ${fromAddress}\nInstruction Count: ${numInstructions}`;
  return dataString;
}

function parseAlgoData(params: IParseAlgoData) {
  const { tx, network, networkDb } = { ...params };
  const to: string = tx.to
    ? truncateAddress(encodeAddress(tx.to.publicKey), network)
    : "Unknown";

  const from: string = tx.from
    ? truncateAddress(encodeAddress(tx.from.publicKey), network)
    : "Unknown";
  const value: string = tx.amount ? tx.amount.toString() : "Unknown";
  const dataString: string = `To: ${to}\nFrom: ${from}\nvalue:${value}`;
  return dataString;
}

/** Parses wallet connect request params. Returns transaction data. */
export function parseWcRequest(
  request: SignClientTypes.EventArguments["session_request"],
  method: string | null,
  networkDb: NetworkDb | null
): IParsedWcRequest | null {
  console.log("AHHHHHHHH");
  if (!networkDb) return null;
  const params = request.params.request.params;
  console.log("tx params");
  console.log(params);
  const { id, topic } = { ...request };
  const requestType: WcRequestType = getRequestEnum(method);
  const network: Network = networkFromNetworkDb(networkDb);
  const result: IParsedWcRequest = {
    humanReadableString: "",
    requestType: requestType,
    method: method || "Unknown",
    id: id,
    topic: topic,
    chainId: request.params.chainId,
  };
  console.log(method);
  console.log(requestType);
  switch (requestType) {
    case WcRequestType.signTx:
    case WcRequestType.sendTx: {
      switch (network.networkFamily) {
        case NetworkFamily.EVM: {
          const newTxRequest: TransactionRequest = params[0];
          if (newTxRequest.gasPrice) {
            newTxRequest.type = 1;
          } else {
            newTxRequest.type = 2;
          }
          const tx: TxFamilyWrapper = { evmTx: newTxRequest };
          result.tx = tx;
          break;
        }
        case NetworkFamily.Solana: {
          const tx: TxFamilyWrapper = { solTx: [params] };
          result.tx = tx;
          break;
        }
        case NetworkFamily.Algorand: {
          const tx: TxFamilyWrapper = { algoTx: [params] };
          result.tx = tx;
          break;
        }
        case NetworkFamily.Near: {
          const tx: TxFamilyWrapper = { nearTx: params };
          result.tx = tx;
          break;
        }
        case WcRequestType.signMessage: {
        }
        default: {
          return null;
        }
      }
      console.log("setting human readable string...");
      result.humanReadableString = parseTxData(result.tx || null, networkDb);
      break;
    }
    default: {
      const message = getSignParamsMessage(params, networkDb);
      result.message = message;
      result.humanReadableString = message;
    }
  }
  return result;
}
