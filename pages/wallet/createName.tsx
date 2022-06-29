import type { NextPage } from 'next'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import {AiFillDownCircle, AiFillUpCircle, AiFillPayCircle} from "react-icons/ai"
import Link from 'next/link'

import { useKryptikAuthContext } from '../../components/KryptikAuthProvider'
import ListBalance from '../../components/lists/ListBalance'
import HeaderProfile from '../../components/HeaderProfile'
import Divider from '../../components/Divider'
import toast, { Toaster } from 'react-hot-toast'
import { checkNEARAccountAvailable, INEARAccountAvailableParams, INearReservationParams, isLegitNEARAccountId, reserveNearAccountName } from '../../src/helpers/utils/nearAccountUtils'
import { NetworkDb } from '../../src/services/models/network'
import { defaultKryptikProvider } from '../../src/services/models/provider'
import { Network, truncateAddress } from 'hdseedloop'
import { networkFromNetworkDb } from '../../src/helpers/utils/networkUtils'
import { TransactionPublishedData } from '../../src/services/models/transaction'


const CreateName: NextPage = () => {
  const { authUser, loading, kryptikWallet, kryptikService } = useKryptikAuthContext();
  const router = useRouter();
  const [nameIsAvailable, setNameIsAvailable] = useState(false);
  const [updateMsg, setUpdateMsg] = useState<string|null>(null);
  const [name, setName] = useState("");
  const [currentAddress, setCurrentAddress] = useState("");
  const [readableCurrentAddress, setReadableCurrentADdress] = useState("");
  const [kryptikProvider, setKryptikProvider] = useState(defaultKryptikProvider)
  const [isUpdateLoading, setIsUpdateLoading] = useState(false);
  const [isReservationLoading, setIsReservationLoading] = useState(false);
  // ROUTE PROTECTOR: Listen for changes on loading and authUser, redirect if needed
  useEffect(() => {
    if (!loading && !authUser.isLoggedIn)
      router.push('/')
  }, [authUser, loading])

  const fetchNameData = async function(){
    let networkDb:NetworkDb|null = kryptikService.getNetworkDbByTicker("near");
    if(!networkDb) return;
    let network:Network = networkFromNetworkDb(networkDb);
    let newKryptikProvider = await kryptikService.getKryptikProviderForNetworkDb(networkDb);
    if(!newKryptikProvider) return;
    let newCurrentAddy = await kryptikService.getAddressForNetworkDb(kryptikWallet, networkDb);
    if(!newCurrentAddy) return;
    setCurrentAddress(newCurrentAddy);
    setReadableCurrentADdress(truncateAddress(newCurrentAddy, network));
    setKryptikProvider(newKryptikProvider);
  }

  const fetchNameAvailability = async function(){
    // check if contains any invalid characters
    setIsUpdateLoading(true);
    let accountIdToPassIn:string = name.includes(".near")?name:name+".near";
    const checkAccountParams:INEARAccountAvailableParams ={
        accountIdCurrent: currentAddress,
        accountId: accountIdToPassIn,
        kryptikProvider: kryptikProvider,
        updateMessageHandler: updateMessageManager
     }
     let isNameValid = await checkNEARAccountAvailable(checkAccountParams);
     console.log(`Is name valid? ${isNameValid}`);
     setNameIsAvailable(isNameValid);
     setIsUpdateLoading(false);
  }

  useEffect(()=>{
    fetchNameData();
  },[])

  useEffect(()=>{
    fetchNameAvailability();
  }, [name])

  const updateMessageManager = function(msg:string, isError:boolean){
    setUpdateMsg(msg);
  }

  const handleUpdateNearName = async function(newName:string){
    // name should only be lower case
    newName = newName.toLowerCase();
    if(newName == "" || newName.length<=2){
        setName(newName);
        return;
    }
    // check if new name is invalid format
    if(newName.includes("@")) return;
    setName(newName);
  }

  // handler passed as parameter into publish tx. method
  const errorHandler = function(message:string, isFatal=false){
    // show failure screen
    // typically used for errors when pushing to blockchain
    if(isFatal){
      console.log("Name build error was fatal")
      return;
    }
    toast.error(message);
    setName("");
  }

  const handleClickFinalizeName = async function(){
    setIsReservationLoading(true);
    let accountIdToPassIn:string = name.includes(".near")?name:name+".near";
     const checkAccountParams:INEARAccountAvailableParams ={
        accountIdCurrent: currentAddress,
        accountId: accountIdToPassIn,
        kryptikProvider: kryptikProvider
     }
     let isNameValid = await checkNEARAccountAvailable(checkAccountParams);
     console.log(`Is name valid reservation? ${isNameValid}`);
     if(!isNameValid){
        setIsReservationLoading(false);
        return;
     }
     
     let publishParams:INearReservationParams = {
        kryptikService: kryptikService,
        wallet: kryptikWallet,
        newAccountId: accountIdToPassIn,
        errorHandler: errorHandler,
        fromAddress: currentAddress
     }
     // publish tx.
     let txPubdata:TransactionPublishedData|null = await reserveNearAccountName(publishParams);
     console.log(txPubdata);
     setIsReservationLoading(false);
  }

  return (
    <div>
        <Toaster/>
        <div className="h-[2rem]">
        {/* padding div for space between top and main elements */}
        </div>
        <div className="max-w-lg mx-auto rounded-md border border-solid py-10 px-6 border-gray-400 dark:border-gray-700">
            <h1 className="text-4xl font-bold sans mb-5 dark:text-white">
                    Add Custom NEAR Name
            </h1>
            <Divider/>
            <p className="text-slate-700 mb-2 dark:text-white">Create a unique name on Near Protocol. Your custom name will be used for all actions on the NEAR Protocol blockchain.</p>
            <p className="mb-2 text-justify text-sm text-gray-500 dark:text-gray-400">Current name: <span className="italic">{readableCurrentAddress}</span></p>
            <div className="py-5 rounded mb-0 ">
              <label className="block text-gray-500 font-bold md:text-left mb-2 md:mb-0 pr-4">
               Account Name
              </label>
              <input maxLength={64} className={`bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-4 px-4 text-gray-700 leading-tight font-semibold focus:outline-none focus:bg-white ${(name.length>=2)?(nameIsAvailable?"focus:border-green-400":"focus:border-red-400"):"focus:border-blue-400"} dark:bg-[#141414] dark:text-white`} id="inline-full-name" placeholder={"myname.near"} value={name} onChange={(e) => handleUpdateNearName(e.target.value)}/>
             {
                 (!isUpdateLoading && name.length>=2)?
                <p className={`text-sm font-semibold ${nameIsAvailable?`text-green-500`:`text-red-500`}`}>{nameIsAvailable?"Woohoo! Your name is available.":updateMsg}</p>
                :
                <p className="mt-1 text-sm text-gray-400 dark:text-gray-500 italic">Be fun, be fresh!</p>
            }
            </div>
            <div className="content-center mx-auto text-center">
                <button onClick={()=>handleClickFinalizeName()} className={`bg-transparent hover:bg-sky-500 text-sky-500 font-semibold text-xl rounded-full hover:text-white py-2 px-14 mx-auto ${isUpdateLoading?"hover:cursor-not-allowed":""} border border-sky-500 hover:border-transparent rounded-lg my-5 transition-colors duration-100`} disabled={isUpdateLoading}>
                            Reserve My Name
                            {
                                        !isReservationLoading?"":
                                        <svg role="status" className="inline w-4 h-4 ml-3 text-white animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB"/>
                                        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor"/>
                                        </svg>
                            }
                </button>
            </div>
            
        </div>

    </div>
 
  )
}

export default CreateName