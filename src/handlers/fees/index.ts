import { Transaction } from "@solana/web3.js";
import { Network, NetworkFamily } from "hdseedloop";
import { getPriceOfTicker } from "../../helpers/coinGeckoHelper";
import { networkFromNetworkDb } from "../../helpers/utils/networkUtils";
import { NetworkDb } from "../../services/models/network";
import { KryptikProvider } from "../../services/models/provider";
import { TokenData } from "../../services/models/token";
import TransactionFeeData, {
  TransactionRequest,
  TxType,
} from "../../services/models/transaction";
import { getTransactionFeeDataEVM } from "./EVMFees";
import { getTransactionFeeDataNear } from "./NearFees";
import { getTransactionFeeDataSolana } from "./SolanaFees";

export interface IFeeDataParameters {
  kryptikProvider: KryptikProvider;
  networkDb: NetworkDb;
  sendAccount: string;
  txType: TxType;
  solTx?: Transaction;
  evmTx: TransactionRequest;
  amountToken: string;
}

export interface INetworkFeeDataParams {
  tokenPriceUsd: number;
  networkDb: NetworkDb;
  kryptikProvider: KryptikProvider;
}

// TODO: UPDATE AS BOTH NEAR AND SOLANA WORK FOR GENERAL FEES, EVM ONLY CALCULATES FOR SEND
// gets tx. fee for sending a fungible token
export async function getSendTransactionFeeData(
  params: IFeeDataParameters
): Promise<TransactionFeeData | null> {
  let network: Network = networkFromNetworkDb(params.networkDb);
  let tokenPriceUsd: number = await getPriceOfTicker(
    params.networkDb.coingeckoId
  );
  switch (network.networkFamily) {
    case NetworkFamily.EVM: {
      let transactionFeeData: TransactionFeeData =
        await getTransactionFeeDataEVM({
          kryptikProvider: params.kryptikProvider,
          networkDb: params.networkDb,
          tokenPriceUsd: tokenPriceUsd,
          tx: params.evmTx,
        });
      return transactionFeeData;
      break;
    }
    case NetworkFamily.Solana: {
      if (!params.solTx) return null;
      let transactionFeeData: TransactionFeeData =
        await getTransactionFeeDataSolana({
          kryptikProvider: params.kryptikProvider,
          tokenPriceUsd: tokenPriceUsd,
          transaction: params.solTx,
          networkDb: params.networkDb,
        });
      return transactionFeeData;
      break;
    }
    case NetworkFamily.Near: {
      let transactionFeeData: TransactionFeeData =
        await getTransactionFeeDataNear({
          kryptikProvider: params.kryptikProvider,
          tokenPriceUsd: tokenPriceUsd,
          txType: params.txType,
          networkDb: params.networkDb,
        });
      return transactionFeeData;
      break;
    }
    default: {
      return null;
      break;
    }
  }
}
