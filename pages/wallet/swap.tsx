import { Network, truncateAddress } from 'hdseedloop';
import { toUpper } from 'lodash';
import type { NextPage } from 'next'
import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { RiArrowLeftLine, RiSearchLine, RiSwapLine } from 'react-icons/ri';
import { useKryptikAuthContext } from '../../components/KryptikAuthProvider';
import SearchResultItem from '../../components/search/searchResultItem';
import { useKryptikThemeContext } from '../../components/ThemeProvider';
import { getTokenSearchSuggestions } from '../../src/handlers/search/token';
import { ISearchResult } from '../../src/handlers/search/types';
import { BuildSwapTokenTransaction, IBuildSwapParams } from '../../src/handlers/swaps';
import { SwapValidator } from '../../src/handlers/swaps/utils';
import { getPriceOfTicker } from '../../src/helpers/coinGeckoHelper';
import { defaultResolvedAccount } from '../../src/helpers/resolvers/accountResolver';
import { getAddressForNetworkDb } from '../../src/helpers/utils/accountUtils';
import { formatTicker, networkFromNetworkDb } from '../../src/helpers/utils/networkUtils';
import { formatAmountUi, multByDecimals, roundCryptoAmount } from '../../src/helpers/utils/numberUtils';
import { KryptikTransaction } from '../../src/models/transactions';
import { fetch0xSwapOptions } from '../../src/requests/swaps/0xSwaps';
import { defaultTokenAndNetwork } from '../../src/services/models/network';
import { KryptikProvider } from '../../src/services/models/provider';
import { TokenAndNetwork } from '../../src/services/models/token';


const Swap: NextPage = () => {
  const {isDark} = useKryptikThemeContext();
  const {kryptikWallet, kryptikService} = useKryptikAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  
  const [tokenPrice, setTokenPrice] = useState(0);
  const [amountCrypto, setAmountCrypto] = useState("0");
  const [isInputCrypto, setIsInputCrypto] = useState(false);
  const [amountUSD, setAmountUSD] = useState("0");

  const [sellTokenAndNetwork, setSellTokenAndNetwork] = useState(defaultTokenAndNetwork);
  const [buyTokenAndNetwork, setBuyTokenAndNetwork] = useState(defaultTokenAndNetwork);

  const [fromAddress, setFromAddress] = useState(kryptikWallet.resolvedEthAccount.address);
  const [toAddress, setToAddress] = useState("");
  const [toResolvedAccount, setToResolvedAccount] = useState(defaultResolvedAccount);
  const [isResolverLoading, setIsResolverLoading] = useState(false);
  const [readableToAddress, setReadableToAddress] = useState("");
  const [readableFromAddress, setReadableFromAddress] = useState("");
  const [showAssetSearch, setShowAssetSearch] = useState(false);
  const [isSearchSellToken, setIsSearchSellToken] = useState(false);
  const [builtTx, setBuiltTx] = useState<KryptikTransaction|null>(null);
  // swap validator state
  const defaultSwapValidator = new SwapValidator(defaultTokenAndNetwork);
  const [currentSwapValidator, setCurrentSwapValidator] = useState<SwapValidator>(defaultSwapValidator)



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

  const handleSwapRequest = async function(){
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
    console.log("New Built tx:");
    console.log(newBuiltTx);
    setBuiltTx(newBuiltTx);
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
    setShowAssetSearch(true);
    setIsSearchSellToken(isSellToken);
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

          
            <div className="max-w-[450px] bg-white dark:bg-black mt-8 mx-auto py-8 md:mt-0 rounded-lg min-h-[30rem] md:min-h-[25rem] h-fit md:max-h-[40rem] dark:border dark:border-gray-100 md:overflow-x-hidden overflow-y-auto no-scrollbar">
                <div className="flex flex-col">

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
                          <button onClick={()=>handleSwapRequest()} className={`bg-transparent rounded-full hover:bg-sky-400 text-sky-500 font-semibold hover:text-white text-2xl py-2 px-20 ${isLoading?"hover:cursor-not-allowed":""} border border-sky-400 hover:border-transparent my-5`} disabled={isLoading}>      
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
            </div>
            </div>

        </div>

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
                         <RiArrowLeftLine size={28} className="hover:cursor-pointer hover:text-sky-400" onClick={()=>setShowAssetSearch(false)}/>
                        </div>

                         <h1 className="text-xl font-bold text-center flex-grow">Select Token</h1>
                    
                        
                        <div className="flex-grow">
                           
                        </div>
                    </div>
                    <div className="w-full mt-4">
                      <div className="rounded border border-gray-300 p-2 dark:border-gray-600 max-w-[90%] mx-auto flex flex-row">
                       <RiSearchLine size={26} className="pt-1"/> 
                      <input type="search" id="search-dropdown" className="ml-2 flex-grow dark:bg-black min-w-[80%] z-20 text-gray-900 text-xl dark:placeholder-gray-400 dark:text-white font-semibold outline-none" placeholder={`Search tokens`} value={query} onChange={(e) => handleQueryChange(e.target.value)}  required/>

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