// import { asL2Provider } from "@eth-optimism/sdk";
import { JsonRpcProvider } from "@ethersproject/providers";
import { BigNumber } from "ethers";
import { INetworkFeeDataParams } from ".";
import {
  isEVMTxTypeTwo,
  networkFromNetworkDb,
} from "../../helpers/utils/networkUtils";
import { divByDecimals } from "../../helpers/utils/numberUtils";
import { NetworkDb } from "../../services/models/network";
import TransactionFeeData, {
  EVMGas,
  TransactionRequest,
} from "../../services/models/transaction";

export interface FeeDataEvmParameters extends INetworkFeeDataParams {
  tx: TransactionRequest;
}

// gets gas limit for basic transfer
export function getEVMTransferGasLimit(network: NetworkDb) {
  switch (network.ticker.toLowerCase()) {
    case "eth(arbitrum)": {
      return 500000;
    }
    case "eth(optimism)": {
      return 21000;
    }
    default: {
      return 21000;
    }
  }
}

export interface IEVMGasLimitsParams extends EVMGas {
  tokenPriceUsd: number;
  networkDb: NetworkDb;
}

// calculates the fee data for a given transaction
export async function getTransactionFeeDataEVM(params: FeeDataEvmParameters) {
  const { kryptikProvider, tx, networkDb } = { ...params };
  // validate provider
  if (!kryptikProvider.ethProvider) {
    throw new Error(
      `No provider specified for ${kryptikProvider.network.fullName}`
    );
  }
  let ethNetworkProvider: JsonRpcProvider = kryptikProvider.ethProvider;

  const feeData = await ethNetworkProvider.getFeeData();
  let gasLimit: BigNumber;
  try {
    gasLimit = await ethNetworkProvider.estimateGas(tx);
  } catch (e) {
    // if the node is unable to estimate the gas limit, do so manually
    // TODO: switch manual transaction estimate based on tx type
    gasLimit = BigNumber.from(330000);
  }
  let gasLimitAsNum = gasLimit.toNumber();
  // validate fee data response
  if (
    !feeData.maxFeePerGas ||
    !feeData.maxPriorityFeePerGas ||
    !feeData.gasPrice
  ) {
    // some networks like arbitrum uses pre EIP-1559 fee structure
    if (!isEVMTxTypeTwo(networkDb)) {
      let baseGas = await ethNetworkProvider.getGasPrice();
      feeData.gasPrice = baseGas;
      feeData.maxFeePerGas = baseGas;
      feeData.maxPriorityFeePerGas = BigNumber.from(0);
    } else {
      throw new Error(
        `No fee data returned for ${kryptikProvider.network.fullName}`
      );
    }
  }

  let EVMGasLimitsParams: IEVMGasLimitsParams = {
    gasLimit: gasLimit,
    // gasprice used for type 1 tx.s
    gasPrice: feeData.gasPrice,
    // max fee per gas and max priority fee per gas... used for type 2 txs
    maxFeePerGas: feeData.maxFeePerGas,
    maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
    // network w/ tx fee
    networkDb: kryptikProvider.networkDb,
    // current price of base network coin
    tokenPriceUsd: params.tokenPriceUsd,
  };

  // create new fee data object
  let transactionFeeData: TransactionFeeData =
    evmFeeDataFromLimits(EVMGasLimitsParams);
  // optimism layer two solution has unique gas cost calculation
  // if (networkDb.ticker == "eth(optimism)") {
  //   let optismismProvider = asL2Provider(ethNetworkProvider);
  //   let optimismTotalGasCost: number = (
  //     await optismismProvider.estimateTotalGasCost(tx)
  //   ).toNumber();
  //   // format in crypto amount
  //   optimismTotalGasCost = divByDecimals(
  //     optimismTotalGasCost,
  //     networkDb.decimals
  //   ).asNumber;
  //   let optimismFeeFiat = optimismTotalGasCost * params.tokenPriceUsd;
  //   transactionFeeData.upperBoundUSD = optimismFeeFiat;
  //   transactionFeeData.lowerBoundUSD = optimismFeeFiat;
  // }
  console.log(`${params.networkDb.fullName} fee data:`);
  console.log(transactionFeeData);
  return transactionFeeData;
}

// calculate u.i. fee data from network fee limits
export function evmFeeDataFromLimits(
  params: IEVMGasLimitsParams
): TransactionFeeData {
  let {
    gasLimit,
    gasPrice,
    maxFeePerGas,
    maxPriorityFeePerGas,
    tokenPriceUsd,
    networkDb,
  } = { ...params };
  // calculate u.i. fees in token amount
  let gasPriceConverted: number = divByDecimals(
    Number(params.gasPrice),
    networkDb.decimals
  ).asNumber;
  console.log(gasPriceConverted);
  let maxPriorityFeePerGasConverted: number = divByDecimals(
    Number(maxPriorityFeePerGas),
    networkDb.decimals
  ).asNumber;

  let lowerBoundCrypto: number = Number(gasLimit) * gasPriceConverted;
  let lowerBoundUSD: number = lowerBoundCrypto * tokenPriceUsd;
  let upperBoundCrypto: number =
    Number(gasLimit) * (gasPriceConverted + maxPriorityFeePerGasConverted);
  let upperBoundUsd: number = upperBoundCrypto * tokenPriceUsd;

  let network = networkFromNetworkDb(networkDb);
  // create new fee data object
  let transactionFeeData: TransactionFeeData = {
    network: network,
    isFresh: true,
    lowerBoundCrypto: lowerBoundCrypto,
    lowerBoundUSD: lowerBoundUSD,
    upperBoundCrypto: upperBoundCrypto,
    upperBoundUSD: upperBoundUsd,
    EVMGas: {
      // add inputs in original wei amount
      gasLimit: gasLimit,
      gasPrice: gasPrice,
      maxFeePerGas: maxFeePerGas,
      maxPriorityFeePerGas: maxPriorityFeePerGas,
    },
  };
  return transactionFeeData;
}
