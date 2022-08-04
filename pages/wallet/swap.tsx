import { Network, truncateAddress } from 'hdseedloop';
import { toUpper } from 'lodash';
import type { NextPage } from 'next'
import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { AiFillCheckCircle, AiOutlineArrowLeft, AiOutlineArrowRight } from 'react-icons/ai';
import { RiArrowLeftLine, RiSearchLine, RiSwapLine } from 'react-icons/ri';
import Divider from '../../components/Divider';
import { useKryptikAuthContext } from '../../components/KryptikAuthProvider';
import SearchResultItem from '../../components/search/searchResultItem';
import { useKryptikThemeContext } from '../../components/ThemeProvider';
import TxFee from '../../components/transactions/TxFee';
import { getTokenSearchSuggestions } from '../../src/handlers/search/token';
import { ISearchResult } from '../../src/handlers/search/types';
import { BuildSwapTokenTransaction, IBuildSwapParams } from '../../src/handlers/swaps';
import { SwapValidator } from '../../src/handlers/swaps/utils';
import { getPriceOfTicker } from '../../src/helpers/coinGeckoHelper';
import { defaultResolvedAccount } from '../../src/helpers/resolvers/accountResolver';
import { getAddressForNetworkDb } from '../../src/helpers/utils/accountUtils';
import { formatTicker, networkFromNetworkDb } from '../../src/helpers/utils/networkUtils';
import { formatAmountUi, roundCryptoAmount, roundUsdAmount } from '../../src/helpers/utils/numberUtils';
import { KryptikTransaction, SwapAmounts, TxSignatureParams } from '../../src/models/transactions';
import { defaultTokenAndNetwork, defaultUniswapTokenAndNetwork } from '../../src/services/models/network';
import { KryptikProvider } from '../../src/services/models/provider';
import { TokenAndNetwork } from '../../src/services/models/token';
import TransactionFeeData, { AmountTotalBounds, defaultAmountTotalBounds, defaultTxPublishedData, TransactionPublishedData } from '../../src/services/models/transaction';
import { TxProgress } from '../../src/services/types';


const Swap: NextPage = () => {
  const {isDark} = useKryptikThemeContext();
  const {kryptikWallet, kryptikService} = useKryptikAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  
  const [tokenPrice, setTokenPrice] = useState(0);
  const [amountCrypto, setAmountCrypto] = useState("0");
  const [isInputCrypto, setIsInputCrypto] = useState(false);
  const [amountUSD, setAmountUSD] = useState("0");
  const [amountTotalBounds, setAmountTotalbounds] = useState<AmountTotalBounds>(defaultAmountTotalBounds);
  const [sellTokenAndNetwork, setSellTokenAndNetwork] = useState(defaultTokenAndNetwork);
  const [buyTokenAndNetwork, setBuyTokenAndNetwork] = useState(defaultUniswapTokenAndNetwork);
  const [fromAddress, setFromAddress] = useState(kryptikWallet.resolvedEthAccount.address);
  const [toAddress, setToAddress] = useState("");
  const [toResolvedAccount, setToResolvedAccount] = useState(defaultResolvedAccount);
  const [isResolverLoading, setIsResolverLoading] = useState(false);
  const [readableToAddress, setReadableToAddress] = useState("");
  const [readableFromAddress, setReadableFromAddress] = useState("");
  const [showAssetSearch, setShowAssetSearch] = useState(false);
  const [isSearchSellToken, setIsSearchSellToken] = useState(false);
  const [builtTx, setBuiltTx] = useState<KryptikTransaction|null>(null);
  const [swapProgress, setSwapProgress] = useState(TxProgress.Begin);
  // swap validator state
  const defaultSwapValidator = new SwapValidator(defaultTokenAndNetwork);
  const [currentSwapValidator, setCurrentSwapValidator] = useState<SwapValidator>(defaultSwapValidator)
  // swap amount state
  const [swapAmounts, setSwapAmounts] = useState<SwapAmounts|null>(null);
  const [txPubData, setTxPubData] = useState<TransactionPublishedData|null>(defaultTxPublishedData);
  //details state
  const [showDetails, setShowDetails] = useState(false);
  // error state
  const [failureMsg, setFailureMsg] = useState("Unable to complete transaction");



  //search state
  const[query, setQuery] = useState("");

  const[searchresults, setSearchResults] = useState<ISearchResult[]>([]);

  const handleToggleIsCrypto = function(){
    setIsInputCrypto(!isInputCrypto);
  }

  const validateAmount = function():boolean{
    if(amountCrypto == "0"){
      toast.error("Please enter a nonzero amount.");
      setIsLoading(false);
      return false;
    }
    return true;
  }

  const updateTotalBounds = function(feeData:TransactionFeeData){
    let newTotalBounds:AmountTotalBounds = {
      lowerBoundTotalUsd: (Number(amountUSD) + Number(feeData.lowerBoundUSD)).toString(),
      upperBoundTotalUsd: (Number(amountUSD) + Number(feeData.upperBoundUSD)).toString()
    }
    setAmountTotalbounds(newTotalBounds);
  }

  const handleTxDetailsClick = function(){
    let arrowIcon = document.getElementById("arrowDetails");
    if(arrowIcon){
      arrowIcon.classList.toggle("down");
    }
    setShowDetails(!showDetails);
  }

  const handleSwapBuildRequest = async function(){
    setIsLoading(true);
    let isValidAmount = validateAmount();
    if(!isValidAmount) return;
    let kryptikProvider:KryptikProvider = await kryptikService.getKryptikProviderForNetworkDb(sellTokenAndNetwork.baseNetworkDb);
    let swapParams:IBuildSwapParams = {
      sellNetworkTokenPriceUsd: tokenPrice,
      sellTokenAndNetwork: sellTokenAndNetwork,
      buyTokenAndNetwork: buyTokenAndNetwork,
      fromAccount: fromAddress,
      tokenAmount: Number(amountCrypto),
      kryptikProvider: kryptikProvider
    }
    let newBuiltTx = await BuildSwapTokenTransaction(swapParams);
    if(newBuiltTx == null){
      toast.error(`Error building ${toUpper(sellTokenAndNetwork.tokenData?sellTokenAndNetwork.tokenData.tokenDb.symbol:sellTokenAndNetwork.baseNetworkDb.ticker)}-${toUpper(buyTokenAndNetwork.tokenData?buyTokenAndNetwork.tokenData.tokenDb.symbol:buyTokenAndNetwork.baseNetworkDb.ticker)} swap request`)
    }
    else{
      let newSwapAmounts = newBuiltTx.fetchSwapAmounts();
      setSwapAmounts(newSwapAmounts);
      updateTotalBounds(newBuiltTx.feeData);
      setSwapProgress(TxProgress.Rewiew);
    }
    setBuiltTx(newBuiltTx);
    setIsLoading(false);
  }

  const handleCancelTransaction = function(){
    let nw:Network =  networkFromNetworkDb(sellTokenAndNetwork.baseNetworkDb);
    setIsLoading(true);
    setAmountUSD("0");
    setAmountCrypto("0");
    setFromAddress("");
    setToAddress("");
    setAmountTotalbounds(defaultAmountTotalBounds);
    setReadableFromAddress(truncateAddress(kryptikWallet.resolvedEthAccount.address, nw));
    setReadableToAddress("");
    setTxPubData(defaultTxPublishedData);
    setSellTokenAndNetwork(defaultTokenAndNetwork);
    setBuyTokenAndNetwork(defaultTokenAndNetwork);
    setSwapProgress(TxProgress.Begin);
    setIsLoading(false);
  };

  const handleSwapSendRequest = async function(){
    let provider:KryptikProvider = await kryptikService.getKryptikProviderForNetworkDb(sellTokenAndNetwork.baseNetworkDb);
    if(!builtTx || !builtTx.isSwap || !builtTx.swapData || !provider) return;
    setIsLoading(true);
    let signParams:TxSignatureParams = {
      sendAccount:fromAddress,
      kryptikWallet: kryptikWallet,
      kryptikProvider:provider,
      errorHandler: errorHandler
    }
    let newPubData:TransactionPublishedData|null = await builtTx.SignAndSend(signParams)
    setTxPubData(newPubData);
    if(newPubData){
      setSwapProgress(TxProgress.Complete)
    }
    else{
      setSwapProgress(TxProgress.Failure)
    }
    setIsLoading(false);
  }

   // formats and updates usd/ crypto amounts
   const handleAmountChange = function(amountIn:string){
    if(!isInputCrypto) amountIn = amountIn.slice(1);
    let formattedAmount = formatAmountUi(amountIn, sellTokenAndNetwork, !isInputCrypto);
    if(!isInputCrypto){
      // calcaulate token amount from usd input and token price
      let amountToken:string = (Number(formattedAmount)/tokenPrice).toString();
      if(amountToken == "NaN"){
        amountToken = "0"
        formattedAmount = "0"
      }
      setAmountUSD(formattedAmount);
      setAmountCrypto(amountToken);
    }
    // case: user input is denominated in tokens
    else{
      let tokenNumericAmount = Number(formattedAmount);
      // calculate usd amount from token input and token price
      let amountUsd:number = tokenNumericAmount*tokenPrice;
      setAmountUSD(amountUsd.toString());
      setAmountCrypto(formattedAmount);
    } 
   }

    // get price for selected token
    const fetchTokenPrice = async() =>{
      let coingeckoId = sellTokenAndNetwork.tokenData?sellTokenAndNetwork.tokenData.tokenDb.coingeckoId:
      sellTokenAndNetwork.baseNetworkDb.coingeckoId;
      let tokenPriceCoinGecko:number = await getPriceOfTicker(coingeckoId);
      setTokenPrice(tokenPriceCoinGecko);
    }

    // retrieves wallet balances
  const fetchFromAddress = async():Promise<string> =>{
    let accountAddress = await getAddressForNetworkDb(kryptikWallet, sellTokenAndNetwork.baseNetworkDb);
    let network:Network = networkFromNetworkDb(sellTokenAndNetwork.baseNetworkDb);
     // handle empty address
     if(accountAddress == ""){
       toast.error(`Error: no address found for ${sellTokenAndNetwork.baseNetworkDb.fullName}. Please contact the Kryptik team or try refreshing your page.`);
       setFromAddress(kryptikWallet.resolvedEthAccount.address);      
       setReadableFromAddress(truncateAddress(kryptikWallet.resolvedEthAccount.address, network));
       setSellTokenAndNetwork(defaultTokenAndNetwork);
       return kryptikWallet.resolvedEthAccount.address;
     }
     setFromAddress(accountAddress);
     setReadableFromAddress(truncateAddress(accountAddress, network));
     return accountAddress;
  }

  const updateSellToken = function(newTokenAndNetwork:TokenAndNetwork){
    let newSwapValidator:SwapValidator = new SwapValidator(newTokenAndNetwork);
    setCurrentSwapValidator(newSwapValidator);
    setSellTokenAndNetwork(newTokenAndNetwork);
    setShowAssetSearch(false);
  }

  const updateBuyToken = function(newTokenAndNetwork:TokenAndNetwork){
    if(!currentSwapValidator?.isValidSwapPair(newTokenAndNetwork)){
      toast.error(`${toUpper(sellTokenAndNetwork.tokenData?sellTokenAndNetwork.tokenData.tokenDb.symbol:sellTokenAndNetwork.baseNetworkDb.ticker)}-${toUpper(newTokenAndNetwork.tokenData?newTokenAndNetwork.tokenData.tokenDb.symbol:newTokenAndNetwork.baseNetworkDb.ticker)} are not yet supported`)
    }
    else{
      setBuyTokenAndNetwork(newTokenAndNetwork);
    }
    
    setShowAssetSearch(false);
  }

  const setDefaultSearchResults = function(isSellToken:boolean){
    let defaultSearchResults:ISearchResult[];
    if(isSellToken){
      defaultSearchResults = getTokenSearchSuggestions(query, kryptikService.TickerToNetworkDbs, kryptikService.NetworkDbs, kryptikService.tokenDbs, true, updateSellToken);
    }
    else{
      defaultSearchResults = getTokenSearchSuggestions(query, kryptikService.TickerToNetworkDbs, kryptikService.NetworkDbs, kryptikService.tokenDbs, true, updateBuyToken, currentSwapValidator);
    }
    setSearchResults(defaultSearchResults);
  }

  const startAssetSearch = function(isSellToken:boolean){
    setDefaultSearchResults(isSellToken)
    setQuery("");
    setShowAssetSearch(true);
    setIsSearchSellToken(isSellToken);
  }

  // handler passed as parameter into publish tx. method
  const errorHandler = function(message:string, isFatal=false){
    // show failure screen
    // typically used for errors when pushing to blockchain
    if(isFatal){
      setFailureMsg(message);
      setSwapProgress(TxProgress.Failure)
      return;
    }
    toast.error(message);
    handleCancelTransaction();
  }

  const handleQueryChange = async function(newQuery:string){
    setQuery(newQuery);
    if(newQuery == "")
    {
        setDefaultSearchResults(isSearchSellToken);
        return;
    }
    let newSearchResults:ISearchResult[];
    // pass in different onclick function depending on whether we are updating buy or sell token
    if(isSearchSellToken){
      newSearchResults = getTokenSearchSuggestions(query, kryptikService.TickerToNetworkDbs, kryptikService.NetworkDbs, kryptikService.tokenDbs, false, updateSellToken);
    }
    else{
      newSearchResults = getTokenSearchSuggestions(query, kryptikService.TickerToNetworkDbs, kryptikService.NetworkDbs, kryptikService.tokenDbs, false, updateBuyToken, currentSwapValidator);
    }
    setSearchResults(newSearchResults);
  }
  
  // step back through tx. flow
  const handleClickBack = function(){
    switch(swapProgress){
      case(TxProgress.Rewiew):{
        setSwapProgress(TxProgress.Begin);
        break; 
      }
      case(TxProgress.Complete):{
        handleCancelTransaction();
      }
      default:{
        handleCancelTransaction();
      }
    }
  }

    // get data on token/network change
    useEffect(()=>{
      fetchFromAddress();
      fetchTokenPrice();
      handleAmountChange("0");
   }, [sellTokenAndNetwork]);

  return (

    <div className="dark:text-white">
      <Toaster/>
      <div className="h-[20vh]">
          {/* padding div for space between bottom and main elements */}
        </div>
        <div className="max-w-2xl mx-auto px-4 md:px-0 min-h-[100vh]">
          <div className="">

          
            <div className="max-w-[450px] bg-white dark:bg-black mx-auto md:mt-0 rounded-lg h-fit border border-slate-400 dark:border-gray-100 md:overflow-x-hidden overflow-y-auto no-scrollbar">
                {
                swapProgress == TxProgress.Begin &&
                <div className="flex flex-col mt-8 pb-8">

                    <div className="mb-8">
                    <input className="w-full py-2 px-4 text-sky-400 leading-tight focus:outline-none text-6xl text-center bg-transparent" id="amount" placeholder="$0" autoComplete="off" required value={isInputCrypto? `${amountCrypto}`:`$${amountUSD}`} onChange={(e) => handleAmountChange(e.target.value)}/>
                    <div className="mx-auto text-center">
                      <span className="text-slate-400 text-sm inline">{!isInputCrypto? `${roundCryptoAmount(Number(amountCrypto))} ${sellTokenAndNetwork.tokenData?sellTokenAndNetwork.tokenData.tokenDb.symbol:formatTicker(sellTokenAndNetwork.baseNetworkDb.ticker)}`:`$${amountUSD}`}</span>
                      <RiSwapLine className="hover:cursor-pointer inline text-slate-300 ml-2 " onClick={()=>handleToggleIsCrypto()} size="20"/>
                    </div>
                    </div>

                    <div className="flex flex-col w-[80%] max-w-[90%] border rounded mx-auto">
                        <div className="flex flex-row items-center justify-center space-x-4 px-3 rounded hover:bg-gray-100 dark:hover:bg-gray-900 cursor-pointer py-3" onClick={()=>startAssetSearch(true)}>
                          <div className="max-w-[20%] text-gray-500 dark:text-gray-400 font-lg flex-grow text-left">
                          From
                          </div>
                          <div className="">
                              <img className="w-8 h-8 rounded-full inline" src={sellTokenAndNetwork.tokenData?sellTokenAndNetwork.tokenData.tokenDb.logoURI:sellTokenAndNetwork.baseNetworkDb.iconPath} alt={`${sellTokenAndNetwork.baseNetworkDb.fullName} image`}/>
                              {
                                sellTokenAndNetwork.tokenData &&
                                <img className="w-4 h-4 -ml-2 drop-shadow-lg mt-4 rounded-full inline" src={sellTokenAndNetwork.baseNetworkDb.iconPath} alt={`${sellTokenAndNetwork.baseNetworkDb.fullName} secondary image`}/>
                              }
                              <span className="inline text-md pl-2 dark:text-gray-200">{sellTokenAndNetwork.tokenData?sellTokenAndNetwork.tokenData.tokenDb.name:sellTokenAndNetwork.baseNetworkDb.fullName}</span>
                          </div>
                          <div className="flex-grow text-right right-0 text-lg text-gray-500 dark:text-gray-400 float-right">
                            <svg className="h-5 w-5 float-right" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                        <div>
                          {/* <AiOutlineArrowDown className="text-gray-200 pl-2" size="30"/> */}
                          <hr/>
                        </div>
                        <div className="flex flex-row items-center justify-center space-x-4 px-3 rounded hover:bg-gray-100 dark:hover:bg-gray-900 cursor-pointer py-3" onClick={()=>startAssetSearch(false)}>
                          <div className="max-w-[20%] text-gray-500 dark:text-gray-400 font-lg flex-grow text-left">
                          To   
                          </div>
                          <div className="">
                              <img className="w-8 h-8 rounded-full inline" src={buyTokenAndNetwork.tokenData?buyTokenAndNetwork.tokenData.tokenDb.logoURI:buyTokenAndNetwork.baseNetworkDb.iconPath} alt={`${buyTokenAndNetwork.baseNetworkDb.fullName} token image`}/>
                              {
                                buyTokenAndNetwork.tokenData &&
                                <img className="w-4 h-4 -ml-2 drop-shadow-lg mt-4 rounded-full inline" src={buyTokenAndNetwork.baseNetworkDb.iconPath} alt={`${buyTokenAndNetwork.baseNetworkDb.fullName} secondary image`}/>
                              }
                              <span className="inline text-md pl-2 dark:text-gray-200">{buyTokenAndNetwork.tokenData?buyTokenAndNetwork.tokenData.tokenDb.name:buyTokenAndNetwork.baseNetworkDb.fullName}</span>
                          </div>
                          <div className="flex-grow text-right right-0 text-lg text-gray-500 dark:text-gray-400 float-right">
                            <svg className="h-5 w-5 float-right" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                    </div>
                    <div className="mx-auto">
                          <button onClick={()=>handleSwapBuildRequest()} className={`bg-transparent rounded-full hover:bg-sky-400 text-sky-500 font-semibold hover:text-white text-2xl py-2 px-20 ${isLoading?"hover:cursor-not-allowed":""} border border-sky-400 hover:border-transparent my-5`} disabled={isLoading}>      
                                  {
                                          !isLoading?"Review Swap":
                                          <svg role="status" className="inline w-4 h-4 ml-3 text-white animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                          <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB"/>
                                          <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor"/>
                                          </svg>
                                    }
                          </button>
                    </div>
                </div>
                }
                {
                  (swapProgress == TxProgress.Rewiew && builtTx && builtTx.swapData && swapAmounts)&&
                  <div className="flex flex-col pt-2">
                    <div className='flex mb-4'>
                      <div className='flex-1'>
                        <AiOutlineArrowLeft className="ml-2 hover:cursor-pointer" onClick={()=>handleClickBack()} size="25"/>
                      </div>
                      <div className='flex-2'>
                        <h4 className="font-bold text-xl mx-auto content-center dark:text-white">Review Swap</h4>
                      </div>
                      <div className='flex-1'>
                          {/* space filler */}
                      </div>
                    </div>

                    <div className="mb-4">
                    
                    </div>

                    <div className="flex flex-col w-[90%] max-w-[90%] mx-auto">
                        <div className="flex flex-col px-3 rounded space-y-6">
                          <div className="flex flex-row rounded-lg p-2 bg-gray-200 dark:bg-gray-600 ">
                             <div>
                                <img className="w-10 h-10 rounded-full inline" src={sellTokenAndNetwork.tokenData?sellTokenAndNetwork.tokenData.tokenDb.logoURI:sellTokenAndNetwork.baseNetworkDb.iconPath} alt={`${sellTokenAndNetwork.baseNetworkDb.fullName} image`}/>
                                {
                                  sellTokenAndNetwork.tokenData &&
                                  <img className="w-5 h-5 -ml-2 drop-shadow-lg mt-4 rounded-full inline" src={sellTokenAndNetwork.baseNetworkDb.iconPath} alt={`${sellTokenAndNetwork.baseNetworkDb.fullName} secondary image`}/>
                                }
                              </div>
                              <div className="flex-grow text-right pt-1">
                                <span className="text-xl font-semibold text-gray-600 dark:text-gray-200">{formatAmountUi(swapAmounts.sellAmountCrypto.toString(), sellTokenAndNetwork, false)} {formatTicker(sellTokenAndNetwork.tokenData?sellTokenAndNetwork.tokenData.tokenDb.symbol:sellTokenAndNetwork.baseNetworkDb.ticker)}</span>
                              </div>
                          </div>
                          <div className="flex flex-row rounded-lg p-2 bg-gray-200 dark:bg-gray-600 ">
                              <div>
                                <img className="w-10 h-10 rounded-full inline" src={buyTokenAndNetwork.tokenData?buyTokenAndNetwork.tokenData.tokenDb.logoURI:buyTokenAndNetwork.baseNetworkDb.iconPath} alt={`${buyTokenAndNetwork.baseNetworkDb.fullName} token image`}/>
                                {
                                  buyTokenAndNetwork.tokenData &&
                                  <img className="w-5 h-5 -ml-2 drop-shadow-lg mt-4 rounded-full inline" src={buyTokenAndNetwork.baseNetworkDb.iconPath} alt={`${buyTokenAndNetwork.baseNetworkDb.fullName} secondary image`}/>
                                }
                              </div>
                              <div className="flex-grow text-right pt-1">
                                <span className="text-xl font-semibold text-gray-600 dark:text-gray-200">{formatAmountUi(swapAmounts.buyAmountCrypto.toString(), buyTokenAndNetwork, false)} {formatTicker(buyTokenAndNetwork.tokenData?buyTokenAndNetwork.tokenData.tokenDb.symbol:buyTokenAndNetwork.baseNetworkDb.ticker)}</span>
                              </div>
                             
                          </div>
                        </div>
                        <div>
                          
                        </div>
                    </div>
                    {/* transaction data dropdown */}
                    <div className='pt-8 px-2 flex flex-col w-[90%] max-w-[90%] mx-auto'>
                      <div className='flex-col border rounded hover:cursor-pointer hover:dark:bg-[#111112] py-2 px-2' onClick={()=>handleTxDetailsClick()}>
                          <div className="flex flex-row">

                              <div className="text-lg text-slate-600 text-left dark:text-slate-300 pb-1">
                              {
                                showDetails?
                                <p className="text-sm">Transaction Details</p>:
                                <p>Total Cost</p>
                              }
                              </div>
                            
                            
                            <div className="flex-grow text-2xl font-semibold text-slate-600 dark:text-slate-300 flex flex-row-reverse">

                              <div id="arrowDetails" className="mt-1 text-xl rotate font-semibold text-3xl rounded w-5 h-5 flex">
                                <p className="place-self-center">+</p>
                              </div>
                              {
                              !showDetails &&
                                <div className="mr-2">
                                {
                                        (roundUsdAmount(Number(amountTotalBounds.lowerBoundTotalUsd)) == roundUsdAmount(Number(amountTotalBounds.upperBoundTotalUsd)))?
                                        <p className="text-right dark:text-white">{`~ $${roundUsdAmount(Number(amountTotalBounds.upperBoundTotalUsd))}`}</p>:
                                        <p className="text-right dark:text-white">{`$${roundUsdAmount(Number(amountTotalBounds.lowerBoundTotalUsd))}-$${roundUsdAmount(Number(amountTotalBounds.upperBoundTotalUsd))}`}</p>
                                }
                                </div>
                              }
                            </div>
                         </div>
                         {
                          showDetails&&
                          <div className='pt-2 flex flex-col mx-auto'>
                          <div className="flex">
                                <div className="flex-1">
                                  <p className="text-slate-600 text-left dark:text-slate-300">Wallet Used</p>
                                </div>
                                <div className="flex-1 px-1">
                                  <p className="text-right dark:text-white">{readableFromAddress}</p>
                                </div>
                          </div>
                          <div className="flex flex-row">
                                <div className="flex-1">
                                  <p className="text-slate-600 text-left dark:text-slate-300">Blockchain</p>
                                </div>
                                <div className="flex-1 px-1">
                                  <p className="text-right"><span style={{color:`${sellTokenAndNetwork.baseNetworkDb.hexColor}`}} className="font-semibold">{sellTokenAndNetwork.baseNetworkDb.fullName}</span></p>
                                </div>
                          </div>
                          <div className="flex flex-row">
                                <div className="flex-1">
                                  <p className="text-slate-600 text-left dark:text-slate-300">Network Fees</p>
                                </div>
                                <div className="flex-1 px-1">
                                  <div className='text-right'>
                                  <TxFee txFeeData={builtTx.feeData} tokenAndNetwork={sellTokenAndNetwork} feesLoaded={true}/>
                                  </div>
                                </div>
                          </div>
                          <div className="flex flex-row">
                                <div className="flex-1">
                                  <p className="text-slate-600 text-left dark:text-slate-300">Total Amount</p>
                                </div>
                                <div className="flex-1 px-1">
                                  {
                                    (roundUsdAmount(Number(amountTotalBounds.lowerBoundTotalUsd)) == roundUsdAmount(Number(amountTotalBounds.upperBoundTotalUsd)))?
                                    <p className="text-right dark:text-white">{`$${roundUsdAmount(Number(amountTotalBounds.upperBoundTotalUsd))}`}</p>:
                                    <p className="text-right dark:text-white">{`$${roundUsdAmount(Number(amountTotalBounds.lowerBoundTotalUsd))}-$${roundUsdAmount(Number(amountTotalBounds.upperBoundTotalUsd))}`}</p>
                                  }
                                </div>
                          </div>
                    </div>
                         }

                      </div>
                      <div className="">
                      </div>
                    </div>

                    <div className="mx-auto">
                          <button onClick={()=>handleSwapSendRequest()} className={`bg-transparent rounded-full hover:bg-sky-400 text-sky-500 font-semibold hover:text-white text-2xl my-8 py-2 px-20 ${isLoading?"hover:cursor-not-allowed":""} border border-sky-400 hover:border-transparent`} disabled={isLoading}>      
                                  {
                                          !isLoading?"Convert":
                                          <svg role="status" className="inline w-4 h-4 ml-3 text-white animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                          <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB"/>
                                          <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor"/>
                                          </svg>
                                    }
                          </button>
                    </div>
                </div>
                }
                {
                  (swapProgress == TxProgress.Complete && txPubData && builtTx && builtTx.swapData && swapAmounts)&& 
                  <div className="flex flex-col pt-2">
                    <div className='flex mb-8'>
                      <div className='flex-1'>
                        <AiOutlineArrowLeft className="ml-2 hover:cursor-pointer" onClick={()=>handleClickBack()} size="25"/>
                      </div>
                      <div className='flex-2'>
                        <h4 className="font-bold text-xl mx-auto content-center text-green-600">Swap Complete <AiFillCheckCircle className="inline ml-3"/></h4>
                      </div>
                      <div className='flex-1'>
                          {/* space filler */}
                      </div>
                    </div>
                    
                    <div className="mx-3">
                    <div className="flex flex-col mb-8 mx-auto">
                      <div className="flex flex-row mx-auto space-x-3 mb-4">
                              <div>
                                <img className="w-10 h-10 rounded-full inline" src={sellTokenAndNetwork.tokenData?sellTokenAndNetwork.tokenData.tokenDb.logoURI:sellTokenAndNetwork.baseNetworkDb.iconPath} alt={`${sellTokenAndNetwork.baseNetworkDb.fullName} image`}/>
                                {
                                  sellTokenAndNetwork.tokenData &&
                                  <img className="w-5 h-5 -ml-2 drop-shadow-lg mt-4 rounded-full inline" src={sellTokenAndNetwork.baseNetworkDb.iconPath} alt={`${sellTokenAndNetwork.baseNetworkDb.fullName} secondary image`}/>
                                }
                              </div>
                              <div>
                                <AiOutlineArrowRight className="mt-1" size="30"/>
                              </div>
                              <div>
                                <img className="w-10 h-10 rounded-full inline" src={buyTokenAndNetwork.tokenData?buyTokenAndNetwork.tokenData.tokenDb.logoURI:buyTokenAndNetwork.baseNetworkDb.iconPath} alt={`${buyTokenAndNetwork.baseNetworkDb.fullName} image`}/>
                                {
                                  buyTokenAndNetwork.tokenData &&
                                  <img className="w-5 h-5 -ml-2 drop-shadow-lg mt-4 rounded-full inline" src={buyTokenAndNetwork.baseNetworkDb.iconPath} alt={`${buyTokenAndNetwork.baseNetworkDb.fullName} secondary image`}/>
                                }
                              </div>
                      </div>
                      <h1 className="font-semibold text-2xl text-center">
                        Initiated a swap
                        <br/>
                        from <span style={{color:`${builtTx.swapData.sellTokenAndNetwork.tokenData?builtTx.swapData.sellTokenAndNetwork.tokenData.tokenDb.hexColor:builtTx.swapData.sellTokenAndNetwork.baseNetworkDb.hexColor}`}}>{formatAmountUi(swapAmounts.sellAmountCrypto.toString(), sellTokenAndNetwork, false)} {formatTicker(sellTokenAndNetwork.tokenData?sellTokenAndNetwork.tokenData.tokenDb.symbol:sellTokenAndNetwork.baseNetworkDb.ticker)}</span> to
                        <br/>
                        <span className="text-3xl" style={{color:`${buyTokenAndNetwork.tokenData?buyTokenAndNetwork.tokenData.tokenDb.hexColor:buyTokenAndNetwork.baseNetworkDb.hexColor}`}}>{formatAmountUi(swapAmounts.buyAmountCrypto.toString(), buyTokenAndNetwork, false)} {formatTicker(buyTokenAndNetwork.tokenData?buyTokenAndNetwork.tokenData.tokenDb.symbol:buyTokenAndNetwork.baseNetworkDb.ticker)}</span>
                      </h1>
                    </div>
                   
                    </div>
                    {
                    txPubData.explorerPath &&
                    <div className="mx-auto mb-4">                 
                              <a href={txPubData.explorerPath} target="_blank" rel="noopener noreferrer">
                                <button className={`bg-transparent hover:bg-sky-400 text-sky-500 font-semibold hover:text-white text-2xl py-2 px-20 ${isLoading?"hover:cursor-not-allowed":""} border border-sky-400 hover:border-transparent rounded-lg my-5`} disabled={isLoading}>      
                                    View Transaction
                                </button>
                              </a>
                    </div>
                    }
                   
                  </div>
                }
                {
                  swapProgress == TxProgress.Failure &&
                  <div className="flex flex-col pt-2">
                      <div className='flex mb-4'>
                          <div className='flex-1'>
                              {/* space filler */}
                          </div>
                          <div className='flex-2'>
                            <h4 className="font-bold text-xl mx-auto content-center text-red-600">Transaction Failed</h4>
                          </div>
                          <div className='flex-1'>
                              {/* space filler */}
                          </div>
                        </div>
                          {/* error message */}
                          <div className="mx-4 my-20 mx-auto">
                            <p className="dark:text-white text-lg"><span className="font-semibold text-gray-600 dark:text-gray-300">Transaction failed with error message:</span> {failureMsg}</p>
                          </div>
                          <Divider/>
                          <div className="mb-4 mx-auto">           
                                      <button className={`bg-transparent hover:bg-sky-400 text-sky-500 font-semibold hover:text-white text-2xl py-2 px-20 ${isLoading?"hover:cursor-not-allowed":""} border border-sky-400 hover:border-transparent rounded-lg my-5`} onClick={()=>handleCancelTransaction()} disabled={isLoading}>      
                                          New Transaction
                                      </button>
                          </div>
                  </div>
                }
            </div>
            </div>

        </div>
        
        {/* asset search */}
        <div className={`${!showAssetSearch && "hidden"} modal fixed w-full h-full top-0 left-0 z-50 flex overflow-y-auto`} style={{backgroundColor:`rgba(0, 0, 0, 0.9)`}}>
              {/* top right fixed close button  */}
            <button type="button" className="invisible md:visible text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto fixed top-4 right-5 items-center dark:hover:bg-gray-600 dark:hover:text-white" onClick={()=>setShowAssetSearch(false)}>
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>  
            </button>

              <div className="opacity-100 m-4 max-h-screen mx-auto">
              <div className="h-[20vh]">
          {/* padding div for space between bottom and main elements */}
        </div>

                <div className="dark:text-white bg-white dark:bg-black pt-4 rounded-lg w-[450px] max-w-[450px] min-h-[30rem] md:min-h-[40rem] h-fit md:max-h-[45rem] dark:border dark:border-gray-100 md:overflow-x-hidden overflow-y-auto no-scrollbar">
                    <div className="flex px-2">
                        <div className="flex-1">
                         <RiArrowLeftLine size={28} className="ml-2 hover:cursor-pointer hover:text-sky-400" onClick={()=>setShowAssetSearch(false)}/>
                        </div>

                         <h1 className="text-xl font-bold text-center flex-grow">Select Token</h1>
                    
                        
                        <div className="flex-grow">
                           
                        </div>
                    </div>
                    <div className="w-full mt-4">
                      <div className="rounded border border-gray-300 p-2 dark:border-gray-600 max-w-[90%] mx-auto flex flex-row">
                       <RiSearchLine size={26} className="pt-1"/> 
                      <input autoComplete='off' type="search" id="search-dropdown" className="ml-2 flex-grow dark:bg-black min-w-[80%] z-20 text-gray-900 text-xl dark:placeholder-gray-400 dark:text-white font-semibold outline-none" placeholder={`Search tokens`} value={query} onChange={(e) => handleQueryChange(e.target.value)}  required/>

                      </div>
                    </div>

                    {
                        searchresults.length != 0 &&
                        <div className="mx-auto relative z-10 my-2 px-2 py-2 text-slate-500 dark:text-slate-200 divide-y divide-gray-200 dark:divide-gray-600">
                            {
                                searchresults.map((searchResult:ISearchResult, index:number)=>
                                {
                                    return(
                                        <SearchResultItem searchResult={searchResult} key={index}/>
                                    )
                                }   
                                )
                            }
                        </div>
                      }

                      {
                        (searchresults.length == 0 && !isSearchSellToken)&&
                        <div className="mt-[4rem] text-center">
                          {
                            sellTokenAndNetwork.tokenData?
                            <p>No valid pairs for {sellTokenAndNetwork.tokenData.tokenDb.name} on {sellTokenAndNetwork.baseNetworkDb.fullName}</p>:
                            <p>No valid pairs for {sellTokenAndNetwork.baseNetworkDb.fullName}</p>
                          }
                        </div>
                      }
                      {
                        (searchresults.length == 0 && isSearchSellToken)&&
                        <div className="mt-[4rem] text-center">
                          <p>No search results for "{query}"</p>
                        </div>
                      }
                    
                </div>

                <div className="md:hidden min-h-[4rem] dark:text-white">
                    
                            {/* padding div for space between top and main elements */}
                </div>
            </div>
        </div>
        
        <div className="h-[6vh]">
          {/* padding div for space between bottom and main elements */}
        </div>
    </div>
       
  )
}

export default Swap


