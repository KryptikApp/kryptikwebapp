import type { NextPage } from 'next'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import toast, { Toaster } from 'react-hot-toast'
import { defaultTokenAndNetwork, placeHolderSolAddress } from '../../src/services/models/network'
import { SendProgress, ServiceState } from '../../src/services/types'
import { AiFillCheckCircle, AiOutlineArrowDown, AiOutlineArrowLeft, AiOutlineWallet } from 'react-icons/ai';
import {RiSwapLine} from "react-icons/ri"
import { Network, NetworkFamily, NetworkFamilyFromFamilyName, truncateAddress } from "hdseedloop"

import { getPriceOfTicker } from '../../src/helpers/coinGeckoHelper'
import Divider from '../../components/Divider'
import { useKryptikAuthContext } from '../../components/KryptikAuthProvider'
import DropdownNetworks from '../../components/DropdownNetworks'
import TransactionFeeData, { CreateTransactionParameters, defaultTransactionFeeData, defaultTxPublishedData, FeeDataParameters, SolTransactionParams, TransactionPublishedData, TransactionRequest, TxType } from '../../src/services/models/transaction'
import { createSolTokenTransaction, createSolTransaction } from '../../src/handlers/wallet/transactions/SolTransactions'
import { Transaction} from '@solana/web3.js'
import { TokenParamsSpl } from '../../src/services/models/token'
import {handlePublishTransaction} from '../../src/handlers/wallet/sendHandler'
import TxFee from '../../components/transactions/TxFee'
import { networkFromNetworkDb, formatTicker } from '../../src/helpers/utils/networkUtils'
import { roundUsdAmount, formatAmountUi, roundCryptoAmount } from '../../src/helpers/utils/numberUtils'
import { getAddressForNetworkDb, isValidAddress } from '../../src/helpers/utils/accountUtils'
import { defaultResolvedAccount, IAccountResolverParams, resolveAccount } from '../../src/helpers/resolvers/accountResolver'




const Send: NextPage = () => {
  interface AmountTotalBounds{
    lowerBoundTotalUsd: string,
    upperBoundTotalUsd: string
  }
  const defaultAmountTotalBounds = {lowerBoundTotalUsd: "0", upperBoundTotalUsd: "0"};
  const { authUser, loading, kryptikWallet, kryptikService } = useKryptikAuthContext();  


  const [amountCrypto, setAmountCrypto] = useState("0");
  const [isInputCrypto, setIsInputCrypto] = useState(false);
  const [amountUSD, setAmountUSD] = useState("0");
  const [dropdownLoaded, setDropDownLoaded] = useState(false);
  const [feesLoaded, setFeesLoaded] = useState(false);
  const [amountTotalBounds, setAmountTotalbounds] = useState<AmountTotalBounds>(defaultAmountTotalBounds);
  const [transactionFeeData, setTransactionFeedata] = useState(defaultTransactionFeeData)
  const [txPubData, setTxPubData] = useState<TransactionPublishedData>(defaultTxPublishedData);
  const [tokenPrice, setTokenPrice] = useState(0);
  const [fromAddress, setFromAddress] = useState(kryptikWallet.resolvedEthAccount.address);
  const [toAddress, setToAddress] = useState("");
  const [toResolvedAccount, setToResolvedAccount] = useState(defaultResolvedAccount);
  const [isResolverLoading, setIsResolverLoading] = useState(false);
  const [readableToAddress, setReadableToAddress] = useState("");
  const [readableFromAddress, setReadableFromAddress] = useState("");
  const [forMessage, setForMessage] = useState("");
  const [failureMsg, setFailureMsg] = useState("Unable to complete transaction");
  const [isLoading, setisLoading] = useState(false);
  const [progress, setProgress] = useState<SendProgress>(SendProgress.Begin);
  const[selectedTokenAndNetwork, setSelectedTokenAndNetwork] = useState(defaultTokenAndNetwork);

  // ROUTE PROTECTOR: Listen for changes on loading and authUser, redirect if needed
  useEffect(() => {
    const router = useRouter();
    if (!loading && !authUser.isLoggedIn) router.push('/');
    // ensure service is started
    if(kryptikService.serviceState != ServiceState.started){
      router.push('/')
    }
  }, [authUser, loading])

  useEffect(()=>{
    updateTotalBounds();
  }, [amountUSD, transactionFeeData]);

  // get solana tx. fees upon review
  useEffect(()=>{
    if(progress != SendProgress.Rewiew){
      return;
    }
    setFeesLoaded(false);
    fetchSolTransactionFees();
    setFeesLoaded(true);
  }, [progress]);

  // get data on token/network change
  useEffect(()=>{
    fetchFromAddress();
    fetchTokenPrice();
    fetchNetworkFees();
    handleAmountChange("0");
}, [selectedTokenAndNetwork]);

  // retrieves wallet balances
  const fetchFromAddress = async():Promise<string> =>{
     let accountAddress = await getAddressForNetworkDb(kryptikWallet, selectedTokenAndNetwork.baseNetworkDb);
     let network:Network = networkFromNetworkDb(selectedTokenAndNetwork.baseNetworkDb);
      // handle empty address
      if(accountAddress == ""){
        toast.error(`Error: no address found for ${selectedTokenAndNetwork.baseNetworkDb.fullName}. Please contact the Kryptik team or try refreshing your page.`);
        setFromAddress(kryptikWallet.resolvedEthAccount.address);      
        setReadableFromAddress(truncateAddress(kryptikWallet.resolvedEthAccount.address, network));
        setSelectedTokenAndNetwork(defaultTokenAndNetwork);
        return kryptikWallet.resolvedEthAccount.address;
      }
      setFromAddress(accountAddress);
      setReadableFromAddress(truncateAddress(accountAddress, network));
      return accountAddress;
  }

  // get price for selected token
  const fetchTokenPrice = async() =>{
    let coingeckoId = selectedTokenAndNetwork.tokenData?selectedTokenAndNetwork.tokenData.tokenDb.coingeckoId:
    selectedTokenAndNetwork.baseNetworkDb.coingeckoId;
    let tokenPriceCoinGecko:number = await getPriceOfTicker(coingeckoId);
    setTokenPrice(tokenPriceCoinGecko);
  }

  // get fees for selected network
  const fetchNetworkFees = async(solTx?:Transaction) =>{
    setFeesLoaded(false);
    // if token data present.. tx is a token transfer.... otherwise tx type is a native coin transfer
    let txType:TxType = selectedTokenAndNetwork.tokenData?TxType.TransferToken:TxType.TransferNative;
    let nw:Network =  networkFromNetworkDb(selectedTokenAndNetwork.baseNetworkDb);
    // use instead of from address as react state may not have updated
    let accountAddress = await getAddressForNetworkDb(kryptikWallet, selectedTokenAndNetwork.baseNetworkDb);
    let feeDataParams:FeeDataParameters = {
      networkDb: selectedTokenAndNetwork.baseNetworkDb,
      tokenData: selectedTokenAndNetwork.tokenData,
      amountToken: amountCrypto,
      sendAccount: accountAddress,
      txType: txType,
      solTransaction: solTx
    }
    // fee data returned from service
    let transactionFeeDataFresh:TransactionFeeData|null = await kryptikService.getTransactionFeeData(feeDataParams);
    console.log("Transaction fee data received");
    console.log(transactionFeeDataFresh);
    if(transactionFeeDataFresh){
      setTransactionFeedata(transactionFeeDataFresh);
    }
    else{
      setTransactionFeedata(defaultTransactionFeeData);
    }
    setFeesLoaded(true);
  }

  // gets solana tx. fees and sets sol transaction
  const fetchSolTransactionFees = async()=>{
      setFeesLoaded(false);
      let nw:Network =  networkFromNetworkDb(selectedTokenAndNetwork.baseNetworkDb);
      let kryptikProvider = kryptikService.getProviderForNetwork(selectedTokenAndNetwork.baseNetworkDb);
      // get solana transaction fee
      if(nw.networkFamily != NetworkFamily.Solana){
        return;
      }
      let accountAddress:string = await getAddressForNetworkDb(kryptikWallet, selectedTokenAndNetwork.baseNetworkDb);
      
      let txIn:SolTransactionParams = {
        sendAccount: accountAddress,
        toAddress: toAddress==""?toAddress:placeHolderSolAddress,
        valueSol: Number(amountCrypto),
        kryptikProvider: kryptikProvider,
        decimals: selectedTokenAndNetwork.tokenData?
        selectedTokenAndNetwork.tokenData.tokenDb.decimals:
        selectedTokenAndNetwork.baseNetworkDb.decimals,
        networkDb: selectedTokenAndNetwork.baseNetworkDb
      }
      let txSol:Transaction;
      // send sol token 
      if(selectedTokenAndNetwork.tokenData && selectedTokenAndNetwork.tokenData.tokenParamsSol){
        // add sol token data to input params
        let txSolParams:TokenParamsSpl = selectedTokenAndNetwork.tokenData.tokenParamsSol;
        txIn.tokenParamsSol = txSolParams;
        txSol = await createSolTokenTransaction(txIn);
      }
      // OR send base network sol coin
      else{
        txSol = await createSolTransaction(txIn);
      }
      await fetchNetworkFees(txSol);
      setFeesLoaded(true);
  }

  const handleToAddressChange = function(toAddressIn:string){
    setToAddress(toAddressIn);
  }

  const handleDropdownLoaded = function(){
    setDropDownLoaded(true);
  }

  const handleToggleIsCrypto = function(){
    setIsInputCrypto(!isInputCrypto);
  }

  const setMaxAmount = function(){
    // set max with token value
    if(selectedTokenAndNetwork.tokenData){
      if(!selectedTokenAndNetwork.tokenData.tokenBalance) return;
      // SOL TX fees calculated on review.. so just set to max token value
      if(NetworkFamilyFromFamilyName(selectedTokenAndNetwork.baseNetworkDb.networkFamilyName)==NetworkFamily.Solana){
        let maxAmountSol = selectedTokenAndNetwork.tokenData.tokenBalance.amountCrypto;
        setAmountCrypto(maxAmountSol);
        setAmountUSD(roundUsdAmount(Number(maxAmountSol)*tokenPrice).toString());
        return;
      }
      let maxAmountCrypto = Number(selectedTokenAndNetwork.tokenData.tokenBalance.amountCrypto)-Number(amountTotalBounds.upperBoundTotalUsd)/tokenPrice;
      let maxAmountUsd = maxAmountCrypto*tokenPrice;
      setAmountCrypto(maxAmountCrypto.toString());
      setAmountUSD(maxAmountUsd.toString());
    }
    // set max with 
    else{
      if(!selectedTokenAndNetwork.networkBalance) return;
      // SOL TX fees calculated on review.. so just set to max value
      if(NetworkFamilyFromFamilyName(selectedTokenAndNetwork.baseNetworkDb.networkFamilyName)==NetworkFamily.Solana){
        setAmountCrypto(selectedTokenAndNetwork.networkBalance.amountCrypto);
        setAmountUSD(selectedTokenAndNetwork.networkBalance.amountUSD);
        return;
      }
      let maxAmountCrypto = Number(selectedTokenAndNetwork.networkBalance.amountCrypto)-Number(amountTotalBounds.upperBoundTotalUsd)/tokenPrice;
      let maxAmountUsd = maxAmountCrypto*tokenPrice;
      setAmountCrypto(maxAmountCrypto.toString());
      setAmountUSD(maxAmountUsd.toString());
    }
  }

  const updateTotalBounds = function(){
    let newTotalBounds:AmountTotalBounds = {
      lowerBoundTotalUsd: (Number(amountUSD) + Number(transactionFeeData.lowerBoundUSD)).toString(),
      upperBoundTotalUsd: (Number(amountUSD) + Number(transactionFeeData.upperBoundUSD)).toString()
    }
    setAmountTotalbounds(newTotalBounds);
  }

  // handler passed as parameter into publish tx. method
  const errorHandler = function(message:string, isFatal=false){
    // show failure screen
    // typically used for errors when pushing to blockchain
    if(isFatal){
      setFailureMsg(message);
      setProgress(SendProgress.Failure)
      return;
    }
    toast.error(message);
    handleCancelTransaction();
  }

  // formats and updates usd/ crypto amounts
  const handleAmountChange = function(amountIn:string){
      if(!isInputCrypto) amountIn = amountIn.slice(1);
      let formattedAmount = formatAmountUi(amountIn, selectedTokenAndNetwork, !isInputCrypto);
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

  const handleClickBack = function(){
    switch(progress) { 
      case SendProgress.SetParamaters: { 
         setProgress(SendProgress.Begin); 
         break; 
      } 
      case SendProgress.Rewiew: { 
         setProgress(SendProgress.SetParamaters);
         break; 
      } 
      case SendProgress.Complete:{
         handleCancelTransaction();
         break; 
      }
      default: { 
         setProgress(SendProgress.Begin);
         break; 
      } 
   } 
  }

  const validateAmount = function():boolean{
    if(amountCrypto == "0"){
      toast.error("Please enter a nonzero amount.");
      setisLoading(false);
      return false;
    }
    if(selectedTokenAndNetwork.tokenData && (Number(selectedTokenAndNetwork.tokenData.tokenBalance?.amountCrypto) < Number(amountCrypto))){
      toast.error(`You don't have enough ${selectedTokenAndNetwork.tokenData.tokenDb.name} to complete this transaction`);
      setisLoading(false);
      return false;
    }
    // check sufficient network balance for tx. fees (when sending token)
    if(selectedTokenAndNetwork.tokenData && (Number(selectedTokenAndNetwork.networkBalance?.amountCrypto) < Number(transactionFeeData.upperBoundCrypto))){
      toast.error(`You don't have enough ${selectedTokenAndNetwork.baseNetworkDb.fullName} to pay for network transaction fees`);
      setisLoading(false);
      return false;
    }
    // sending base network token... check balance vs. total amount (send+fees)
    if(!selectedTokenAndNetwork.tokenData && Number(selectedTokenAndNetwork.networkBalance?.amountUSD)<Number(amountTotalBounds.upperBoundTotalUsd)){
      toast.error(`You don't have enough ${selectedTokenAndNetwork.baseNetworkDb.fullName} to complete this transaction`);
      setisLoading(false);
      return false;
    }
    return true;
  }

  const handleStartParameterSetting = async function(){
    setisLoading(true);
    // VERIFY sender has sufficient balance
    let isValidAmount = validateAmount();
    if(!isValidAmount) return;
    // VERIFICATION COMPLETE
    setProgress(SendProgress.SetParamaters);
    setisLoading(false);
  }

  const handleStartReview = async function(){
    setisLoading(true);
    // verify recipient address is correct
    let nw:Network = networkFromNetworkDb(selectedTokenAndNetwork.baseNetworkDb);
    if(!validateAmount()){
      setisLoading(false);
      return;
    }
    // resolve to account
    setIsResolverLoading(true);
    let kryptikProvider = await kryptikService.getKryptikProviderForNetworkDb(selectedTokenAndNetwork.baseNetworkDb);
    let resolverParams:IAccountResolverParams = {
      account: toAddress,
      kryptikProvider: kryptikProvider,
      networkDB: selectedTokenAndNetwork.baseNetworkDb
    }
    let newResolvedAccount = await resolveAccount(resolverParams);
    console.log(`resolved account: ${newResolvedAccount}`);
    // if not a valid account, show error and return
    if(!newResolvedAccount){
       toast.error("Invalid address.");
       setisLoading(false);
       setIsResolverLoading(false);
       return;
    }
    setToResolvedAccount(newResolvedAccount);
    setIsResolverLoading(false);
    setToAddress(newResolvedAccount.address);
    setReadableToAddress(truncateAddress(newResolvedAccount.address, nw));
    // change progress state
    setProgress(SendProgress.Rewiew);
    setisLoading(false);
  };

  const handleCancelTransaction = function(isComplete?:false){
    let nw:Network =  networkFromNetworkDb(selectedTokenAndNetwork.baseNetworkDb);
    setisLoading(true);
    setAmountUSD("0");
    setAmountCrypto("0");
    setForMessage("");
    setFromAddress("");
    setToAddress("");
    setAmountTotalbounds(defaultAmountTotalBounds);
    setReadableFromAddress(truncateAddress(kryptikWallet.resolvedEthAccount.address, nw));
    setReadableToAddress("");
    setTxPubData(defaultTxPublishedData);
    setSelectedTokenAndNetwork(defaultTokenAndNetwork);
    if(!isComplete) setProgress(SendProgress.Begin);
    setisLoading(false);
  };

  // handler for when user clicks create transaction button
  const handleSendTransaction = async function(){
    setisLoading(true);
    // params for create tx. method
    let txParams:CreateTransactionParameters={
      tokenAndNetwork: selectedTokenAndNetwork,
      wallet: kryptikWallet,
      kryptikService: kryptikService,
      amountCrypto: amountCrypto,
      toAddress: toAddress,
      fromAddress: fromAddress,
      txFeeData: transactionFeeData,
      errorHandler: errorHandler
    }
    let txResult = await handlePublishTransaction(txParams);
    if(!txResult){
      // ERROR REDIRECT WILL BE DONE BY ERROR HANDLER
      setisLoading(false);
      return;
    }
    setTxPubData(txResult);
    setProgress(SendProgress.Complete);
    setisLoading(false);
  }



  return (
    <div>
          <Toaster/>
          <div className="text-center max-w-xl mx-auto content-center">
          {
            (progress==SendProgress.SetParamaters)  &&
            <div className="align-left m-7">
              <AiOutlineArrowLeft className="hover:cursor-pointer dark:text-white" onClick={()=>handleClickBack()} size="30"/>
            </div>
          }
          {
            progress == SendProgress.Begin && 
            <div>
              <div className="h-[5rem]">
                {/* padding div for space between top and main elements */}
              </div>
              {/* amount input */}
              <div className="flex justify-start mt-5">
                <input className="w-full py-2 px-4 text-sky-400 leading-tight focus:outline-none text-8xl text-center bg-transparent" id="amount" placeholder="$0" autoComplete="off" required value={isInputCrypto? `${amountCrypto}`:`$${amountUSD}`} onChange={(e) => handleAmountChange(e.target.value)}/>
              </div>
              <br/>
              <div className="rounded-full border border-gray-400 p-1 max-w-fit inline mr-2 mb-1 text-slate-400 hover:cursor-pointer hover:bg-slate-100 hover:text-sky-400 hover:font-semibold" onClick={()=>setMaxAmount()}>
                <span className="text-xs">MAX</span>
              </div>
              <span className="text-slate-400 text-sm inline">{!isInputCrypto? `${roundCryptoAmount(Number(amountCrypto))} ${selectedTokenAndNetwork.tokenData?selectedTokenAndNetwork.tokenData.tokenDb.symbol:formatTicker(selectedTokenAndNetwork.baseNetworkDb.ticker)}`:`$${amountUSD}`}</span>
              <RiSwapLine className="hover:cursor-pointer inline text-slate-300 ml-2" onClick={()=>handleToggleIsCrypto()} size="20"/>
              {/* network dropdown */}
                <div className="max-w-xs mx-auto">
                    <DropdownNetworks selectedTokenAndNetwork={selectedTokenAndNetwork} selectFunction={setSelectedTokenAndNetwork} onlyWithValue={true} onLoadedFunction={handleDropdownLoaded}/>
                </div>
              
              {/* show fees when dropdown is loaded */}
              {
                dropdownLoaded?
                <TxFee txFeeData={transactionFeeData} tokenAndNetwork={selectedTokenAndNetwork} feesLoaded={feesLoaded} feeLabel={"Fees:"}/>:
                <div className="w-40 h-6 mt-2 truncate bg-gray-300 animate-pulse rounded mx-auto"/>
              }
              
              {/* next button... to set recipient */}
              <button onClick={()=>handleStartParameterSetting()} className={`bg-transparent hover:bg-sky-400 text-sky-400 font-semibold hover:text-white text-2xl py-2 px-20 ${isLoading?"hover:cursor-not-allowed":""} border border-sky-400 hover:border-transparent rounded-lg my-5`} disabled={isLoading}>      
                            Next
                            {
                                    !isLoading?"":
                                    <svg role="status" className="inline w-4 h-4 ml-3 text-white animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB"/>
                                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor"/>
                                    </svg>
                            }
              </button>
            </div>
          }
          {
            progress == SendProgress.SetParamaters &&
            <div>
               {/* amount indicator */}
                <div className="border rounded border-solid border-grey-600 w-40 mx-7 py-3">
                  <img className="w-8 h-8 rounded-full inline" src={selectedTokenAndNetwork.tokenData?selectedTokenAndNetwork.tokenData.tokenDb.logoURI:selectedTokenAndNetwork.baseNetworkDb.iconPath} alt="Network Image"/>
                  {
                      selectedTokenAndNetwork.tokenData &&
                      <img className="w-4 h-4 -ml-2 drop-shadow-lg mt-4 rounded-full inline" src={selectedTokenAndNetwork.baseNetworkDb.iconPath} alt={`${selectedTokenAndNetwork.baseNetworkDb.fullName} secondary image`}/>
                  }
                  <span className="inline mx-2 dark:text-white">${roundUsdAmount(Number(amountUSD))}</span>
                </div>
                
                <div className="px-5 py-5 m-2 rounded mt-0 mb-0">
                    {/* to label */}
                    <div className='text-left'>
                      <label className="block text-gray-500 font-bold mb-1 md:mb-0 pr-4 inline">
                        To
                      </label>
                      {
                          isResolverLoading &&
                          <svg role="status" className="inline w-4 h-4 ml-3 text-white animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB"/>
                          <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor"/>
                          </svg>
                      }
                    </div>
                    {/* to input */}
                    <input className="bg-white appearance-none border-2 border-gray-400 rounded w-full py-4 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:dark:bg-[#141414] focus:border-blue-400 dark:bg-[#141414] dark:text-white" value={toAddress} onChange={(e) => handleToAddressChange(e.target.value)} id="inline-to"/>
                    {/* for input */}
                    <label className="block text-gray-500 font-bold text-left mb-1 md:mb-0 pr-4">
                      For
                    </label>
                    <textarea maxLength={150} className="bg-white appearance-none border-2 border-gray-400 rounded w-full py-4 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:dark:bg-[#141414] focus:border-blue-400 dark:bg-[#141414] dark:text-white" id="inline-forMessage" placeholder={"Pizza, rent, etc."} value={forMessage} onChange={(e) => setForMessage(e.target.value)}/>
                    {/* next button... to review */}
                    <button onClick={()=>handleStartReview()} className={`bg-transparent hover:bg-sky-400 text-sky-500 font-semibold hover:text-white text-2xl py-2 px-20 ${isLoading?"hover:cursor-not-allowed":""} border border-sky-400 hover:border-transparent rounded-lg my-5`} disabled={isLoading}>      
                                  Review
                                  {
                                          !isLoading?"":
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
            progress == SendProgress.Rewiew &&
            <div>
                <div className="h-[4rem]">
                  {/* padding div for space between top and main elements */}
                </div>
                <div className="max-w-md mx-auto border rounded-lg border-solid border-2 border-gray-400 py-4 px-2">
                <div className='flex mb-4'>
                    <div className='flex-1'>
                      <AiOutlineArrowLeft className="hover:cursor-pointer" onClick={()=>handleClickBack()} size="25"/>
                    </div>
                    <div className='flex-2'>
                      <h4 className="font-bold text-lg mx-auto content-center dark:text-white">Review Transaction</h4>
                    </div>
                    <div className='flex-1'>
                        {/* space filler */}
                    </div>
                  </div>
                  

                  <div className="border border-solid border-1 border-gray-300 dark:border-gray-600 py-4 rounded-lg mx-2">

                    <div className="flex flex-row">
                      <div className="flex-1">
                        <div className="text-left pl-1">
                        <img className="w-8 h-8 rounded-full inline" src={selectedTokenAndNetwork.tokenData?selectedTokenAndNetwork.tokenData.tokenDb.logoURI:selectedTokenAndNetwork.baseNetworkDb.iconPath} alt="Network Image"/>
                        {
                            selectedTokenAndNetwork.tokenData &&
                            <img className="w-4 h-4 -ml-2 drop-shadow-lg mt-4 rounded-full inline" src={selectedTokenAndNetwork.baseNetworkDb.iconPath} alt={`${selectedTokenAndNetwork.baseNetworkDb.fullName} secondary image`}/>
                        }
                        </div>
                        <AiOutlineArrowDown className="text-gray-200 pl-2" size="30"/>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-base mx-2 dark:text-white">{selectedTokenAndNetwork.tokenData?selectedTokenAndNetwork.tokenData.tokenDb.name:selectedTokenAndNetwork.baseNetworkDb.fullName}</p>
                      </div>
                      <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900 truncate dark:text-gray-100">
                            ${amountUSD}
                          </p>
                          <p className="text-sm text-gray-500 truncate dark:text-gray-400">
                            {roundCryptoAmount(Number(amountCrypto))}
                          </p>
                      </div>
                    </div>

                    <div className="flex flex-row">
                        <div className="flex-1 px-1">
                          <AiOutlineWallet className="text-sky-400 pl-1" size="30"/>
                        </div>
                        <div className="flex-1 px-1">
                          {
                            toResolvedAccount.names?
                            <div>
                              <p className="dark:text-white">{toResolvedAccount.names[0]}</p>
                              <p className="italic text-sm text-gray-500 dark:text-gray-400">({readableToAddress})</p>
                            </div>:
                            <div>
                              <p className="italic dark:text-white">{readableToAddress}</p>
                            </div>
                          }
                          
                        </div>
                        <div className='flex-1'>
                          {/* space filler */}
                        </div>
                    </div>

                  </div>
                  <br/>
                <div className='mx-3'>
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
                            <p className="text-right"><span style={{color:`${selectedTokenAndNetwork.baseNetworkDb.hexColor}`}} className="font-semibold">{selectedTokenAndNetwork.baseNetworkDb.fullName}</span></p>
                          </div>
                    </div>
                    <div className="flex flex-row">
                          <div className="flex-1">
                            <p className="text-slate-600 text-left dark:text-slate-300">Network Fees</p>
                          </div>
                          <div className="flex-1 px-1">
                            <div className='text-right'>
                             <TxFee txFeeData={transactionFeeData} tokenAndNetwork={selectedTokenAndNetwork} feesLoaded={feesLoaded}/>
                            </div>
                          </div>
                    </div>
                    <div className="flex flex-row">
                          <div className="flex-1">
                            <p className="text-slate-600 text-left dark:text-slate-300">Total Amount</p>
                          </div>
                          <div className="flex-1 px-1">
                            {
                               (amountTotalBounds.lowerBoundTotalUsd == amountTotalBounds.upperBoundTotalUsd)?
                              <p className="text-right dark:text-white">{`$${roundUsdAmount(Number(amountTotalBounds.upperBoundTotalUsd))}`}</p>:
                              <p className="text-right dark:text-white">{`$${roundUsdAmount(Number(amountTotalBounds.lowerBoundTotalUsd))}-$${roundUsdAmount(Number(amountTotalBounds.upperBoundTotalUsd))}`}</p>
                            }
                          </div>
                    </div>
                  </div>
                  <Divider/>
                  <div className="flex">
                        <div className="flex-1 align-left">
                          <button onClick={()=>handleCancelTransaction()} className={`bg-transparent hover:bg-red-500 text-red-500 font-semibold hover:text-white text-2xl py-2 px-10 ${isLoading?"hover:cursor-not-allowed":""} border border-red-500 hover:border-transparent rounded-lg my-5`} disabled={isLoading}>      
                                    Cancel
                            </button>
                        </div>
                        <div className="flex-1 px-1">
                          <button onClick={()=>handleSendTransaction()} className={`bg-transparent hover:bg-sky-400 text-sky-500 font-semibold hover:text-white text-2xl py-2 px-20 ${isLoading?"hover:cursor-not-allowed":""} border border-sky-400 hover:border-transparent rounded-lg my-5`} disabled={isLoading}>      
                                  {
                                          !isLoading?"Send":
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
          }
          {
            progress == SendProgress.Failure &&
            <div>
              <div className="h-[4rem]">
                  {/* padding div for space between top and main elements */}
                </div>
                <div className="max-w-md mx-auto border rounded-lg border-solid border-2 border-gray-400 py-4 px-2">
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
                    <div className="mx-3 my-20">
                      <p className="dark:text-white">{failureMsg}</p>
                    </div>
                    <Divider/>
                    <div className="flex">
                          <div className="flex-1 px-1">                      
                                <button className={`bg-transparent hover:bg-sky-400 text-sky-500 font-semibold hover:text-white text-2xl py-2 px-20 ${isLoading?"hover:cursor-not-allowed":""} border border-sky-400 hover:border-transparent rounded-lg my-5`} onClick={()=>handleCancelTransaction()} disabled={isLoading}>      
                                    New Transaction
                                </button>
                          </div>
                    </div>

                </div>
            </div>
          }
          {
            progress == SendProgress.Complete &&
            <div>
              <div className="h-[4rem]">
                  {/* padding div for space between top and main elements */}
                </div>
                <div className="max-w-md mx-auto border rounded-lg border-solid border-2 border-gray-400 py-4 px-2">
                <div className='flex mb-4'>
                    <div className='flex-1'>
                      <AiOutlineArrowLeft className="hover:cursor-pointer" onClick={()=>handleClickBack()} size="25"/>
                    </div>
                    <div className='flex-2'>
                      <h4 className="font-bold text-xl mx-auto content-center text-green-600">Transaction Complete <AiFillCheckCircle className="inline ml-3"/></h4>
                    </div>
                    <div className='flex-1'>
                        {/* space filler */}
                    </div>
                  </div>
                  <div className="border border-solid border-1 border-gray-300 py-4 rounded-lg mx-2">
                    <div className="flex flex-row">
                      <div className="flex-1 pl-1">
                        <div className="text-left pl-1">
                          <img className="w-8 h-8 rounded-full inline" src={selectedTokenAndNetwork.tokenData?selectedTokenAndNetwork.tokenData.tokenDb.logoURI:selectedTokenAndNetwork.baseNetworkDb.iconPath} alt="Network Image"/>
                          {
                              selectedTokenAndNetwork.tokenData &&
                              <img className="w-4 h-4 -ml-2 drop-shadow-lg mt-4 rounded-full inline" src={selectedTokenAndNetwork.baseNetworkDb.iconPath} alt={`${selectedTokenAndNetwork.baseNetworkDb.fullName} secondary image`}/>
                          }
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-base mx-2 dark:text-white">{selectedTokenAndNetwork.tokenData?selectedTokenAndNetwork.tokenData.tokenDb.name:selectedTokenAndNetwork.baseNetworkDb.fullName}</p>
                      </div>
                      <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900 truncate dark:text-gray-100">
                            ${roundUsdAmount(Number(amountUSD))}
                          </p>
                          <p className="text-sm text-gray-500 truncate dark:text-gray-400">
                            {roundCryptoAmount(Number(amountCrypto))}
                          </p>
                      </div>
                    </div>

                    <div className="flex flex-row">
                        <div className="flex-1 pl-2">
                          <AiOutlineWallet className="text-sky-400 pl-1" size="30"/>
                        </div>
                        <div className="flex-1 px-1">
                          <p className="italic dark:text-white">{readableToAddress}</p>
                        </div>
                        <div className='flex-1'>
                          {/* space filler */}
                        </div>
                    </div>

                  </div>
                  <br/>
                <div className='mx-3'>
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
                            <p className="text-right"><span style={{color:`${selectedTokenAndNetwork.baseNetworkDb.hexColor}`}} className="font-semibold">{selectedTokenAndNetwork.baseNetworkDb.fullName}</span></p>
                          </div>
                    </div>
                    <div className="flex flex-row">

                          <div className="flex-1">
                            <p className="text-slate-600 text-left dark:text-slate-300">Network Fees</p>
                          </div>

                          <div className="flex-1 px-1">
                            <div className='text-right'>
                              <TxFee txFeeData={transactionFeeData} tokenAndNetwork={selectedTokenAndNetwork} feesLoaded={feesLoaded}/>
                            </div>
                          </div>
                    </div>
                    <div className="flex flex-row">
                          <div className="flex-1">
                            <p className="text-slate-600 text-left dark:text-slate-300">Total Amount</p>
                          </div>
                          <div className="flex-1 px-1">
                            {
                               (amountTotalBounds.lowerBoundTotalUsd == amountTotalBounds.upperBoundTotalUsd)?
                              <p className="text-right dark:text-white">{`$${roundUsdAmount(Number(amountTotalBounds.upperBoundTotalUsd))}`}</p>:
                              <p className="text-right dark:text-white">{`$${roundUsdAmount(Number(amountTotalBounds.lowerBoundTotalUsd))}-$${roundUsdAmount(Number(amountTotalBounds.upperBoundTotalUsd))}`}</p>
                            }
                          </div>
                    </div>
                  </div>
                  {
                    txPubData.explorerPath &&
                    <div>
                    <Divider/>
                    <div className="flex">
                          <div className="flex-1 px-1">                      
                              <a href={txPubData.explorerPath} target="_blank" rel="noopener noreferrer">
                                <button className={`bg-transparent hover:bg-sky-400 text-sky-500 font-semibold hover:text-white text-2xl py-2 px-20 ${isLoading?"hover:cursor-not-allowed":""} border border-sky-400 hover:border-transparent rounded-lg my-5`} disabled={isLoading}>      
                                    View Transaction
                                </button>
                              </a>
                          </div>
                    </div>
                    </div>
                  }
                </div>
            </div>
          }
          
          
          
          {
            progress == SendProgress.Begin &&
            <div>
              <Divider/>
              <div className="mx-auto text-center text-gray-500 text-sm dark:text-gray-400">
                {
                  (selectedTokenAndNetwork.networkBalance && !selectedTokenAndNetwork.tokenData) &&
                  <p>{isInputCrypto?roundCryptoAmount(Number(selectedTokenAndNetwork.networkBalance.amountCrypto)):`$${roundUsdAmount(Number(selectedTokenAndNetwork.networkBalance.amountUSD))}`} <span style={{color:`${selectedTokenAndNetwork.baseNetworkDb.hexColor}`}} className="font-semibold">{formatTicker(selectedTokenAndNetwork.baseNetworkDb.ticker)}</span> available</p>
                }
                {
                  (selectedTokenAndNetwork.tokenData && selectedTokenAndNetwork.tokenData.tokenBalance) && 
                  <p>{isInputCrypto?roundCryptoAmount(Number(selectedTokenAndNetwork.tokenData.tokenBalance.amountCrypto)):`$${roundUsdAmount(Number(selectedTokenAndNetwork.tokenData.tokenBalance.amountUSD))}`} <span style={{color:`${selectedTokenAndNetwork.tokenData.tokenDb.hexColor}`}} className="font-semibold">{selectedTokenAndNetwork.tokenData.tokenDb.symbol}</span> available</p>
                }
              </div>
            </div>
          }
          <div className="h-[7rem]">
          {/* padding div for space between top and main elements */}
          </div>
        </div>
        
    </div>
 
  )
}

export default Send