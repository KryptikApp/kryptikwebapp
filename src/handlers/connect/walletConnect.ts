import SignClient from "@walletconnect/sign-client";
import { BigNumberish } from "ethers";
import { Network, NetworkFamily, SignedTransaction } from "hdseedloop";
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
  if (network.networkFamily != NetworkFamily.EVM) {
    throw new Error(
      "WalletConnect approval process only supports EVM networks at this time."
    );
  }
  const { seedLoop } = wallet;
  // populate tx if required
  if (
    parsedRequest.requestType == WcRequestType.signAndSendTx ||
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
    if (evmTx.type == 2) {
      evmTx.gasLimit = newFeeData.EVMGas.gasLimit;
      evmTx.maxFeePerGas = newFeeData.EVMGas.maxFeePerGas;
      evmTx.maxPriorityFeePerGas = newFeeData.EVMGas.maxPriorityFeePerGas;
    } else {
      evmTx.gasLimit = newFeeData.EVMGas.gasLimit;
      evmTx.gasPrice = newFeeData.EVMGas.gasPrice;
    }
    if (provider.ethProvider) {
      let accountNonce = await provider.ethProvider.getTransactionCount(
        fromAddy,
        "latest"
      );
      evmTx.nonce = accountNonce;
    }
  }
  let response: JsonRpcResult<string> | null = null;
  switch (parsedRequest.requestType) {
    // sign message
    case WcRequestType.signMessage: {
      if (!parsedRequest.message)
        throw new Error("No message available to sign.");
      const msg = parsedRequest.message;
      const signedMsg: string = seedLoop.signMessage(fromAddy, msg, network);
      response = formatJsonRpcResult(parsedRequest.id, signedMsg);
      break;
    }
    case WcRequestType.sendTx: {
      if (!parsedRequest.signedTx)
        throw new Error("No signed transaction available to send.");
      response = formatJsonRpcResult(parsedRequest.id, parsedRequest.signedTx);
      break;
    }
    // sign tx
    case WcRequestType.signAndSendTx:
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
      response = formatJsonRpcResult(parsedRequest.id, signedEvmTx);
      break;
    }
    // sign typed data
    case WcRequestType.signTypedData: {
      if (!parsedRequest.typedData)
        throw new Error("No typed data available to sign.");
      const typedData = parsedRequest.typedData;
      const signedTypedData: string = await seedLoop.signTypedData(
        fromAddy,
        typedData,
        network
      );
      if (!signedTypedData) {
        throw new Error("Unable to sign typed data.");
      }
      response = formatJsonRpcResult(parsedRequest.id, signedTypedData);
      break;
    }
    default: {
      throw new Error(
        `Unable to approve request event of method type: ${parsedRequest.method}.`
      );
    }
  }
  // send signed tx
  // TODO: push inside of helper?
  // TODO: update to support non evm requests
  if (
    parsedRequest.requestType == WcRequestType.sendTx ||
    parsedRequest.requestType == WcRequestType.signAndSendTx
  ) {
    if (!provider.ethProvider)
      throw new Error("No provider available to publish tx.");
    try {
      const res = await provider.ethProvider.sendTransaction(response.result);
      // set response to transaction hash
      response.result = res.hash;
    } catch (e: any) {
      if (e.message) {
        const failureMessage: string = e.message;
        if (failureMessage.includes("insufficient funds")) {
          throw new Error(
            `You need more ${networkDb.ticker.toUpperCase()} to approve this transaction.`
          );
        }
      }
      throw new Error(
        `Unable to publish transaction to ${networkDb.fullName} .`
      );
    }
  }
  // if not sending tx, return response
  return response;
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
