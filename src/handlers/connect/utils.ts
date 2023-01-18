import { isValidAddress } from "../../helpers/utils/accountUtils";
import { NetworkDb } from "../../services/models/network";
import { caipNamespaces, defaultNamespace, INamespace } from "./namespaces";
import { JsonRpcResult } from "./types";

/**
 * Formats CAIP2 chainId to blockchain name
 */
export function namespaceIdToName(chainId: string) {
  const namespaceObj: INamespace | undefined = caipNamespaces[chainId];
  if (!namespaceObj) {
    return "Unknown Network";
  } else {
    return namespaceObj.name;
  }
}

/**
 * Formats CAIP2 chainId to namespace
 */
export function idToNamespace(chainId: string): INamespace {
  const namespaceObj: INamespace | undefined = caipNamespaces[chainId];
  if (!namespaceObj) {
    return defaultNamespace;
  } else {
    return namespaceObj;
  }
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
