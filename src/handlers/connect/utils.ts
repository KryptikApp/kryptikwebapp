import { isHexString, toUtf8String } from "ethers/lib/utils";
import { IWalletConnectSession } from "@walletconnect/legacy-types";
import LegacySignClient from "@walletconnect/client";
import { Network, NetworkFamily } from "hdseedloop";

import { isValidAddress } from "../../helpers/utils/accountUtils";
import { networkFromNetworkDb } from "../../helpers/utils/networkUtils";
import { NetworkDb } from "../../services/models/network";
import { JsonRpcResult, signingMethods, WcRequestType } from "./types";
import ModalStore from "../store/ModalStore";

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

// pulled from https://github.com/WalletConnect/web-examples/blob/main/wallets/react-wallet-v2/src/utils/LegacyWalletConnectUtil.ts
export let legacySignClient: LegacySignClient;

export function createLegacySignClient({ uri }: { uri?: string } = {}) {
  // If URI is passed always create a new session,
  // otherwise fall back to cached session if client isn't already instantiated.
  if (uri) {
    deleteCachedLegacySession();
    legacySignClient = new LegacySignClient({ uri });
  } else if (!legacySignClient && getCachedLegacySession()) {
    const session = getCachedLegacySession();
    legacySignClient = new LegacySignClient({ session });
  } else {
    return;
  }

  // TODO: ensure we can parse payload
  legacySignClient.on("session_request", (error, payload) => {
    if (error) {
      throw new Error(`legacySignClient > session_request failed: ${error}`);
    }
    ModalStore.open("SessionProposalModal", { legacyProposal: payload });
  });

  legacySignClient.on("connect", () => {
    console.log("legacySignClient > connect");
  });

  legacySignClient.on("error", (error) => {
    throw new Error(`legacySignClient > on error: ${error}`);
  });

  legacySignClient.on("call_request", (error, payload) => {
    if (error) {
      throw new Error(`legacySignClient > call_request failed: ${error}`);
    }
    onCallRequest(payload);
  });

  legacySignClient.on("disconnect", async () => {
    deleteCachedLegacySession();
  });
}

const onCallRequest = async (payload: {
  id: number;
  method: string;
  params: any[];
}) => {
  switch (payload.method) {
    case signingMethods.ETH_SIGN:
    case signingMethods.PERSONAL_SIGN:
      return ModalStore.open("SessionSignModal", {
        legacyCallRequestEvent: payload,
        legacyRequestSession: legacySignClient.session,
      });
    // TODO: note signing implies sending. Maybe add a legacy variable that triggers a send after signing in the approve method?
    case signingMethods.ETH_SEND_TRANSACTION:
    case signingMethods.ETH_SIGN_TRANSACTION:
      return ModalStore.open("SessionSignModal", {
        legacyCallRequestEvent: payload,
        legacyRequestSession: legacySignClient.session,
      });

    default:
      alert(`${payload.method} is not supported for WalletConnect v1`);
  }
};

function getCachedLegacySession(): IWalletConnectSession | undefined {
  if (typeof window === "undefined") return;

  const local = window.localStorage
    ? window.localStorage.getItem("walletconnect")
    : null;

  let session = null;
  if (local) {
    try {
      session = JSON.parse(local);
    } catch (error) {
      throw error;
    }
  }
  return session;
}

function deleteCachedLegacySession(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem("walletconnect");
}
