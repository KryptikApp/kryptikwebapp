import { INetworkFeeDataParams } from ".";
import { KryptikProvider } from "../../services/models/provider";
import TransactionFeeData, {
  defaultEVMGas,
} from "../../services/models/transaction";

export interface IFeeDataAlgoParams extends INetworkFeeDataParams {}

const DEFAULT_ALGO_FEE = 0.001;

export async function getFeeDataAlgorand(params: IFeeDataAlgoParams) {
  let kryptikProvider: KryptikProvider = params.kryptikProvider;
  // validate provider
  if (!kryptikProvider.algorandProvider) {
    throw new Error(
      `Error: No provider specified for ${kryptikProvider.network.fullName}`
    );
  }
  const feeInAlgo: number = DEFAULT_ALGO_FEE;
  const feeInUsd: number = params.tokenPriceUsd * feeInAlgo;
  let transactionFeeData: TransactionFeeData = {
    network: kryptikProvider.network,
    isFresh: true,
    lowerBoundCrypto: feeInAlgo,
    lowerBoundUSD: feeInUsd,
    upperBoundCrypto: feeInAlgo,
    upperBoundUSD: feeInUsd,
    EVMGas: defaultEVMGas,
  };
  return transactionFeeData;
}
