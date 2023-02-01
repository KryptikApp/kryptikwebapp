import { BigNumber, BigNumberish, Contract } from "ethers";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import { IBuildSwapParams } from ".";
import { erc20Abi } from "../../abis/erc20Abi";
import { ETH_CONTRACT_ADDRESS } from "../../constants/evmConstants";
import { getNetworkChainId } from "../../helpers/assets";
import { getPriceOfTicker } from "../../helpers/coinGeckoHelper";
import { isEVMTxTypeTwo } from "../../helpers/utils/networkUtils";
import {
  multByDecimals,
  roundToDecimals,
} from "../../helpers/utils/numberUtils";
import {
  IKryptikTxParams,
  KryptikTransaction,
} from "../../models/transactions";
import { ISwapData } from "../../parsers/0xData";
import { fetch0xSwapOptions, zeroXParams } from "../../requests/swaps/0xSwaps";
import { KryptikProvider } from "../../services/models/provider";
import { TokenAndNetwork } from "../../services/models/token";
import TransactionFeeData, {
  TransactionRequest,
  TxType,
} from "../../services/models/transaction";
import { getTransactionFeeDataEVM } from "../fees/EVMFees";
import { isSwapAvailable } from "./utils";

export interface IBuildEVMSwapParams extends IBuildSwapParams {
  // empty for now
}

/**
 * Builds a token allowance EVM transaction
 * @param sellTokenAndNetwork token and network
 * @param sendAccount wallet address of person initiating approval
 * @param allowanceTarget address to approve
 * @param maxApproval token denominated amount (NOT in Wei) to approve
 * @param tokenPrice optional price base network coin. Used for fee estimate.
 * @returns signable kryptik tx
 */

export async function BuildEVMTokenApproval(
  sellTokenAndNetwork: TokenAndNetwork,
  kryptikProvider: KryptikProvider,
  sendAccount: string,
  allowanceTarget: string,
  maxApproval: number,
  tokenPrice?: number
): Promise<KryptikTransaction | null> {
  // no need to approve base network coin sell- not part of ERC20 token standard
  if (!sellTokenAndNetwork.tokenData) return null;
  if (!kryptikProvider.ethProvider) {
    throw new Error(
      `Error: No EVM provider specified for: ${sellTokenAndNetwork.baseNetworkDb}`
    );
  }
  // get basic tx metadata
  let evmProvider = kryptikProvider.ethProvider;
  let accountNonce = await evmProvider.getTransactionCount(
    sendAccount,
    "latest"
  );
  let chainIdEVM = getNetworkChainId(sellTokenAndNetwork.baseNetworkDb);
  let contractAddress = sellTokenAndNetwork.tokenData.selectedAddress;
  // ensure address is selected
  if (!contractAddress) return null;
  let tokenDecimals: number = sellTokenAndNetwork.tokenData.tokenDb.decimals;
  let roundedAmountCrypto = roundToDecimals(maxApproval, tokenDecimals);
  // amount in smallest token units
  let approvalAmount: BigNumber = parseUnits(
    roundedAmountCrypto.toString(),
    tokenDecimals
  );
  // build contract
  let erc20Contract = new Contract(contractAddress, erc20Abi);
  if (!erc20Contract) {
    return null;
  }
  erc20Contract = erc20Contract.connect(evmProvider);
  // check if approve amount > new max approve amount
  let allowanceAmount = Number(
    formatUnits(
      await erc20Contract.allowance(sendAccount, allowanceTarget),
      tokenDecimals
    )
  );
  // if we already have a high enough allowance... no need to create token approval tx
  if (allowanceAmount > maxApproval) {
    console.log(
      `Current ${sellTokenAndNetwork.tokenData.tokenDb.name} token allowance is enough. No need for allowance approval transaction.`
    );
    return null;
  }
  let tx: TransactionRequest = await erc20Contract.populateTransaction.approve(
    allowanceTarget,
    approvalAmount
  );
  tx.from = sendAccount;
  tx.chainId = chainIdEVM;
  tx.nonce = accountNonce;
  let tokenPriceUsd: number;
  // set token price for fee data calculation
  if (tokenPrice) {
    tokenPriceUsd = tokenPrice;
  } else {
    let coingeckoId: string = sellTokenAndNetwork.baseNetworkDb.coingeckoId;
    tokenPriceUsd = await getPriceOfTicker(coingeckoId);
  }
  let kryptikFeeData: TransactionFeeData = await getTransactionFeeDataEVM({
    tx: tx,
    kryptikProvider: kryptikProvider,
    tokenPriceUsd: tokenPriceUsd,
    networkDb: sellTokenAndNetwork.baseNetworkDb,
  });
  tx.gasLimit = kryptikFeeData.EVMGas.gasLimit;
  if (isEVMTxTypeTwo(sellTokenAndNetwork.baseNetworkDb)) {
    tx.type = 2;
    tx.maxPriorityFeePerGas = kryptikFeeData.EVMGas.maxPriorityFeePerGas;
    tx.maxFeePerGas = kryptikFeeData.EVMGas.maxFeePerGas;
  } else {
    tx.gasPrice = kryptikFeeData.EVMGas.gasPrice;
  }
  // build kryptik transaction
  let kryptikTxParams: IKryptikTxParams = {
    feeData: kryptikFeeData,
    kryptikTx: {
      evmTx: tx,
    },
    txType: TxType.Approval,
    tokenAndNetwork: sellTokenAndNetwork,
    tokenPriceUsd: tokenPriceUsd,
  };
  let kryptikTx: KryptikTransaction = new KryptikTransaction(kryptikTxParams);
  return kryptikTx;
}

export async function BuildEVMSwapTransaction(
  params: IBuildEVMSwapParams
): Promise<KryptikTransaction | null> {
  const {
    tokenAmount,
    sellTokenAndNetwork,
    buyTokenAndNetwork,
    fromAccount,
    kryptikProvider,
    sellNetworkTokenPriceUsd,
    baseCoinPrice,
    slippage,
  } = { ...params };
  // fetch 0x swap data
  let tokenDecimals: number = sellTokenAndNetwork.tokenData
    ? sellTokenAndNetwork.tokenData.tokenDb.decimals
    : sellTokenAndNetwork.baseNetworkDb.decimals;
  let swapAmount = multByDecimals(tokenAmount, tokenDecimals);
  // use address for token and symbol for base network coin. Will return undefined if token and network selected address is undefined
  let sellTokenId: string | undefined = sellTokenAndNetwork.tokenData
    ? sellTokenAndNetwork.tokenData.selectedAddress
    : ETH_CONTRACT_ADDRESS;
  const buyTokenId: string | undefined = buyTokenAndNetwork.tokenData
    ? buyTokenAndNetwork.tokenData.selectedAddress
    : ETH_CONTRACT_ADDRESS;
  // ensure we have required params for 0x fetch
  if (!sellTokenAndNetwork.baseNetworkDb.zeroXSwapUrl) return null;
  // slippage currently set as default of 3%
  let slippagePercentage: number = slippage ? slippage : 0.03;
  let swapReqParams: zeroXParams = {
    baseUrl: sellTokenAndNetwork.baseNetworkDb.zeroXSwapUrl,
    buyTokenId: buyTokenId,
    sellTokenId: sellTokenId,
    sellAmount: swapAmount.asNumber,
    slippagePercentage: slippagePercentage,
  };
  const swapData: ISwapData | null = await fetch0xSwapOptions(swapReqParams);
  // ensure swap data is present
  if (!swapData || !swapData.evmData) return null;
  if (!kryptikProvider.ethProvider) {
    throw new Error(
      `Error: No EVM provider specified for: ${sellTokenAndNetwork.baseNetworkDb}`
    );
  }
  let evmProvider = kryptikProvider.ethProvider;
  let accountNonce = await evmProvider.getTransactionCount(
    fromAccount,
    "latest"
  );
  let isValidSwap = isSwapAvailable(buyTokenAndNetwork, sellTokenAndNetwork);
  if (!isValidSwap) return null;

  let feeData = await evmProvider.getFeeData();
  // TODO: UPDATE NULL CASE TO BE DEFAULT FEE VALUE?
  let maxFeePerGas: BigNumberish = feeData.maxFeePerGas
    ? feeData.maxFeePerGas
    : BigNumber.from(0);
  let maxPriorityFeePerGas: BigNumberish = feeData.maxPriorityFeePerGas
    ? feeData.maxPriorityFeePerGas
    : BigNumber.from(0);
  // validate fee data response

  if (
    !feeData.maxFeePerGas ||
    !feeData.maxPriorityFeePerGas ||
    !feeData.gasPrice
  ) {
    // some networks use pre EIP-1559 fee structure
    if (isEVMTxTypeTwo(sellTokenAndNetwork.baseNetworkDb)) {
      let baseGas = await evmProvider.getGasPrice();
      feeData.gasPrice = baseGas;
      feeData.maxFeePerGas = baseGas;
      feeData.maxPriorityFeePerGas = BigNumber.from(0);
    } else {
      // throw(new Error(`No fee data returned for ${kryptikProvider.network.fullName}`));
      console.warn(
        `No fee data returned for ${kryptikProvider.network.fullName}`
      );
      return null;
    }
  }
  // add extra gas cushion to estimated gas required

  let tx: TransactionRequest = {
    from: fromAccount,
    to: swapData.evmData.to,
    value: swapData.evmData.value,
    nonce: accountNonce,
    data: swapData.evmData.data,
    chainId: swapData.chainId,
  };
  let kryptikFeeData: TransactionFeeData = await getTransactionFeeDataEVM({
    tx: tx,
    kryptikProvider: kryptikProvider,
    tokenPriceUsd: baseCoinPrice,
    networkDb: sellTokenAndNetwork.baseNetworkDb,
  });
  tx.gasLimit = kryptikFeeData.EVMGas.gasLimit;
  if (isEVMTxTypeTwo(sellTokenAndNetwork.baseNetworkDb)) {
    tx.maxFeePerGas = kryptikFeeData.EVMGas.maxFeePerGas;
    tx.maxPriorityFeePerGas = kryptikFeeData.EVMGas.maxPriorityFeePerGas;
    tx.type = 2;
  } else {
    tx.gasPrice = kryptikFeeData.EVMGas.gasPrice;
  }
  let kryptikTxParams: IKryptikTxParams = {
    feeData: kryptikFeeData,
    swapData: {
      ...swapData,
      sellTokenAndNetwork: sellTokenAndNetwork,
      buyTokenAndNetwork: buyTokenAndNetwork,
    },
    kryptikTx: {
      evmTx: tx,
    },
    txType: TxType.Swap,
    tokenAndNetwork: sellTokenAndNetwork,
    //TODO: UPDATE TO ADD BASE NETWORK PRICE
    tokenPriceUsd: sellNetworkTokenPriceUsd,
  };
  let kryptikTx: KryptikTransaction = new KryptikTransaction(kryptikTxParams);
  return kryptikTx;
}
