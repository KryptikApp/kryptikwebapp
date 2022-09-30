import { TransactionRequest } from "@ethersproject/abstract-provider";
import { BigNumber, Contract } from "ethers";
import { IBuildSwapParams } from "../..";
import { ETH_CONTRACT_ADDRESS, EVM_NULL_ADDRESS } from "../../../../constants/evmConstants";
import { formatTicker, isEVMTxTypeTwo, isLayerOne, isNativeToken } from "../../../../helpers/utils/networkUtils";
import { IBigNumber, multByDecimals, roundToDecimals } from "../../../../helpers/utils/numberUtils";
import { IKryptikTxParams, KryptikTransaction } from "../../../../models/transactions";
import { TokenAndNetwork } from "../../../../services/models/token";
import { isValidHopBridge } from "../../utils";
import { hopAddresses, relayableChains, relayerFeeEnabled } from "./config";
import hopAbiJSON from "../../../../abis/hopProtocolL1_Bridge.json"
import TransactionFeeData, { TxType } from "../../../../services/models/transaction";
import { getTransactionFeeDataEVM } from "../../../fees/EVMFees";
import { ISwapData } from "../../../../parsers/0xData";
import { parseUnits } from "ethers/lib/utils";

export interface IBuildHopBridgeParams extends IBuildSwapParams{
    // empty for now
  }

export async function BuildHopBridgeTransaction(params:IBuildHopBridgeParams):Promise<KryptikTransaction|null>{
    const {tokenAmount, sellTokenAndNetwork, buyTokenAndNetwork, fromAccount, kryptikProvider, sellNetworkTokenPriceUsd, baseCoinPrice, slippage} = {...params};
    // fetch 0x swap data
    let tokenDecimals:number = sellTokenAndNetwork.tokenData?sellTokenAndNetwork.tokenData.tokenDb.decimals:sellTokenAndNetwork.baseNetworkDb.decimals;
    let swapAmount = multByDecimals(tokenAmount, tokenDecimals);
    // use address for token and symbol for base network coin. Will return undefined if token and network selected address is undefined
    let sellTokenId:string|undefined = sellTokenAndNetwork.tokenData?sellTokenAndNetwork.tokenData.selectedAddress:ETH_CONTRACT_ADDRESS;
    const buyTokenId:string|undefined = buyTokenAndNetwork.tokenData?buyTokenAndNetwork.tokenData.selectedAddress:ETH_CONTRACT_ADDRESS;
    // ensure we have required params for Hop Bridge
    if(!sellTokenId || !buyTokenId || !sellTokenAndNetwork.baseNetworkDb.evmData) return null;
    // must be different networks
    if(sellTokenAndNetwork.baseNetworkDb.ticker == buyTokenAndNetwork.baseNetworkDb.ticker) return null;
    // check if valid network combo
    let isValidSwap = isValidHopBridge(buyTokenAndNetwork, sellTokenAndNetwork);
    if(!isValidSwap) return null;
    const chainIdEVM = sellTokenAndNetwork.baseNetworkDb.evmData.chainId;

    // TODO: Add sufficient bonder liquidity check... skipping for now
    // TODO: ensure recipient address is ok... currently ASSUMING it is

    const isSellOnLayerOne:boolean = isLayerOne(sellTokenAndNetwork.baseNetworkDb);
    const isBuyOnLayerOne:boolean = isLayerOne(buyTokenAndNetwork.baseNetworkDb);

    let tx:TransactionRequest;
    if(isSellOnLayerOne && !isBuyOnLayerOne){
      // TODO: try, catch populate error?
      tx = await populateHopBridgeL1ToL2(params)
    }
    else{
      // TODO: throw invalid pair error?
      return null;
    }

    if(!kryptikProvider.ethProvider){
      throw(new Error(`Error: No EVM provider specified for: ${sellTokenAndNetwork.baseNetworkDb}`));
    };
    // get basic tx metadata
    let evmProvider = kryptikProvider.ethProvider;
    const accountNonce = await evmProvider.getTransactionCount(fromAccount, "latest");
    const kryptikFeeData:TransactionFeeData = await getTransactionFeeDataEVM({tx:tx, kryptikProvider:kryptikProvider, tokenPriceUsd:baseCoinPrice, networkDb:sellTokenAndNetwork.baseNetworkDb});
    tx.from = fromAccount;
    tx.chainId = chainIdEVM;
    tx.nonce = accountNonce;
    tx.gasLimit =  kryptikFeeData.EVMGas.gasLimit;
    if(isEVMTxTypeTwo(sellTokenAndNetwork.baseNetworkDb)){
        tx.maxFeePerGas = kryptikFeeData.EVMGas.maxFeePerGas;
        tx.maxPriorityFeePerGas = kryptikFeeData.EVMGas.maxPriorityFeePerGas;
        tx.type = 2;
    }
    else{
        tx.gasPrice = kryptikFeeData.EVMGas.gasPrice;
    }
    // create swap data object
    // buy and sell amounts should be same bc buy/ sell tokens 
    // are the same for hop bridge
    let swapData:ISwapData = {
      buyAmount:swapAmount.asString,
      buyTokenAddress:buyTokenId,
      sellTokenAddress:sellTokenId,
      sellAmount: swapAmount.asString,
      chainId: sellTokenAndNetwork.baseNetworkDb.chainId,
      //TODO: add guaranteed price
      price:"",
      guaranteedPrice: "",
      minimumProtocolFee:0,
      protocolFee:"0",
      sources:[{name:"Hop bridge", proportion:"1"}],
      evmData: {
        gas: kryptikFeeData.EVMGas.gasLimit.toString(),
        gasPrice: kryptikFeeData.EVMGas.gasPrice.toString(),
        estimatedGas: kryptikFeeData.EVMGas.gasLimit.toString(),
        // todo: make these params optional
        to: tx.to||"",
        value: tx.value?tx.value.toString():"0",
        data: tx.data?tx.data.toString():"",
        sellTokenToEthRate: "0",
        allowanceTarget: tx.to?tx.to:""
      }
    }
    let kryptikTxParams:IKryptikTxParams = {
        feeData: kryptikFeeData,
        swapData: {
            ...swapData,
            sellTokenAndNetwork: sellTokenAndNetwork,
            buyTokenAndNetwork: buyTokenAndNetwork
        },
        kryptikTx:{
            evmTx:tx
        },
        txType: TxType.Swap,
        tokenAndNetwork: sellTokenAndNetwork,
        //TODO: UPDATE TO ADD BASE NETWORK PRICE
        tokenPriceUsd: sellNetworkTokenPriceUsd,
    }
    let kryptikTx:KryptikTransaction = new KryptikTransaction(kryptikTxParams);
    return kryptikTx;
    // placeholder...remove when done
    return null;
}





// values we need.... amount, recipient, chainId, amountOutMin!, deadline!, relayer!, relayerFee!

// TODO: add l2->l1 bridge functionality

// function populateHopBridgeTxL2ToL1(params:IBuildHopBridgeParams):TransactionRequest{
//   const {tokenAmount, sellTokenAndNetwork, buyTokenAndNetwork, fromAccount, kryptikProvider, sellNetworkTokenPriceUsd, baseCoinPrice, slippage} = {...params};
//   if(isLayerOne(sellTokenAndNetwork.baseNetworkDb)){
//     // L1 -> L1... not allowed!
//     if(isLayerOne(buyTokenAndNetwork.baseNetworkDb)){
//       throw new Error('Cannot send from layer 1 to layer 1')
//     }
//     // L1 -> L2
//     const bonderAddress:string|null = getBonderAddress(sellTokenAndNetwork, buyTokenAndNetwork);
//     if(!bonderAddress){
//       throw new Error("Unable to get bonding address for hop transaction. Ensure source and destination networks are valid.")
//     }
//     const relayerFee:BigNumber = getTotalFee(params.sellTokenAndNetwork, params.buyTokenAndNetwork);
//     // hop bridge slippage currently set as default of 3%
//     const slippagePercentage:number = slippage?slippage:.03;
//     // get token amount
//     const tokenDecimals:number = sellTokenAndNetwork.tokenData?sellTokenAndNetwork.tokenData.tokenDb.decimals:sellTokenAndNetwork.baseNetworkDb.decimals;
//     const bridgeAmount:IBigNumber = multByDecimals(tokenAmount, tokenDecimals);
//     const amountOutMin:number = bridgeAmount.asNumber*slippagePercentage;
//     // TODO: allow relayer to be passed in
//     const relayer:string = bonderAddress;
//   }
// }

async function populateHopBridgeL1ToL2(params:IBuildHopBridgeParams):Promise<TransactionRequest>{
  const {tokenAmount, sellTokenAndNetwork, buyTokenAndNetwork, fromAccount, kryptikProvider, sellNetworkTokenPriceUsd, baseCoinPrice, slippage} = {...params};
  if(!isLayerOne(sellTokenAndNetwork.baseNetworkDb)){
    throw new Error("Trying to ru L1-L2 bridge with non-L1 source chain")
  }
  // L1 -> L1... not allowed!
  if(isLayerOne(buyTokenAndNetwork.baseNetworkDb)){
    throw new Error('Cannot send from layer 1 to layer 1')
  }
  if(!buyTokenAndNetwork.baseNetworkDb.evmData){
    throw new Error(`No evm data is specified for ${buyTokenAndNetwork.baseNetworkDb.fullName}`);
  }
  const isSellTokenNative:boolean = isNativeToken(sellTokenAndNetwork);
  // hop bridge slippage currently set as default of 3%
  const slippagePercentage:number = slippage?slippage:.03;
  // get token amount
  const tokenDecimals:number = sellTokenAndNetwork.tokenData?sellTokenAndNetwork.tokenData.tokenDb.decimals:sellTokenAndNetwork.baseNetworkDb.decimals;
  let roundedAmountCrypto:number = roundToDecimals(tokenAmount, tokenDecimals);
  let amountToBridge:BigNumber = parseUnits(roundedAmountCrypto.toString(), tokenDecimals);
  // min amount to receive w/ max slippage
  const minAmountRounded:number = roundToDecimals(tokenAmount-tokenAmount*slippagePercentage, tokenDecimals)
  const amountOutMin:BigNumber = parseUnits(minAmountRounded.toString(), tokenDecimals)
  // set required contract paramters
  // can safely set to zero for now, per: https://docs.hop.exchange/smart-contracts/integration#l1-greater-than-l2
  const destinationChainId:BigNumber = BigNumber.from(buyTokenAndNetwork.baseNetworkDb.evmData?.chainId)
  const relayer:string = EVM_NULL_ADDRESS;
  const relayerFee:BigNumber = BigNumber.from(0);
  // the deadline for the transaction (Recommended - Date.now() + 604800 (1 week))
  const deadline:BigNumber = BigNumber.from(Date.now() + 604800);

  // init contract
  const bridgeAddress:string = getL1BridgeAddress(sellTokenAndNetwork);
  const hopBridgeContract:Contract = new Contract(bridgeAddress, hopAbiJSON);
  
  const txOptions = [
    destinationChainId,
    fromAccount,
    amountToBridge,
    amountOutMin,
    deadline,
    relayer,
    relayerFee,
    {
      value: isSellTokenNative ? BigNumber.from(amountToBridge) : undefined
    }
  ];

  // destructure tx options and populate contract
  const tx:TransactionRequest = await hopBridgeContract.populateTransaction.sendToL2(...txOptions);
  return tx;
}

function getTotalFee(sellTokenAndNetwork:TokenAndNetwork, buyTokenAndNetwork:TokenAndNetwork):BigNumber{
  const isSourceChainLayerOne:boolean = isLayerOne(sellTokenAndNetwork.baseNetworkDb);
  const sellNetworkName = getHopNetworkName(sellTokenAndNetwork.baseNetworkDb.fullName);
  const buyNetworkName = getHopNetworkName(buyTokenAndNetwork.baseNetworkDb.fullName);
  const isDestinationRelayable:boolean = relayableChains.includes(buyNetworkName);
  // TODO: get destinationTxFee 
  const destinationTxFee:BigNumber = BigNumber.from(0)

  // initialize fee valus w/ default zero
  let adjustedBonderFee:BigNumber = BigNumber.from(0)
  let adjustedDestinationTxFee:BigNumber = BigNumber.from(0)
  let totalFee:BigNumber = BigNumber.from(0)
  // l1 => l2... not relayable
  if(isSourceChainLayerOne && !isDestinationRelayable){
    adjustedBonderFee = BigNumber.from(0)
    adjustedDestinationTxFee = BigNumber.from(0)
    totalFee = BigNumber.from(0);
  }
  // l1 => l2... relayable
  // right now, only arbitrum is relayable and fee = 0
  // TODO: update if relayable changes
  else if(isSourceChainLayerOne && isDestinationRelayable){
    adjustedBonderFee = BigNumber.from(0)
    adjustedDestinationTxFee = destinationTxFee
    totalFee = adjustedBonderFee.add(adjustedDestinationTxFee)
  }
  // l2 => l1
  else{
    // TODO: add fee structure
    // pass for now
  }
  return totalFee;
}

function isRelayerFeeEnabled(networkName:string):boolean{
   switch(networkName){
    case("optimism"):{
      return relayerFeeEnabled.optimism
    }
    case("polygon"):{
      return relayerFeeEnabled.polygon
    }
    case("arbitrum"):{
      return relayerFeeEnabled.arbitrum
    }
    default:{
      return false;
    }
   }
}

/**
 * Returns contract address for Ethereum -> L2 bridge. Unique contract for each token
 */
function getL1BridgeAddress(sellTokenAndNetwork:TokenAndNetwork){
  // format token ticker
  const tokenTicker = sellTokenAndNetwork.tokenData?formatTicker(sellTokenAndNetwork.tokenData.tokenDb.symbol):formatTicker(sellTokenAndNetwork.baseNetworkDb.ticker);
  // get corresponding bridge address
  const allBridges:Record<string, any> = hopAddresses.bridges;
  const bridgeAddy = allBridges[tokenTicker]?.ethereum.l1Bridge;
  return bridgeAddy;
}

function getBonderAddress(sellTokenAndNetwork:TokenAndNetwork, buyTokenAndNetwork:TokenAndNetwork):string|null{
  const tokenTicker = sellTokenAndNetwork.tokenData?formatTicker(sellTokenAndNetwork.tokenData.tokenDb.symbol):formatTicker(sellTokenAndNetwork.baseNetworkDb.ticker);
  // format network name for hop address config schema
  const sellNetworkName = getHopNetworkName(sellTokenAndNetwork.baseNetworkDb.fullName);
  const buyNetworkName = getHopNetworkName(buyTokenAndNetwork.baseNetworkDb.fullName);
  // get corresponding bonder
  const allBonders:Record<string, any> = hopAddresses.bonders;
  const bonderAddress = allBonders[tokenTicker]?.[sellNetworkName]?.[buyNetworkName];
  // ensure address is defined
  if(!bonderAddress) return null;
  // ensure we are returning a string
  if(typeof bonderAddress != "string"){
    return null;
  }
  // if type checks have passed, return value!
  return bonderAddress;
}

function getHopNetworkName(name:string){
  if(name.includes("arbitrum")){
    name = "arbitrum";
  }

  if(name.includes("optimism")){
    name = "optimism";
  }

  if(name.includes("polygon")){
    name = "polygon";
  }
  return name.toLowerCase();
}

