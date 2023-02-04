import {
  Account,
  Algodv2,
  AtomicTransactionComposer,
  generateAccount,
  getApplicationAddress,
  getMethodByName,
  Indexer,
  makeApplicationCloseOutTxn,
  OnApplicationComplete,
  SuggestedParams,
  Transaction,
  assignGroupID,
  makeBasicAccountTransactionSigner,
  decodeAddress,
  makeApplicationOptInTxn,
  makePaymentTxnWithSuggestedParams,
  mnemonicToSecretKey,
  ABIContract,
} from "algosdk";
import AlgodClient from "algosdk/dist/types/client/v2/algod/algod";
import folksdk from "folks-finance-js-sdk";
import { createAlgoAprovalTransaction } from "../../src/handlers/assets/approve/algorandAssetApprover";
import { KryptikProvider } from "../../src/services/models/provider";
import { AlgoTransactionParams } from "../../src/services/models/transaction";

export default async function buildDepositTransaction(algodClient: AlgodClient, user: string, kryptikProvider: KryptikProvider) {
  const indexerClient = new Indexer(
    "https://testnet-algorand.api.purestake.io/idx2"
  );
  const params = await algodClient.getTransactionParams().do();
  console.log(params);
  const depositAppId = folksdk.TestnetDepositsAppId;
  let { txns, escrow } = folksdk.prepareAddDepositEscrowToDeposits(
    depositAppId,
    user,
    params
  );
  const tx0:Transaction = txns[0];
  const txIn: AlgoTransactionParams ={
    decimals: 0,
    valueAlgo: 0,
    sendAccount: user,
    kryptikProvider,
    tokenPriceUsd: 0,
    tokenParamsAlgo: { contractAddress: "0" },
  },},
  };

  createAlgoAprovalTransaction(txIn);
  let signedTxns = txns.map((txn) => txn.signTxn(user.sk));
  /*let signedTxns = txns.map((txn) => txn.signTxn(user.sk));
  const signedTxns = await algodClient.
  signedTxns.map(
    async (signedTxn) =>
      await algodClient.sendRawTransaction(signedTxns[0]).do()
  );*/
}
