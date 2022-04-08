import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Splash.module.css'
import Link from 'next/link'
import Navbar from '../../components/Navbar'
import { useAuthContext } from '../../components/AuthProvider'
import * as utils from "../../src/helpers/utils"

// wallet SDK helpers
import { IWallet } from '../../models/IWallet'
import { useState } from 'react'
import { connectKryptikWallet } from '../../src/helpers/walletKrypt'

const ImportSeed: NextPage = () => {

  const authContext = useAuthContext();
  const [seed, setSeed] = useState("");

  function handleCreateWallet(): void {
    throw new Error('Function not implemented.')
  }


  const handleClickImport = async () =>{
    let newWallet:IWallet;
    newWallet = await connectKryptikWallet(seed);
    console.log("Created wallet:");
    console.log(newWallet);
    if(newWallet.connected){
      // newWallet.balance = await utils.getSeedLoopBalance(newWallet.seedLoop);
      authContext.setWallet(newWallet);
    }
  }

  return (
    <div className="h-screen w-full">
        <div className="h-[7rem]">
          {/* padding div for space between top and main elements */}
        </div>
        
        <div className="text-center max-w-2xl mx-auto content-center">
          <div className="flex flex-wrap justify-center">
            <div className="w-6/12 sm:w-4/12 px-4 lg:w-32">
              <img src="/kryptikBrand/kryptikEyez.png" alt="Kryptik Eyes" className="rounded-full max-w-full h-auto align-middle border-none" />
            </div>
          </div>
          <h1 className="text-2xl font-bold lg:mb-2">Import Wallet</h1>       
        </div>
        {/* email input */} 
      <form className="w-full max-w-sm mx-auto content-center lg:pr-20">
        <div className="md:flex md:items-center">
          <div className="md:w-1/3">
              <label className="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4">
                Your Seed
              </label>
            </div>
            <div className="md:w-2/3">
              <input type="password" className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-400" id="inline-full-name" placeholder="abcd@gmail.com" required onChange={(e) => setSeed(e.target.value)}/>
            </div>
          </div>
          
        </form>
        <div className="text-center max-w-2xl mx-auto content-center">
          <div className="flex flex-wrap justify-center">
            <button onClick={()=>handleCreateWallet()} className="bg-transparent hover:bg-green-500 text-green-500 font-semibold hover:text-white py-2 px-4 border border-green-500 hover:border-transparent rounded-lg my-5">
                         Import Seed
            </button>
          </div>
        </div>

    </div>
 
  )
}

export default ImportSeed;