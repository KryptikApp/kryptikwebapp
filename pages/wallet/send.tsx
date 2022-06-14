import type { NextPage } from 'next'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import toast, { Toaster } from 'react-hot-toast'
import { defaultTokenAndNetwork } from '../../src/services/models/network'
import { SendProgress } from '../../src/services/types'
import { AiFillCheckCircle, AiOutlineArrowDown, AiOutlineArrowLeft, AiOutlineWallet } from 'react-icons/ai';
import {RiSwapLine} from "react-icons/ri"
import { isValidAddress, Network, NetworkFamily, NetworkFamilyFromFamilyName, SignedTransaction, TransactionParameters, truncateAddress } from "hdseedloop"

import { getPriceOfTicker } from '../../src/helpers/coinGeckoHelper'
import Divider from '../../components/Divider'
import { useKryptikAuthContext } from '../../components/KryptikAuthProvider'
import DropdownNetworks from '../../components/DropdownNetworks'
import TransactionFeeData, { defaultTransactionFeeData, defaultTxPublishedData, FeeDataParameters, SolTransaction, TransactionPublishedData, TransactionRequest } from '../../src/services/models/transaction'
import { formatTicker, getTransactionExplorerPath, networkFromNetworkDb, roundCryptoAmount, roundToDecimals, roundUsdAmount } from '../../src/helpers/wallet/utils'
import { createEVMTransaction, createSolTransaction } from '../../src/handlers/wallet/transactionHandler'
import { utils } from 'ethers'
import { PublicKey, Transaction } from '@solana/web3.js'




const Send: NextPage = () => {
  interface AmountTotalBounds{
    lowerBoundTotalUsd: string,
    upperBoundTotalUsd: string
  }
  const defaultAmountTotalBounds = {lowerBoundTotalUsd: "0", upperBoundTotalUsd: "0"};
  const { authUser, loading, kryptikWallet, kryptikService } = useKryptikAuthContext();
  const [amountCrypto, setAmountCrypto] = useState("0");
  const [amountUSD, setAmountUSD] = useState("0");
  const [dropdownLoaded, setDropDownLoaded] = useState(false);
  const [amountTotalBounds, setAmountTotalbounds] = useState<AmountTotalBounds>(defaultAmountTotalBounds);
  const [transactionFeeData, setTransactionFeedata] = useState(defaultTransactionFeeData)
  const [txPubData, setTxPubData] = useState<TransactionPublishedData>(defaultTxPublishedData);
  const [tokenPrice, setTokenPrice] = useState(0);
  const [fromAddress, setFromAddress] = useState(kryptikWallet.ethAddress);
  const [toAddress, setToAddress] = useState("");
  const [isInputCrypto, setIsInputCrypto] = useState(false);
  const [readableToAddress, setReadableToAddress] = useState("");
  const [readableFromAddress, setReadableFromAddress] = useState("");
  const [forMessage, setForMessage] = useState("");
  const [isLoading, setisLoading] = useState(false);
  const [progress, setProgress] = useState(SendProgress.Begin);
  const[selectedTokenAndNetwork, setSelectedTokenAndNetwork] = useState(defaultTokenAndNetwork);


  const router = useRouter();
  // ROUTE PROTECTOR: Listen for changes on loading and authUser, redirect if needed
  useEffect(() => {
    if (!loading && !authUser) router.push('/');
  }, [authUser, loading])

  // retrieves wallet balances
  const fetchFromAddress = async() =>{
     let accountAddress = await kryptikService.getAddressForNetworkDb(kryptikWallet, selectedTokenAndNetwork.baseNetworkDb);
     let network:Network = networkFromNetworkDb(selectedTokenAndNetwork.baseNetworkDb);
      // handle empty address
      if(accountAddress == ""){
        toast.error(`Error: no address found for ${selectedTokenAndNetwork.baseNetworkDb.fullName}. Please contact the Kryptik team or try refreshing your page.`);
        setFromAddress(kryptikWallet.ethAddress);      
        setReadableFromAddress(truncateAddress(kryptikWallet.ethAddress, network));
        setSelectedTokenAndNetwork(defaultTokenAndNetwork);
        return;
      }
      setFromAddress(accountAddress);
      setReadableFromAddress(truncateAddress(accountAddress, network));
  }

  const fetchTokenPrice = async() =>{
    let coingeckoId = selectedTokenAndNetwork.tokenData?selectedTokenAndNetwork.tokenData.tokenDb.coingeckoId:
    selectedTokenAndNetwork.baseNetworkDb.coingeckoId;
    let tokenPriceCoinGecko:number = await getPriceOfTicker(coingeckoId);
    setTokenPrice(tokenPriceCoinGecko);
  }

  const fetchNetworkFees = async(solTx?:Transaction) =>{
    let feeDataParams:FeeDataParameters = {
      networkDb: selectedTokenAndNetwork.baseNetworkDb,
      tokenData: selectedTokenAndNetwork.tokenData,
      amountToken: amountCrypto,
      solTransaction: solTx
    }
    let transactionFeeDataFresh:TransactionFeeData|null = await kryptikService.getTransactionFeeData(feeDataParams);
    if(transactionFeeDataFresh){
      setTransactionFeedata(transactionFeeDataFresh);
    }
    else{
      setTransactionFeedata(defaultTransactionFeeData);
    }
  }

  // gets solana tx. fees and sets sol transaction
  const fetchSolTransactionFees = async()=>{
      let nw:Network =  networkFromNetworkDb(selectedTokenAndNetwork.baseNetworkDb);
      let kryptikProvider = kryptikService.getProviderForNetwork(selectedTokenAndNetwork.baseNetworkDb);
      // get solana transaction fee
      if(nw.networkFamily != NetworkFamily.Solana){
        return;
      }
      let txIn:SolTransaction = {
        sendAccount: fromAddress,
        toAddress: toAddress,
        valueSol: Number(amountCrypto),
        kryptikProvider: kryptikProvider,
        networkDb: selectedTokenAndNetwork.baseNetworkDb
      }
      let txSol:Transaction = await createSolTransaction(txIn);
      await fetchNetworkFees(txSol);
  }

  useEffect(()=>{
      fetchFromAddress();
      fetchTokenPrice();
      fetchNetworkFees();
      handleAmountChange("0");
  }, [selectedTokenAndNetwork]);

  useEffect(()=>{
    updateTotalBounds();
  }, [amountUSD, transactionFeeData]);

  // get solana tx. fees upon review
  useEffect(()=>{
    if(progress != SendProgress.Rewiew){
      return;
    }
    fetchSolTransactionFees()
  }, [progress]);

  const handleDropdownLoaded = function(){
    setDropDownLoaded(true);
  }

  const handleToggleIsCrypto = function(){
    setIsInputCrypto(!isInputCrypto);
 }

  const handleToAddressChange = function(toAddressIn:string){
    setToAddress(toAddressIn);
  }

  const setMaxAmount = function(){
    console.log("Setting max amount called");
    // UPDATE SO SOLANA CAN BE SET MAX
    if(NetworkFamilyFromFamilyName(selectedTokenAndNetwork.baseNetworkDb.networkFamilyName)==NetworkFamily.Solana) return;
    console.log("1");
    // set max with token value
    if(selectedTokenAndNetwork.tokenData){
      if(!selectedTokenAndNetwork.tokenData.tokenBalance) return;
      let maxAmountCrypto = Number(selectedTokenAndNetwork.tokenData.tokenBalance.amountCrypto)-Number(amountTotalBounds.upperBoundTotalUsd)/tokenPrice;
      let maxAmountUsd = maxAmountCrypto*tokenPrice;
      setAmountCrypto(maxAmountCrypto.toString());
      setAmountUSD(maxAmountUsd.toString());
    }
    // set max with 
    else{
      console.log("5");
      if(!selectedTokenAndNetwork.networkBalance) return;
      console.log("Setting max amount");
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

  const handleAmountChange = function(amountIn:string){
      let amount:string = amountIn;
      if(!isInputCrypto){
        amount = amount.slice(1, amount.length);
        let lastChar:string = amount.slice(-1);
        let oldAmount:string = amount.slice(0, -1);
        console.log(oldAmount);
        if(lastChar == "." && !isNaN(Number(oldAmount))){
          setAmountUSD(amount);
          return;
        }
        amount = Number(amount).toString();
        if(amount == "NaN"){
          amount = "0";
        }
        // calcaulate token amount from usd input and token price
        let amountToken:number = Number(amount)/tokenPrice;
        if(amountToken.toString() == "NaN"){
          amount = "0";
          amountToken = 0;
        }
        setAmountUSD(amount);
        setAmountCrypto(amountToken.toString());
      }
      // case: user input is denominated in tokens
      else{
        if(isNaN(Number(amount))){
          return;
        }
        let amountToken:number = Number(amount) 
        setAmountCrypto(amountToken.toString());
        // calculate usd amount from token input and token price
        let amountUsd:number = amountToken*tokenPrice;
        setAmountUSD(amountUsd.toString());
      } 
  }

  const handleStartParameterSetting = function(){
    setisLoading(true);
    // VERIFY sender has sufficient balance
    // token main send
    if(amountCrypto == "0"){
      toast.error("Please enter a nonzero amount.");
      return;
    }
    if(selectedTokenAndNetwork.tokenData && (Number(selectedTokenAndNetwork.tokenData.tokenBalance?.amountCrypto) < Number(amountCrypto))){
      toast.error(`You don't have enough ${selectedTokenAndNetwork.tokenData.tokenDb.name} to complete this transaction`);
      setisLoading(false);
      return;
    }
    // check sufficient network balance for tx. fees (when sending token)
    if(selectedTokenAndNetwork.tokenData && (Number(selectedTokenAndNetwork.networkBalance?.amountCrypto) < Number(transactionFeeData.upperBoundCrypto))){
      toast.error(`You don't have enough ${selectedTokenAndNetwork.baseNetworkDb.fullName} to pay for network transaction fees`);
      setisLoading(false);
      return;
    }
    // sending base network token... check balance vs. total amount (send+fees)
    if(!selectedTokenAndNetwork.tokenData && Number(selectedTokenAndNetwork.networkBalance?.amountUSD)<Number(amountTotalBounds.upperBoundTotalUsd)){
      toast.error(`You don't have enough ${selectedTokenAndNetwork.baseNetworkDb.fullName} to complete this transaction`);
      setisLoading(false);
      return;
    }
    // VERIFICATION COMPLETE
    setProgress(SendProgress.SetParamaters);
    setisLoading(false);
  }

  const handleStartReview = function(){
    setisLoading(true);
    // verify recipient address is correct
    let nw:Network =  networkFromNetworkDb(selectedTokenAndNetwork.baseNetworkDb);
    // format recipient address
    if(!isValidAddress(toAddress, nw)){
       toast.error("Invalid address.");
       setisLoading(false);
       return;
    }

    setReadableToAddress(truncateAddress(toAddress, nw));
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
    setReadableFromAddress(truncateAddress(kryptikWallet.ethAddress, nw));
    setReadableToAddress("");
    setTxPubData(defaultTxPublishedData);
    setSelectedTokenAndNetwork(defaultTokenAndNetwork);
    if(!isComplete) setProgress(SendProgress.Begin);
    setisLoading(false);
  };

  // handler for when user clicks create transaction button
  const handleSendTransaction = async function(){
    setisLoading(true);
    console.log("Running send tx");
    await handleCreateTransaction();
    console.log("rannnn!");
    setProgress(SendProgress.Complete);
    setisLoading(false);
  }

  const handleCreateTransaction = async function(){
    let network =  networkFromNetworkDb(selectedTokenAndNetwork.baseNetworkDb);
    let kryptikProvider = kryptikService.getProviderForNetwork(selectedTokenAndNetwork.baseNetworkDb);
    let txDoneData:TransactionPublishedData = defaultTxPublishedData;
    // UPDATE TO REFLECT ERROR IN UI
    switch(network.networkFamily){
      case (NetworkFamily.EVM): { 
          if(!kryptikProvider.ethProvider){
            toast.error(`Error: Provider not set for ${network.fullName}`);
            handleCancelTransaction();
            return null;
          }
          let ethProvider = kryptikProvider.ethProvider;
          // amount with correct number of decimals
          let tokenDecimals = selectedTokenAndNetwork.tokenData?.tokenDb.decimals;
          let amountDecimals = roundToDecimals(Number(amountCrypto), tokenDecimals).toString();
          // sign and send erc20 token
          if(selectedTokenAndNetwork.tokenData){
             let txResponse = await selectedTokenAndNetwork.tokenData.tokenContractConnected.transfer(toAddress, utils.parseEther(amountDecimals));
             if(txResponse.hash) txDoneData.hash = txResponse.hash;
          }
          else{
              let EVMTransaction:TransactionRequest = await createEVMTransaction({value: utils.parseEther(amountDecimals), sendAccount: fromAddress,
                toAddress: toAddress, gasLimit:transactionFeeData.EVMGas.gasLimit, 
                maxFeePerGas:transactionFeeData.EVMGas.maxFeePerGas, 
                maxPriorityFeePerGas:transactionFeeData.EVMGas.maxPriorityFeePerGas, 
                networkDb:selectedTokenAndNetwork.baseNetworkDb, 
                gasPrice: transactionFeeData.EVMGas.gasPrice,
                kryptikProvider:kryptikService.getProviderForNetwork(selectedTokenAndNetwork.baseNetworkDb)});
              let kryptikTxParams:TransactionParameters = {
                  evmTransaction: EVMTransaction
              }
              let signedTx:SignedTransaction = await kryptikWallet.seedLoop.signTransaction(fromAddress, kryptikTxParams, network);
              if(!signedTx.evmFamilyTx) throw(new Error("Error: Unable to sign EVM transaction"));
              console.log(signedTx.evmFamilyTx);
              let txResponse = await ethProvider.sendTransaction(signedTx.evmFamilyTx);
              txDoneData.hash = txResponse.hash;
          }
          // set tx. explorer path
          let txExplorerPath:string|null = getTransactionExplorerPath(selectedTokenAndNetwork.baseNetworkDb, txDoneData);
          txDoneData.explorerPath = txExplorerPath?txExplorerPath:txDoneData.explorerPath;
          setTxPubData(txDoneData);
          break; 
      } 
      case(NetworkFamily.Solana):{
          if(!kryptikProvider.solProvider){
            toast.error(`Error: Provider not set for ${network.fullName}`);
            handleCancelTransaction();
            return null;
          }
          let solProvider = kryptikProvider.solProvider;
          let txIn:SolTransaction = {
            sendAccount: fromAddress,
            toAddress: toAddress,
            valueSol: Number(amountCrypto),
            kryptikProvider: kryptikProvider,
            networkDb: selectedTokenAndNetwork.baseNetworkDb
          }
          let txSol:Transaction = await createSolTransaction(txIn);
          let kryptikTxParams:TransactionParameters = {
            solTransactionBuffer: txSol.serializeMessage()
          };
          const signature = await kryptikWallet.seedLoop.signTransaction(fromAddress, kryptikTxParams, network);
          if(!signature.solanaFamilyTx){
            toast.error(`Error: Unable to create signature for ${selectedTokenAndNetwork.baseNetworkDb.fullName} transaction.`);
            handleCancelTransaction();
            return null;
          }
          txSol.addSignature(new PublicKey(fromAddress), Buffer.from(signature.solanaFamilyTx));
          if(!txSol.verifySignatures()){
            toast.error(`Error: Unable to verify signature for ${selectedTokenAndNetwork.baseNetworkDb.fullName} transaction.`);
            handleCancelTransaction();
            return null;
          }
          const txPostResult = await solProvider.sendRawTransaction(txSol.serialize());
          txDoneData.hash = txPostResult;
          // set tx. explorer path
          let txExplorerPath:string|null = getTransactionExplorerPath(selectedTokenAndNetwork.baseNetworkDb, txDoneData);
          txDoneData.explorerPath = txExplorerPath? txExplorerPath:txDoneData.explorerPath;
          setTxPubData(txDoneData);
          break;
      }
      default: { 
          return toast.error(`Error: Unable to build transaction for ${selectedTokenAndNetwork.baseNetworkDb.fullName}`);
          break; 
      } 
      setProgress(SendProgress.Complete);
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

  return (
    <div>
          <Toaster/>
          <div className="text-center max-w-xl mx-auto content-center">
          {
            ((progress != SendProgress.Begin) && progress!= SendProgress.Rewiew && progress != SendProgress.Complete)  &&
            <div className="align-left m-7">
              <AiOutlineArrowLeft className="hover:cursor-pointer" onClick={()=>handleClickBack()} size="30"/>
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
                <input className="w-full py-2 px-4 text-sky-400 leading-tight focus:outline-none text-8xl text-center" id="amount" placeholder="$0" autoComplete="off" required value={isInputCrypto? `${amountCrypto}`:`$${amountUSD}`} onChange={(e) => handleAmountChange(e.target.value)}/>
              </div>
              <br/>
              <div className="rounded-full border border-gray-400 p-1 max-w-fit inline mr-2 text-slate-400 hover:cursor-pointer hover:bg-slate-100 hover:text-sky-400 hover:font-semibold" onClick={()=>setMaxAmount()}>
                <span className="text-xs">MAX</span>
              </div>
              <span className="text-slate-400 text-sm inline">{!isInputCrypto? `${roundCryptoAmount(Number(amountCrypto))} ${selectedTokenAndNetwork.tokenData?formatTicker(selectedTokenAndNetwork.tokenData.tokenDb.symbol):formatTicker(selectedTokenAndNetwork.baseNetworkDb.ticker)}`:`$${amountUSD}`}</span>
              <RiSwapLine className="hover:cursor-pointer inline text-slate-300 ml-2" onClick={()=>handleToggleIsCrypto()} size="20"/>
              {/* network dropdown */}
                <div className="max-w-xs mx-auto">
                    <DropdownNetworks selectedTokenAndNetwork={selectedTokenAndNetwork} selectFunction={setSelectedTokenAndNetwork} onlyWithValue={true} onLoadedFunction={handleDropdownLoaded}/>
                </div>
              {/* skeleton fee loader */}
              {
                (!dropdownLoaded) &&
                <div className="w-40 h-6 mt-2 truncate bg-gray-300 animate-pulse rounded mx-auto"/>
              }
              {/* case: network family is ethereum and network fees are different */}
              {
                  (transactionFeeData.isFresh && dropdownLoaded &&
                  networkFromNetworkDb(selectedTokenAndNetwork.baseNetworkDb).networkFamily!=NetworkFamily.Solana) && networkFromNetworkDb(selectedTokenAndNetwork.baseNetworkDb).networkFamily==NetworkFamily.EVM && (transactionFeeData.lowerBoundUSD != transactionFeeData.upperBoundUSD) &&
                  <div>
                    <p className="text-slate-400 text-sm inline">Fees: {`$${roundUsdAmount(transactionFeeData.lowerBoundUSD)}-$${roundUsdAmount(transactionFeeData.upperBoundUSD)}`}</p>
                  </div>
              }
              {/* case: network family is ethereum and network fees are same */}
              {
                  (transactionFeeData.isFresh && dropdownLoaded &&
                  networkFromNetworkDb(selectedTokenAndNetwork.baseNetworkDb).networkFamily!=NetworkFamily.Solana) && networkFromNetworkDb(selectedTokenAndNetwork.baseNetworkDb).networkFamily==NetworkFamily.EVM && (transactionFeeData.lowerBoundUSD == transactionFeeData.upperBoundUSD) &&
                  <div>
                    <p className="text-slate-400 text-sm inline">Fees: {`$${roundUsdAmount(transactionFeeData.upperBoundUSD)}`}</p>
                  </div>
              }
              {/* case: network family is solana */}
              {
                  (  networkFromNetworkDb(selectedTokenAndNetwork.baseNetworkDb).networkFamily == NetworkFamily.Solana) &&
                  <div>
                    <p className="text-slate-400 text-sm inline">Fees will be calculated on review</p>
                  </div>
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
                  <span className="inline mx-2">${amountUSD}</span>
                </div>
                
                <div className="px-5 py-5 m-2 rounded mt-0 mb-0">
                    {/* to input */}
                    <label className="block text-gray-500 font-bold text-left mb-1 md:mb-0 pr-4">
                      To
                    </label>
                    <input className="bg-white appearance-none border-2 border-gray-400 rounded w-full py-4 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-400" value={toAddress} onChange={(e) => handleToAddressChange(e.target.value)} id="inline-to"/>
                    {/* for input */}
                    <label className="block text-gray-500 font-bold text-left mb-1 md:mb-0 pr-4">
                      For
                    </label>
                    <textarea maxLength={150} className="bg-white appearance-none border-2 border-gray-400 rounded w-full py-4 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-400" id="inline-forMessage" placeholder={"Pizza, rent, etc."} value={forMessage} onChange={(e) => setForMessage(e.target.value)}/>
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
                      <h4 className="font-bold text-lg mx-auto content-center">Review Transaction</h4>
                    </div>
                    <div className='flex-1'>
                        {/* space filler */}
                    </div>
                  </div>
                  

                  <div className="border border-solid border-1 border-gray-300 py-4 rounded-lg mx-2">

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
                        <p className="font-semibold text-base mx-2">{selectedTokenAndNetwork.tokenData?selectedTokenAndNetwork.tokenData.tokenDb.name:selectedTokenAndNetwork.baseNetworkDb.fullName}</p>
                      </div>
                      <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900 truncate">
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
                          <p className="italic">{readableToAddress}</p>
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
                            <p className="text-slate-600 text-left">Wallet Used</p>
                          </div>
                          <div className="flex-1 px-1">
                            <p className="text-right">{readableFromAddress}</p>
                          </div>
                    </div>
                    <div className="flex flex-row">
                          <div className="flex-1">
                            <p className="text-slate-600 text-left">Blockchain</p>
                          </div>
                          <div className="flex-1 px-1">
                            <p className="text-right">{selectedTokenAndNetwork.baseNetworkDb.fullName}</p>
                          </div>
                    </div>
                    <div className="flex flex-row">
                          <div className="flex-1">
                            <p className="text-slate-600 text-left">Network Fees</p>
                          </div>
                          <div className="flex-1 px-1">
                            {
                               (networkFromNetworkDb(selectedTokenAndNetwork.baseNetworkDb).networkFamily == NetworkFamily.Solana || transactionFeeData.lowerBoundUSD == transactionFeeData.upperBoundUSD)?
                              <p className="text-right">{`$${roundUsdAmount(transactionFeeData.upperBoundUSD)}`}</p>:
                              <p className="text-right">{`$${roundUsdAmount(transactionFeeData.lowerBoundUSD)}-$${roundUsdAmount(transactionFeeData.upperBoundUSD)}`}</p>
                            }
                          </div>
                    </div>
                    <div className="flex flex-row">
                          <div className="flex-1">
                            <p className="text-slate-600 text-left">Total Amount</p>
                          </div>
                          <div className="flex-1 px-1">
                            {
                               (networkFromNetworkDb(selectedTokenAndNetwork.baseNetworkDb).networkFamily == NetworkFamily.Solana || amountTotalBounds.lowerBoundTotalUsd == amountTotalBounds.upperBoundTotalUsd)?
                              <p className="text-right">{`$${roundUsdAmount(Number(amountTotalBounds.upperBoundTotalUsd))}`}</p>:
                              <p className="text-right">{`$${roundUsdAmount(Number(amountTotalBounds.lowerBoundTotalUsd))}-$${roundUsdAmount(Number(amountTotalBounds.upperBoundTotalUsd))}`}</p>
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
                        <p className="font-semibold text-base mx-2">{selectedTokenAndNetwork.tokenData?selectedTokenAndNetwork.tokenData.tokenDb.name:selectedTokenAndNetwork.baseNetworkDb.fullName}</p>
                      </div>
                      <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            ${amountUSD}
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
                          <p className="italic">{readableToAddress}</p>
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
                            <p className="text-slate-600 text-left">Wallet Used</p>
                          </div>
                          <div className="flex-1 px-1">
                            <p className="text-right">{readableFromAddress}</p>
                          </div>
                    </div>
                    <div className="flex flex-row">
                          <div className="flex-1">
                            <p className="text-slate-600 text-left">Blockchain</p>
                          </div>
                          <div className="flex-1 px-1">
                            <p className="text-right">{selectedTokenAndNetwork.baseNetworkDb.fullName}</p>
                          </div>
                    </div>
                    <div className="flex flex-row">
                          <div className="flex-1">
                            <p className="text-slate-600 text-left">Network Fees</p>
                          </div>
                          <div className="flex-1 px-1">
                            {
                               networkFromNetworkDb(selectedTokenAndNetwork.baseNetworkDb).networkFamily == NetworkFamily.Solana?
                              <p className="text-right">{`$${roundUsdAmount(transactionFeeData.upperBoundUSD)}`}</p>:
                              <p className="text-right">{`$${roundUsdAmount(transactionFeeData.lowerBoundUSD)}-$${roundUsdAmount(transactionFeeData.upperBoundUSD)}`}</p>
                            }
                          </div>
                    </div>
                    <div className="flex flex-row">
                          <div className="flex-1">
                            <p className="text-slate-600 text-left">Total Amount</p>
                          </div>
                          <div className="flex-1 px-1">
                            {
                               networkFromNetworkDb(selectedTokenAndNetwork.baseNetworkDb).networkFamily == NetworkFamily.Solana?
                              <p className="text-right">{`$${roundUsdAmount(transactionFeeData.upperBoundUSD)}`}</p>:
                              <p className="text-right">{`$${roundUsdAmount(Number(amountTotalBounds.lowerBoundTotalUsd))}-$${roundUsdAmount(Number(amountTotalBounds.upperBoundTotalUsd))}`}</p>
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
          
          
          <Divider/>
          <div className="h-[7rem]">
          {/* padding div for space between top and main elements */}
          </div>
        </div>
        
    </div>
 
  )
}

export default Send