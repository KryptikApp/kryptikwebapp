import { PublicKey, Transaction } from "@solana/web3.js";



import { IBuildSwapParams } from ".";
import { createEd25519PubKey, createSolTokenAccount } from "../../helpers/utils/accountUtils";
import { multByDecimals } from "../../helpers/utils/numberUtils";
import { IKryptikTxParams, KryptikTransaction } from "../../models/transactions";
import { TOKENS } from "../../helpers/DEXs/raydium/tokens";
import { isSwapAvailable} from "./utils";
import { ISwapData } from "../../parsers/0xData";
import TransactionFeeData, { TxType } from "../../services/models/transaction";
import { getTransactionFeeDataSolana } from "../fees/SolanaFees";
import { getOneSolSwapTransactions, IOneSOlSwapInfo } from "../../helpers/DEXs/1Sol";

export interface IBuildSolSwapParams extends IBuildSwapParams{
    // empty for now
}
  
export async function BuildSolSwapTransaction(params:IBuildSolSwapParams):Promise<KryptikTransaction|null>{
    let {tokenAmount, sellTokenAndNetwork, buyTokenAndNetwork, fromAccount, kryptikProvider, sellNetworkTokenPriceUsd, slippage} = {...params};
    if(!kryptikProvider.solProvider) return null;
    // if slippage is not specified, default to .03
    if(!slippage){
      slippage = .03
    }
    console.log(`Building swap tx. for account with address: ${fromAccount}`);
    // ensure swap is valid
    let isValidSwap = isSwapAvailable(buyTokenAndNetwork, sellTokenAndNetwork);
    if(!isValidSwap) return null;
    
    // token decimals 
    let sellTokenDecimals:number = sellTokenAndNetwork.tokenData?sellTokenAndNetwork.tokenData.tokenDb.decimals:TOKENS.WSOL.decimals;
    let buyTokenDecimals:number = buyTokenAndNetwork.tokenData?buyTokenAndNetwork.tokenData.tokenDb.decimals:TOKENS.WSOL.decimals;


    // TODO: UPDATE TO SUPPORT NATIVE MINT ON TESTNETS
    // GET TOKEN MINT OR DEFAULT TO WSOL 
    let sellTokenAddress:string = sellTokenAndNetwork.tokenData?.selectedAddress?sellTokenAndNetwork.tokenData.selectedAddress:TOKENS.WSOL.mintAddress;
    let buyTokenAddress:string = buyTokenAndNetwork.tokenData?.selectedAddress?buyTokenAndNetwork.tokenData.selectedAddress:TOKENS.WSOL.mintAddress;

    // adjusted token amounts
    let sellTokenAmount = multByDecimals(tokenAmount, sellTokenDecimals);
    // GET ONESOL SWAP TX/DATA
    let oneSolSwapInfo:IOneSOlSwapInfo|null = await getOneSolSwapTransactions({kryptikProvider:kryptikProvider, sellTokenAddress:sellTokenAddress, buyTokenAddress:buyTokenAddress, 
    accountAddress:fromAccount, slippage:slippage, amountSellToken:sellTokenAmount.asNumber});
    // if we weren't able to get swap tx then... return null
    if(!oneSolSwapInfo) return null;
    console.log("1sol swap info:");
    console.log(oneSolSwapInfo);
    let buyTokenAmount = oneSolSwapInfo.selectedRoute.amountOut;
  
    // token pubkeys
    let sellTokenPubKey = createEd25519PubKey(sellTokenAddress);
    let buyTokenPubKey = createEd25519PubKey(buyTokenAddress);

    // respective token accounts for wallet trying to swap
    let sellTokenAccount:PublicKey = await createSolTokenAccount(fromAccount, sellTokenAddress);
    let buyTokenAccount:PublicKey = await createSolTokenAccount(fromAccount, buyTokenAddress);
    // wallet account public key
    let accountPubKey:PublicKey = new PublicKey(fromAccount);

    //add required tx. metadata
    let lastBlockHash = await kryptikProvider.solProvider.getLatestBlockhash('finalized');
    let dummyTx:Transaction = new Transaction();
    for(const tx of oneSolSwapInfo.transactions){
      // roll tx into single dummy tx used for fee calc
      console.log(tx);
      dummyTx.add(tx);
    }
    dummyTx.recentBlockhash = lastBlockHash.blockhash;
    dummyTx.feePayer = accountPubKey;
    console.log("Swapper pub key:");
    console.log(accountPubKey);

    // create swap data from data
    let swapData:ISwapData = {
      buyAmount:buyTokenAmount.toString(),
      buyTokenAddress:buyTokenAddress,
      sellTokenAddress:sellTokenAddress,
      sellAmount: sellTokenAmount.asString,
      chainId: sellTokenAndNetwork.baseNetworkDb.chainId,
      //TODO: add guaranteed price
      price:"",
      guaranteedPrice: "",
      minimumProtocolFee:0,
      protocolFee:"0",
      sources:[{name:"1Sol Aggregator", proportion:"1"}]
    }

    // get expected tx fee.. used for UI
    let kryptikFeeData:TransactionFeeData = await getTransactionFeeDataSolana({transaction:dummyTx, kryptikProvider:kryptikProvider,
       tokenPriceUsd:sellNetworkTokenPriceUsd, 
       networkDb:sellTokenAndNetwork.baseNetworkDb});

    // create krptik tx. object
    let kryptikTxParams:IKryptikTxParams = {
      feeData: kryptikFeeData,
      swapData: {
          ...swapData,
          sellTokenAndNetwork: sellTokenAndNetwork,
          buyTokenAndNetwork: buyTokenAndNetwork
      },
      kryptikTx:{
          solTx:oneSolSwapInfo.transactions
      },
      txType: TxType.Swap,
      tokenAndNetwork: sellTokenAndNetwork,
      tokenPriceUsd: sellNetworkTokenPriceUsd,
    }
    let kryptikTx:KryptikTransaction = new KryptikTransaction(kryptikTxParams);
    return kryptikTx;
}




// DEPRECATED: DIRECT RAYDIUM V1 SWAPS.... "JUST IN CASE" PLACEHOLDER

// export async function BuildSolSwapTransaction(params:IBuildSolSwapParams):Promise<KryptikTransaction|null>{
//   let {tokenAmount, sellTokenAndNetwork, buyTokenAndNetwork, fromAccount, kryptikProvider, sellNetworkTokenPriceUsd, slippage} = {...params};
//   if(!kryptikProvider.solProvider) return null;
//   // if slippage is not specified, default to .03
//   if(!slippage){
//     slippage = .03
//   }
//   // ensure swap is valid
//   let isValidSwap = isSwapAvailable(buyTokenAndNetwork.baseNetworkDb, sellTokenAndNetwork.baseNetworkDb);
//   if(!isValidSwap) return null;
//   let transaction:Transaction = new Transaction();
//   // token decimals 
//   let sellTokenDecimals:number = sellTokenAndNetwork.tokenData?sellTokenAndNetwork.tokenData.tokenDb.decimals:sellTokenAndNetwork.baseNetworkDb.decimals;
//   let buyTokenDecimals:number = buyTokenAndNetwork.tokenData?buyTokenAndNetwork.tokenData.tokenDb.decimals:buyTokenAndNetwork.baseNetworkDb.decimals;


//   // TODO: UPDATE TO SUPPORT NATIVE MINT ON TESTNETS
//   // GET TOKEN MINT OR DEFAULT TO WSOL 
//   let sellTokenAddress:string = sellTokenAndNetwork.tokenData?.selectedAddress?sellTokenAndNetwork.tokenData.selectedAddress:TOKENS.WSOL.mintAddress
//   let buyTokenAddress:string = buyTokenAndNetwork.tokenData?.selectedAddress?buyTokenAndNetwork.tokenData.selectedAddress:TOKENS.WSOL.mintAddress

//   // Get pool token info
//   let poolInfo:LiquidityPoolInfo|null = getPoolByTokenMintAddresses(buyTokenAddress, sellTokenAddress);
//   // TODO: UPDATE TO SUPPORT V5 (STABLE SWAPS)
//   if(!poolInfo || poolInfo.version==5) return null;
//   console.log(`Raydium swap pool:`);
//   console.log(poolInfo);

//   // adjusted token amounts
//   let sellTokenAmount = multByDecimals(tokenAmount, sellTokenDecimals);
//   let raydiumCalculatedAmounts = getRaydiumSwapBuyAmount({poolInfo:poolInfo, fromCoinMint:sellTokenAddress, toCoinMint:buyTokenAddress, amountSell:sellTokenAmount.asString, slippage:slippage})
//   // if we weren't able to calculate swap amount then... return null
//   if(!raydiumCalculatedAmounts) return null;
//   let buyTokenAmount = raydiumCalculatedAmounts.amountIn.toWei().toNumber();
  
//   // token pubkeys
//   let sellTokenPubKey = createEd25519PubKey(sellTokenAddress);
//   let buyTokenPubKey = createEd25519PubKey(buyTokenAddress);

//   // respective token accounts for wallet trying to swap
//   let sellTokenAccount:PublicKey = await createSolTokenAccount(fromAccount, sellTokenAddress);
//   let buyTokenAccount:PublicKey = await createSolTokenAccount(fromAccount, buyTokenAddress);
//   // wallet account public key
//   let accountPubKey:PublicKey = new PublicKey(fromAccount);
//   // create respective token accounts if none and not native SOL coin
//   // TODO: UPDATE TO WRAP NATIVE TOKEN SWAP
//   if(sellTokenAddress!=NATIVE_SOL_MINT){
//       const sellTokenAccountInfo = await kryptikProvider.solProvider.getAccountInfo(sellTokenAccount);
//       if(!sellTokenAccountInfo){
//           console.log("Adding create account instruction for sell token");
//           transaction.add(
//               splToken.createAssociatedTokenAccountInstruction(accountPubKey, sellTokenAccount, accountPubKey, sellTokenPubKey)
//           );
//       }
//   }
//   if(buyTokenAddress!=NATIVE_SOL_MINT){
//       const buyTokenAccountInfo = await kryptikProvider.solProvider.getAccountInfo(buyTokenAccount);
//       if(!buyTokenAccountInfo){
//           console.log("Adding create account instruction for buy token");
//           transaction.add(
//               splToken.createAssociatedTokenAccountInstruction(accountPubKey, buyTokenAccount, accountPubKey, buyTokenPubKey)
//           );
//     }
//   }

//   // add serum bids, asks, and event queue
//   let newSwapInstruction:TransactionInstruction = swapInstruction(
//       new PublicKey(poolInfo.programId),
//       new PublicKey(poolInfo.ammId),
//       new PublicKey(poolInfo.ammAuthority),
//       new PublicKey(poolInfo.ammOpenOrders),
//       new PublicKey(poolInfo.ammTargetOrders),
//       new PublicKey(poolInfo.poolCoinTokenAccount),
//       new PublicKey(poolInfo.poolPcTokenAccount),
//       new PublicKey(poolInfo.serumProgramId),
//       new PublicKey(poolInfo.serumMarket),
//       new PublicKey(poolInfo.serumBids),
//       new PublicKey(poolInfo.serumAsks),
//       new PublicKey(poolInfo.serumEventQueue),
//       new PublicKey(poolInfo.serumCoinVaultAccount),
//       new PublicKey(poolInfo.serumPcVaultAccount),
//       new PublicKey(poolInfo.serumVaultSigner),
//       sellTokenAccount,
//       buyTokenAccount,
//       accountPubKey,
//       Math.floor(sellTokenAmount.asNumber),
//       Math.floor(buyTokenAmount)
//   );
//   transaction.add(newSwapInstruction);
  
//   // close wrapped sol buy/sell account if created
//   if(sellTokenAddress == TOKENS.WSOL.mintAddress) {
//     transaction.add(
//       closeAccount(
//         {
//           source: sellTokenAccount,
//           destination: accountPubKey,
//           owner: accountPubKey
//         }
        
//       )
//     )
//   }
//   if(sellTokenAddress == TOKENS.WSOL.mintAddress) {
//     transaction.add(
//       closeAccount({
//         source: buyTokenAccount,
//         destination: accountPubKey,
//         owner: accountPubKey})
//     )
//   }


//   // create swap data from raydium data
//   let swapData:ISwapData = {
//     buyAmount:buyTokenAmount.toString(),
//     buyTokenAddress:buyTokenAddress,
//     sellTokenAddress:sellTokenAddress,
//     sellAmount:sellTokenAmount.toString(),
//     chainId: sellTokenAndNetwork.baseNetworkDb.chainId,
//     //TODO: add guaranteed price
//     price:"",
//     guaranteedPrice: "",
//     minimumProtocolFee:0,
//     protocolFee:"0",
//     sources:[{name:"Raydium", proportion:"1"}]
//   }

//   // get expected tx fee.. used for UI
//   let kryptikFeeData:TransactionFeeData = await getTransactionFeeDataSolana({transaction:transaction, kryptikProvider:kryptikProvider,
//      tokenPriceUsd:sellNetworkTokenPriceUsd, 
//      networkDb:sellTokenAndNetwork.baseNetworkDb});

//   // create krptik tx. object
//   let kryptikTxParams:IKryptikTxParams = {
//     feeData: kryptikFeeData,
//     swapData: {
//         ...swapData,
//         sellTokenAndNetwork: sellTokenAndNetwork,
//         buyTokenAndNetwork: buyTokenAndNetwork
//     },
//     kryptikTx:{
//         solTx:transaction
//     },
//     tokenAndNetwork: sellTokenAndNetwork,
//     tokenPriceUsd: sellNetworkTokenPriceUsd,
//   }
//   let kryptikTx:KryptikTransaction = new KryptikTransaction(kryptikTxParams);
//   return kryptikTx;
// }



// // calculates corresponding buy token amount when provided pool and sell token amount
// // taken from: https://github.com/raydium-io/raydium-ui/blob/4c1c46bc70b9b8962900d1a0745019c34c588009/src/utils/swap.ts#L285
// function getRaydiumSwapBuyAmount(params:{
//   poolInfo: LiquidityPoolInfo,
//   fromCoinMint: string,
//   toCoinMint: string,
//   amountSell: string,
//   slippage: number
// })
// {
//   const{poolInfo, fromCoinMint, toCoinMint, amountSell, slippage} = {...params}
//   const { coin, pc, fees } = poolInfo
  

//   if (fromCoinMint === coin.mintAddress && toCoinMint === pc.mintAddress) {
//     // coin2pc
//     const fromAmount = new TokenAmount(amountSell, coin.decimals, false)
//     if(!coin.balance || coin.balance.wei || pc.balance ||  ) return null;
//     const denominator = coin.balance.wei.plus(fromAmount.wei)
//     const amountOut = pc.balance.wei.multipliedBy(fromAmount.wei).dividedBy(denominator)
//     // TODO: INVESTIGATE WHY FEE IS NOT PRESENT IN LP DATA
//     let amountOutWithFee:any;
//     if(fees){
//       const { swapFeeNumerator, swapFeeDenominator } = fees
//       amountOutWithFee = amountOut.dividedBy(swapFeeDenominator).multipliedBy(swapFeeDenominator - swapFeeNumerator);
//     }
//     else{
//       console.log("Raydium fees not provided... using original amount out instead of calculating fee adjustment");
//       amountOutWithFee = amountOut;
//     }
//     const amountOutWithSlippage = amountOutWithFee.dividedBy(1 + slippage / 100)

//     const outBalance = pc.balance.wei.minus(amountOut)
//     const beforePrice = new TokenAmount(
//       parseFloat(new TokenAmount(pc.balance.wei, pc.decimals).fixed()) /
//         parseFloat(new TokenAmount(coin.balance.wei, coin.decimals).fixed()),
//       pc.decimals,
//       false
//     )
//     const afterPrice = new TokenAmount(
//       parseFloat(new TokenAmount(outBalance, pc.decimals).fixed()) /
//         parseFloat(new TokenAmount(denominator, coin.decimals).fixed()),
//       pc.decimals,
//       false
//     )
//     const priceImpact =
//       ((parseFloat(beforePrice.fixed()) - parseFloat(afterPrice.fixed())) / parseFloat(beforePrice.fixed())) * 100

//     return {
//       amountIn: fromAmount,
//       amountOut: new TokenAmount(amountOutWithFee, pc.decimals),
//       amountOutWithSlippage: new TokenAmount(amountOutWithSlippage, pc.decimals),
//       priceImpact
//     }
//   } else {
//     // pc2coin
//     const fromAmount = new TokenAmount(amountSell, pc.decimals, false)
//     const denominator = pc.balance.wei.plus(fromAmount.wei)
//     const amountOut = coin.balance.wei.multipliedBy(fromAmount.wei).dividedBy(denominator)
//     const amountOutWithFee = amountOut.dividedBy(swapFeeDenominator).multipliedBy(swapFeeDenominator - swapFeeNumerator)
//     const amountOutWithSlippage = amountOutWithFee.dividedBy(1 + slippage / 100)

//     const outBalance = coin.balance.wei.minus(amountOut)

//     const beforePrice = new TokenAmount(
//       parseFloat(new TokenAmount(pc.balance.wei, pc.decimals).fixed()) /
//         parseFloat(new TokenAmount(coin.balance.wei, coin.decimals).fixed()),
//       pc.decimals,
//       false
//     )
//     const afterPrice = new TokenAmount(
//       parseFloat(new TokenAmount(denominator, pc.decimals).fixed()) /
//         parseFloat(new TokenAmount(outBalance, coin.decimals).fixed()),
//       pc.decimals,
//       false
//     )
//     const priceImpact =
//       ((parseFloat(afterPrice.fixed()) - parseFloat(beforePrice.fixed())) / parseFloat(beforePrice.fixed())) * 100

//     return {
//       amountIn: fromAmount,
//       amountOut: new TokenAmount(amountOutWithFee, coin.decimals),
//       amountOutWithSlippage: new TokenAmount(amountOutWithSlippage, coin.decimals),
//       priceImpact
//     }
//   }
// }





