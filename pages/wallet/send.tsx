import type { NextPage } from 'next'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Divider from '../../components/Divider'
import { useKryptikAuthContext } from '../../components/KryptikAuthProvider'
import HeaderProfile from '../../components/HeaderProfile'
import { slice } from 'lodash'
import DropdownNetworks from '../../components/DropdownNetworks'
import { Toaster } from 'react-hot-toast'
import { defaultNetworkDb } from '../../src/services/models/network'

const Send: NextPage = () => {
  const { authUser, loading } = useKryptikAuthContext();
  const [amountDisplay, setAmountDisplay] = useState("0")
  const [toAddress, setToAddress] = useState("");
  const [forMessage, setForMessage] = useState("");
  const [isLoading, setisLoading] = useState(false);
  const[selectedNetwork, setSelectedNetwork] = useState(defaultNetworkDb);

  const router = useRouter();
  const allowedInputs = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "."]
  // ROUTE PROTECTOR: Listen for changes on loading and authUser, redirect if needed
  useEffect(() => {
    if (!loading && !authUser)
      router.push('/')
  }, [authUser, loading])

  const handleToAddressChange = function(toAddressIn:string){
    setToAddress(toAddressIn);
  }

  const handleAmountChange = function(amountIn:string){
      let amount:string = amountIn;
      amount = amount.slice(1, amount.length);
      let lastChar:string = amount.slice(-1);
      let oldAmount:string = amount.slice(0, -1);
      console.log(oldAmount);
      if(lastChar == "." && !isNaN(Number(oldAmount))){
        setAmountDisplay(amount);
        return;
      }
      console.log("Amount trimmed:");
      console.log(amount);
      console.log(Number(amount));
      amount = Number(amount).toString();
      if(amount == "NaN"){
        amount = "0";
      }
      setAmountDisplay(amount)
  }

  // handler for when user clicks create transaction button
  const handleCreateTransaction = function(){
    setisLoading(true);
  }


  return (
    <div>
        <Toaster/>

        <div className="w-400">
          <div className="max-w-xs">
              <DropdownNetworks selectedNetwork={selectedNetwork} selectFunction={setSelectedNetwork}/>
          </div>
        </div>

        <div className="text-center max-w-xl mx-auto content-center">
          <div className="flex justify-start mt-5">
            <input className="w-full py-2 px-4 text-sky-400 leading-tight focus:outline-none text-8xl text-center" id="inline-full-name" placeholder="$0" required value={`$${amountDisplay}`} onChange={(e) => handleAmountChange(e.target.value)}/>
          </div>
          <div className="px-5 py-5 m-2 rounded mt-0 mb-0">
          <label className="block text-gray-500 font-bold text-left mb-1 md:mb-0 pr-4">
                To
              </label>
              <input className="bg-white appearance-none border-2 border-gray-400 rounded w-full py-4 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-400" value={toAddress} onChange={(e) => handleToAddressChange(e.target.value)} id="inline-to"/>
              <label className="block text-gray-500 font-bold text-left mb-1 md:mb-0 pr-4">
                For
              </label>
              <textarea maxLength={150} className="bg-white appearance-none border-2 border-gray-400 rounded w-full py-4 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-400" id="inline-forMessage" placeholder={"Pizza, rent, etc."} value={forMessage} onChange={(e) => setForMessage(e.target.value)}/>
              <button onClick={()=>handleCreateTransaction()} className={`bg-transparent hover:bg-green-500 text-green-500 font-semibold hover:text-white text-2xl py-2 px-20 ${isLoading?"hover:cursor-not-allowed":""} border border-green-500 hover:border-transparent rounded-lg my-5`} disabled={isLoading}>      
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
          <Divider/>
          <div className="h-[7rem]">
          {/* padding div for space between top and main elements */}
          </div>
        </div>
        
    </div>
 
  )
}

export default Send