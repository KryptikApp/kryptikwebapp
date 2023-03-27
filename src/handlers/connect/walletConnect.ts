import SignClient from "@walletconnect/sign-client";
import { Network, SignedTransaction } from "hdseedloop";
import { IWallet } from "../../models/KryptikWallet";
import { NetworkDb } from "../../services/models/network";
import { KryptikProvider } from "../../services/models/provider";
import { signTransaction } from "../wallet/transactions";
import { IParsedWcRequest, JsonRpcResult, WcRequestType } from "./types";
import { formatJsonRpcResult } from "./utils";

type Params = {
  parsedRequest: IParsedWcRequest;
  wallet: IWallet;
  fromAddy: string;
  // network related to request
  // TODO:is it possible to have null or multiple networks?
  provider: KryptikProvider;
};

export async function approveWcRequest(
  requestParams: Params
): Promise<null | JsonRpcResult<string>> {
  const { parsedRequest, wallet, provider, fromAddy } = requestParams;
  const networkDb: NetworkDb = provider.networkDb;
  const network: Network = provider.network;

  const { seedLoop } = wallet;

  switch (parsedRequest.requestType) {
    case WcRequestType.signMessage: {
      if (!parsedRequest.message)
        throw new Error("No message available to sign.");
      const msg = parsedRequest.message;
      const signedMsg: string = seedLoop.signMessage(fromAddy, msg, network);
      return formatJsonRpcResult(parsedRequest.id, signedMsg);
    }
    case WcRequestType.signTx: {
      if (!parsedRequest.tx)
        throw new Error("No transaction available to sign.");
      const signedTx: SignedTransaction | null = await signTransaction(
        wallet,
        parsedRequest.tx,
        networkDb
      );
      if (!signedTx) {
        throw new Error("Unable to sign transaction");
      }
      // TODO: update to support non-evm tx signatures
      const signedEvmTx: string | undefined = signedTx.evmFamilyTx;
      if (!signedEvmTx) {
        throw new Error("Unable to sign EVM transaction.");
      }
      return formatJsonRpcResult(parsedRequest.id, signedEvmTx);
    }
    default: {
      throw new Error(
        `Unable to approve request event of method type: ${parsedRequest.method}.`
      );
    }
  }
}

export function createSignClient() {
  const newSignClient = SignClient.init({
    relayUrl: "wss://us-east-1.relay.walletconnect.com",
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_ID,
    metadata: {
      name: "Kryptik Wallet",
      description: "A multichain noncustodial wallet.",
      url: "https://kryptik.app",
      icons: ["https://www.kryptik.app/kryptikBrand/kryptikEyez.png"],
    },
  });
  return newSignClient;
}
