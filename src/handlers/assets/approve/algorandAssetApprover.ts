import {
  makeAssetTransferTxnWithSuggestedParams,
  Transaction as AlgoTransaction,
} from "algosdk";
import AlgodClient from "algosdk/dist/types/client/v2/algod/algod";
import {
  IKryptikTxParams,
  KryptikTransaction,
} from "../../../models/transactions";
import { KryptikProvider } from "../../../services/models/provider";
import {
  AlgoTransactionParams,
  TxType,
} from "../../../services/models/transaction";
import { getFeeDataAlgorand } from "../../fees/AlgoFees";

/** Enables interaction with a particular algorand smart contract. Must be done for actions like sending algorand standardized assets. */
export async function createAlgoAprovalTransaction(
  txIn: AlgoTransactionParams
) {
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
  // sending zero tokens
  let amountAlgo: number = 0;
  const networkParams = await algorProvider.getTransactionParams().do();

  const revocationTarget = undefined;
  const closeRemainderTo = undefined;
  const note = undefined;

  // enabling by creating an asset transfer with amount of zero
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
      algoTx: [algoTx],
    },
    txType: TxType.Approval,
    tokenAndNetwork: txIn.tokenAndNetwork,
    tokenPriceUsd: txIn.tokenPriceUsd,
    kryptikProvider: txIn.kryptikProvider,
  };

  const kryptikTx: KryptikTransaction = new KryptikTransaction(kryptikTxParams);

  return kryptikTx;
}

export async function checkAlgoApprovalStatus(params: {
  account: string;
  assetId: number;
  provider: KryptikProvider;
}) {
  const { account, assetId, provider } = { ...params };
  if (!provider.algorandProvider) {
    return false;
  }
  const algoProvider: AlgodClient = provider.algorandProvider;
  try {
    // will throw error if not opted-in
    // returns object of form: asset-holding
    const assetInfo = await algoProvider
      .accountAssetInformation(account, assetId)
      .do();
    if (assetInfo) return true;
    else {
      return false;
    }
  } catch (e) {
    return false;
  }
}
