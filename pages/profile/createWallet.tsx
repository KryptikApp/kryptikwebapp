import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import Navbar from '../../components/Navbar'
import { useAuthContext } from '../../components/AuthProvider'

// wallet SDK helpers
import * as walletMetamask from "../../src/helpers/walletMetamask";
import { IWallet } from '../../models/IWallet'
import { useState } from 'react'
import { connectKryptikWallet } from '../../src/helpers/walletKrypt'
import Web3Service from '../../src/services/Web3Service'

const CreateWallet: NextPage = () => {
  const authContext = useAuthContext();
  const [isLoading, setisLoading] = useState(false);
  

  const handleConnect = async () => {
    setisLoading(true);
    let web3Kryptik = await new Web3Service().StartSevice();
    let newWallet:IWallet;
    newWallet = await connectKryptikWallet();
    console.log("Created NEW KRYPTIK WALLET:");
    if(newWallet.connected){
      console.log("Wallet connected. Pulling balances...");
      let walletBalanceDict:{[ticker: string]: number} = await web3Kryptik.getSeedLoopBalanceAllNetworks(newWallet.seedLoop);
      // set wallet balance to eth balance for now
      newWallet.balance = walletBalanceDict["eth"];
      console.log("Ethereum balance");
      console.log(newWallet.balance);
      authContext.setWallet(newWallet);
    }
    setisLoading(false);
  }


  return (
    <div>
        <div className="h-[7rem]">
          {/* padding div for space between top and main elements */}
        </div>
        {
          // INDICATE CONNECTED
          authContext.wallet.connected ? 
        <div className="textCenter max-w-md mx-auto content-cente">
           <h1 className="text-3xl font-bold ssans ">
             Your wallet is connected.
           </h1>
           <p>
             Eth Address: <span className="bg-clip-text text-green-400">{authContext.wallet.ethAddress}</span>
           </p>
           <p>
             Balance: <span className="bg-clip-text text-green-400">{authContext.wallet.balance}</span>
           </p>
         </div>
        :
        <div className="text-center max-w-md mx-auto content-center">
          <div className="rounded hover:border border-solid border-grey-600 py-10 hover:border-blue-500 hover:shadow-md">

          <div className="flex flex-wrap justify-center">
            <div className="w-6/12 sm:w-4/12 px-4 lg:w-32">
              <img src="/kryptikBrand/kryptikEyez.png" alt="Kryptik Eyes" className="rounded-full max-w-full h-auto align-middle border-none" />
            </div>
          </div>
          <h1 className="text-2xl font-bold lg:mb-2">Welcome</h1>    
          <p>Create your secure, Kryptik wallet in one click.</p>   

        <div className="text-center max-w-2xl mx-auto content-center">
          <div className="flex flex-wrap justify-center">
            <button onClick={()=>handleConnect()} className="bg-transparent hover:bg-green-500 text-green-500 font-semibold hover:text-white py-2 px-4 border border-green-500 hover:border-transparent rounded-lg my-5" disabled={isLoading}>
            {
              // indicate app is creating wallet
              isLoading &&  
              <svg className="animate-spin h-5 w-5 mr-3 ..." viewBox="0 0 24 24">
              {/* spinner */}
              </svg>
            }
           
                         Create Wallet
            </button>
          </div>
          <Link href="../profile/importSeed"><span className="text-blue-400 hover:cursor-pointer hover:text-blue transition-colors duration-300">or import existing seed</span></Link>
        </div>

        </div>
        </div>
           
        }

    </div>
 
  )
}

export default CreateWallet;

