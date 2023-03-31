import SignClient from "@walletconnect/sign-client";
import { BigNumberish } from "ethers";
import { Network, SignedTransaction } from "hdseedloop";
import { IWallet } from "../../models/KryptikWallet";
import { NetworkDb } from "../../services/models/network";
import { KryptikProvider } from "../../services/models/provider";
import { TransactionRequest } from "../../services/models/transaction";
import { getTransactionFeeDataEVM } from "../fees/EVMFees";
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
  tokenPrice: number;
};

export async function approveWcRequest(
  requestParams: Params
): Promise<null | JsonRpcResult<string>> {
  const { parsedRequest, wallet, provider, fromAddy, tokenPrice } =
    requestParams;
  const networkDb: NetworkDb = provider.networkDb;
  const network: Network = provider.network;

  const { seedLoop } = wallet;
  // populate tx if required
  if (
    parsedRequest.requestType == WcRequestType.signAndSendTx ||
    parsedRequest.requestType == WcRequestType.sendTx ||
    parsedRequest.requestType == WcRequestType.signTx
  ) {
    const evmTx: TransactionRequest | undefined = parsedRequest.tx?.evmTx;
    if (!evmTx) {
      throw new Error("No evm transaction available.");
    }
    // TODO: don't fetch gas data if already provided
    const suggestedLimit: BigNumberish | undefined = evmTx.gasLimit;
    const newFeeData = await getTransactionFeeDataEVM({
      tx: evmTx,
      tokenPriceUsd: tokenPrice,
      networkDb: networkDb,
      kryptikProvider: provider,
      suggestedGasLimit: suggestedLimit,
    });

    evmTx.type = 2;
    if (evmTx.type == 2) {
      evmTx.gasLimit = newFeeData.EVMGas.gasLimit;
      evmTx.maxFeePerGas = newFeeData.EVMGas.maxFeePerGas;
      evmTx.maxPriorityFeePerGas = newFeeData.EVMGas.maxPriorityFeePerGas;
    }
    if (provider.ethProvider) {
      let accountNonce = await provider.ethProvider.getTransactionCount(
        fromAddy,
        "latest"
      );
      evmTx.nonce = accountNonce;
    }
  }

  switch (parsedRequest.requestType) {
    case WcRequestType.signMessage: {
      if (!parsedRequest.message)
        throw new Error("No message available to sign.");
      const msg = parsedRequest.message;
      const signedMsg: string = seedLoop.signMessage(fromAddy, msg, network);
      return formatJsonRpcResult(parsedRequest.id, signedMsg);
    }
    case WcRequestType.signTx:
    case WcRequestType.sendTx:
    case WcRequestType.signAndSendTx: {
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
