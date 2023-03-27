import { isHexString, toUtf8String } from "ethers/lib/utils";
import { Network, NetworkFamily } from "hdseedloop";
import { isValidAddress } from "../../helpers/utils/accountUtils";
import { networkFromNetworkDb } from "../../helpers/utils/networkUtils";
import { NetworkDb } from "../../services/models/network";
import { JsonRpcResult, signingMethods, WcRequestType } from "./types";

/**
 * Converts hex to utf8 string if it is valid bytes
 */
export function convertHexToUtf8(value: string) {
  if (isHexString(value)) {
    return toUtf8String(value);
  }

  return value;
}

/**
 * Gets message from various signing request methods by filtering out
 * a value that is not an address (thus is a message).
 * If it is a hex string, it gets converted to utf8 string
 */

export function getSignParamsMessage(params: string[], networkDB: NetworkDb) {
  const message = params.filter((p) => !isValidAddress(p, networkDB))[0];
  return message;
}

export function formatJsonRpcResult<T = any>(
  id: number,
  result: T
): JsonRpcResult<T> {
  return {
    id,
    jsonrpc: "2.0",
    result,
  };
}

/** True if network is supported. False otherwise. */
export function isWalletConnectNetworkValid(networkDb: NetworkDb | null) {
  if (!networkDb) return false;
  const network: Network = networkFromNetworkDb(networkDb);
  if (network.networkFamily == NetworkFamily.EVM) return true;
  return false;
}

export function getRequestEnum(requestMethod: string | null) {
  if (!requestMethod) return WcRequestType.unknown;
  switch (requestMethod) {
    case signingMethods.ETH_SIGN:
    case signingMethods.PERSONAL_SIGN: {
      return WcRequestType.signMessage;
    }
    case signingMethods.ETH_SIGN_TRANSACTION:
    case signingMethods.SOLANA_SIGN_TRANSACTION:
    case signingMethods.NEAR_SIGN_TRANSACTION:
    case signingMethods.NEAR_SIGN_TRANSACTIONS: {
      return WcRequestType.signTx;
    }
    case signingMethods.ETH_SEND_TRANSACTION: {
      return WcRequestType.sendTx;
    }
    default: {
      return WcRequestType.unknown;
    }
  }
}
