import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Splash.module.css'
import Link from 'next/link'
import Navbar from '../../components/Navbar'
import { useAuthContext } from '../../components/AuthProvider'
import * as utils from "../../src/helpers/utils"

// wallet SDK helpers
import * as walletMetamask from "../../src/helpers/walletMetamask";
import { IWallet } from '../../models/IWallet'
import { useState } from 'react'


const CreateWallet: NextPage = () => {

  const authContext = useAuthContext();
  const [email, setEmail] = useState("");

  const handleConnect = async (option:string) => {
    let newWallet:IWallet;
    switch (option) {
      // Wallet injected within browser (MetaMask)
      case "metamask":
        newWallet = await walletMetamask.connect();
        break;
      // UNNCOMMENT Below for wallet connect process
      // case "wallet-connect":
      //   newWallet = await walletConnect.connect();
      //   break;
      default:
        newWallet = await walletMetamask.connect();
    }
    console.log("Created wallet:");
    console.log(newWallet);
    
    if(newWallet.connected){
      newWallet.balance = await utils.getCurrentChainBalance(newWallet.browserWeb3Provider, newWallet.address);
      authContext.setWallet(newWallet);
    }
  }

  return (
    <div className="h-screen w-full">
      <Head>
        <title>Art</title>
        <meta name="description" content="Crypto made simple." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
    <main className="mx-auto">
     <Navbar></Navbar>
        <div className="h-[6rem]">
          {/* padding div for space between top and main elements */}
        </div>
        
        <div className="text-center max-w-2xl mx-auto content-center">
          <div className="flex flex-wrap justify-center">
            <div className="w-6/12 sm:w-4/12 px-4 lg:w-32">
              <img src="/kryptikBrand/kryptikEyez.png" alt="Kryptik Eyes" className="rounded-full max-w-full h-auto align-middle border-none" />
            </div>
          </div>
          <h1 className="text-2xl font-bold lg:mb-2">Welcome</h1>
          {/* email input */}        
        </div>
      <form className="w-full max-w-sm mx-auto content-center lg:pr-20">
        <div className="md:flex md:items-center">
          <div className="md:w-1/3">
              <label className="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4">
                Email
              </label>
            </div>
            <div className="md:w-2/3">
              <input className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-400" id="inline-full-name" type="text" placeholder="abcd@gmail.com" required onChange={(e) => setEmail(e.target.value)}/>
            </div>
          </div>
        </form>
           
      </main>

    </div>
 
  )
}

export default CreateWallet;