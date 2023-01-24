import { Network, SignedTransaction, TransactionParameters } from "hdseedloop";
import { useCallback } from "react";
import { networkFromNetworkDb } from "../../helpers/utils/networkUtils";
import { IWallet } from "../../models/KryptikWallet";
import { NetworkDb } from "../../services/models/network";
import { KryptikProvider } from "../../services/models/provider";
import Web3Service from "../../services/Web3Service";
import { signingMethods } from "./types";
import { formatJsonRpcResult, getSignParamsMessage } from "./utils";
import { SignClientTypes } from "@walletconnect/types/dist/types/sign-client";
import ModalStore from "../store/ModalStore";
import { SignClient } from "@walletconnect/sign-client";
import { SignClientTypes as SignClientType } from "@walletconnect/types/dist/types/sign-client/client";

type Params = {
  requestEvent: SignClientTypes.EventArguments["session_request"];
  wallet: IWallet;
  fromAddy: string;
  // network related to request
  //TODO:is it possible to have null or multiple networks?
  provider: KryptikProvider;
};

export async function approveRequest(requestParams: Params): Promise<any> {
  const { requestEvent, wallet, provider, fromAddy } = requestParams;
  const networkDb: NetworkDb = provider.networkDb;
  const network: Network = provider.network;
  const { params, id } = requestEvent;
  const { chainId, request } = params;
  const { seedLoop } = wallet;
  switch (request.method) {
    case signingMethods.PERSONAL_SIGN || signingMethods.ETH_SIGN: {
      const msg = getSignParamsMessage(request.params, networkDb);
      const signedMsg: string = seedLoop.signMessage(fromAddy, msg, network);
      return formatJsonRpcResult(id, signedMsg);
    }
    case signingMethods.ETH_SIGN_TRANSACTION: {
      //TODO: ensure correct evm tx format
      const evmTx = request.params[0];
      const tx: TransactionParameters = { evmTransaction: evmTx };
      const signedTx: SignedTransaction = await seedLoop.signTransaction(
        fromAddy,
        tx,
        network
      );
      const signedEvmTx: string | undefined = signedTx.evmFamilyTx;
      if (!signedEvmTx) {
        throw new Error("Unable to sign EVM transaction.");
      }
      return formatJsonRpcResult(id, signedEvmTx);
    }
    case signingMethods.ETH_SEND_TRANSACTION: {
      const txToSend: any = request.params[0];
      if (!provider.ethProvider) {
        throw new Error(`Must include ${networkDb.fullName} network provider.`);
      }
      const res = await provider.ethProvider.sendTransaction(txToSend);
      return formatJsonRpcResult(id, res.blockHash);
    }
    default: {
      throw new Error(
        `Unable to approve request event woith method ${request.method}.`
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
