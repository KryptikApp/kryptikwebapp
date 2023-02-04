import { Network, TransactionParameters } from "hdseedloop";

import {
  networkFromNetworkDb,
  getTransactionExplorerPath,
} from "../../../helpers/utils/networkUtils";
import { multByDecimals } from "../../../helpers/utils/numberUtils";
import {
  AlgoTransactionParams,
  ISignAndSendParameters,
  TransactionPublishedData,
  TxType,
} from "../../../services/models/transaction";
import { IWallet } from "../../../models/KryptikWallet";
import {
  IKryptikTxParams,
  KryptikTransaction,
} from "../../../models/transactions";
import AlgodClient from "algosdk/dist/types/client/v2/algod/algod";
import {
  makeAssetTransferTxnWithSuggestedParams,
  makePaymentTxnWithSuggestedParamsFromObject,
  Transaction as AlgoTransaction,
} from "algosdk";
import { getFeeDataAlgorand } from "../../fees/AlgoFees";

export interface ISignAndSendAlgoParameters extends ISignAndSendParameters {
  algoTx: AlgoTransaction;
}

// signs and sends any sol transaction
export const signAndSendAlgoTransaction = async function (
  txIn: ISignAndSendAlgoParameters
): Promise<TransactionPublishedData> {
  let txDoneData: TransactionPublishedData = { hash: "" };
  const { wallet, sendAccount, kryptikProvider, algoTx } = txIn;

  let network = networkFromNetworkDb(kryptikProvider.networkDb);
  if (!kryptikProvider.algorandProvider) {
    throw new Error(`Error: Provider not set for ${network.fullName}`);
  }
  const algoProvider: AlgodClient = kryptikProvider.algorandProvider;
  console.log("Signing algo tx");
  const { tx, txEncoded } = await SignTransaction(
    algoTx,
    wallet,
    sendAccount,
    network
  );
  console.log("Converting signed algo tx to buffer.");
  const txId: string = tx.txID();
  try {
    console.log("posting algo tx to network");
    const txPostResult = await algoProvider.sendRawTransaction(txEncoded).do();
    console.log("Algorand publish result:");
    console.log(txPostResult);
  } catch (e) {
    console.log("Algorand tx publish failed with error:");
    console.log(e);
    throw new Error(`Unable to publish ${network.fullName} transaction.`);
  }

  txDoneData.hash = txId;
  // set tx. explorer path
  const txExplorerPath: string | null = getTransactionExplorerPath(
    kryptikProvider.networkDb,
    txDoneData
  );
  txDoneData.explorerPath = txExplorerPath
    ? txExplorerPath
    : txDoneData.explorerPath;
  return txDoneData;
};

export async function createAlgoTransferTransaction(
  txIn: AlgoTransactionParams
): Promise<KryptikTransaction> {
  if (!txIn.kryptikProvider.algorandProvider)
    throw new Error(
      `No provider set for ${txIn.tokenAndNetwork.baseNetworkDb.fullName}. Unable to create transaction.`
    );
  const algorProvider = txIn.kryptikProvider.algorandProvider;
  let amountAlgo: number = multByDecimals(
    txIn.valueAlgo,
    txIn.decimals
  ).asNumber;

  const networkParams = await algorProvider.getTransactionParams().do();

  const algoTx: AlgoTransaction = makePaymentTxnWithSuggestedParamsFromObject({
    from: txIn.sendAccount,
    to: txIn.toAddress,
    amount: amountAlgo,
    suggestedParams: networkParams,
  });

  const kryptikFeeData = await getFeeDataAlgorand({
    kryptikProvider: txIn.kryptikProvider,
    tokenPriceUsd: txIn.tokenPriceUsd,
    networkDb: txIn.tokenAndNetwork.baseNetworkDb,
  });

  // create krptik tx. object
  let kryptikTxParams: IKryptikTxParams = {
    feeData: kryptikFeeData,
    kryptikTx: {
      algoTx: algoTx,
    },
    txType: TxType.TransferNative,
    tokenAndNetwork: txIn.tokenAndNetwork,
    tokenPriceUsd: txIn.tokenPriceUsd,
    kryptikProvider: txIn.kryptikProvider,
  };

  const kryptikTx: KryptikTransaction = new KryptikTransaction(kryptikTxParams);
  return kryptikTx;
}

export async function createAlgoTokenTransferTransaction(
  txIn: AlgoTransactionParams
): Promise<KryptikTransaction> {
  if (!txIn.kryptikProvider.algorandProvider)
    throw new Error(
      `No provider set for ${txIn.tokenAndNetwork.baseNetworkDb.fullName}. Unable to create transaction.`
    );
  if (!txIn.tokenParamsAlgo) {
    throw new Error(
      `No token params set for ${txIn.tokenAndNetwork.baseNetworkDb.fullName}. Unable to create transaction.`
    );
  }
  // similar to a contract address on other networks
  const assetID: number = Number(txIn.tokenParamsAlgo.contractAddress);
  const algorProvider = txIn.kryptikProvider.algorandProvider;
  let amountAlgo: number = multByDecimals(
    txIn.valueAlgo,
    txIn.decimals
  ).asNumber;

  const networkParams = await algorProvider.getTransactionParams().do();

  const revocationTarget = undefined;
  const closeRemainderTo = undefined;
  const note = undefined;

  const algoTx: AlgoTransaction = makeAssetTransferTxnWithSuggestedParams(
    txIn.sendAccount,
    txIn.toAddress,
    closeRemainderTo,
    revocationTarget,
    amountAlgo,
    note,
    assetID,
    networkParams
  );

  const kryptikFeeData = await getFeeDataAlgorand({
    kryptikProvider: txIn.kryptikProvider,
    tokenPriceUsd: txIn.tokenPriceUsd,
    networkDb: txIn.tokenAndNetwork.baseNetworkDb,
  });

  // create krptik tx. object
  let kryptikTxParams: IKryptikTxParams = {
    feeData: kryptikFeeData,
    kryptikTx: {
      algoTx: algoTx,
    },
    txType: TxType.TransferNative,
    tokenAndNetwork: txIn.tokenAndNetwork,
    tokenPriceUsd: txIn.tokenPriceUsd,
    kryptikProvider: txIn.kryptikProvider,
  };

  const kryptikTx: KryptikTransaction = new KryptikTransaction(kryptikTxParams);
  return kryptikTx;
}

export type AlgoSignResult = {
  tx: AlgoTransaction;
  txEncoded: Uint8Array;
};
// adds signature to a single sol tx
export async function SignTransaction(
  txAlgo: AlgoTransaction,
  wallet: IWallet,
  sendAccount: string,
  network: Network
): Promise<AlgoSignResult> {
  // create transaction parameters
  const kryptikTxParams: TransactionParameters = {
    transactionBuffer: txAlgo.bytesToSign(),
  };
  // sign sol transaction
  const signature = await wallet.seedLoop.signTransaction(
    sendAccount,
    kryptikTxParams,
    network
  );
  // ensure signature was created
  if (!signature.algorandFamilyTx) {
    throw new Error(
      `Error: Unable to create signature for ${network.fullName} transaction`
    );
  }
  const signedBufferTx = txAlgo.attachSignature(
    sendAccount,
    Buffer.from(signature.algorandFamilyTx)
  );

  return { tx: txAlgo, txEncoded: signedBufferTx };
}
