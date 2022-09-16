import type { NextPage } from 'next'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import {AiFillDownCircle, AiFillUpCircle, AiFillPayCircle} from "react-icons/ai"
import Link from 'next/link'

import { useKryptikAuthContext } from '../../components/KryptikAuthProvider'
import ListBalance from '../../components/lists/ListBalance'
import HeaderProfile from '../../components/HeaderProfile'
import { WalletStatus } from '../../src/models/KryptikWallet'


const Profile: NextPage = () => {
  const { authUser, loadingAuthUser, walletStatus} = useKryptikAuthContext();
  // ROUTE PROTECTOR: Listen for changes on loadingAuthUser and authUser, redirect if needed
  const router = useRouter();
  useEffect(() => {
    if ((!loadingAuthUser && (!authUser || !authUser.isLoggedIn)) || walletStatus!=WalletStatus.Connected)
      router.push('/')
  }, [authUser, loadingAuthUser])

  const handleStartAddName = function(){
    router.push("../wallet/createName")
  }


  return (
    <div>
        <div className="flex flex-col lg:flex-row">
          <div>
            
          </div>

        </div>
        <div className="text-center max-w-2xl mx-auto content-center">
          <HeaderProfile showBio={false} center={true}/>
          <div className="flex items-center mx-auto content-center space-x-4 max-w-xs my-2 p-2">
           <div className='flex-1'>
              <Link href="../wallet/swap">
                  <div  className="w-full px-3 text-center text-sky-500 hover:cursor-pointer hover:text-sky-800 hover:font-semibold hover:animate-pulse">
                      <AiFillPayCircle className="mx-auto" size="30"/>
                      <span className="text-gray-700 dark:text-gray-200 font-semibold">Swap</span>
                  </div>
              </Link>
            </div>
            <div className='flex-1'>
              <Link href="../wallet/receive">
                  <div  className="w-full px-3 text-center text-sky-500 hover:cursor-pointer hover:text-sky-800 hover:font-semibold hover:animate-pulse">
                      <AiFillDownCircle className="mx-auto" size="30"/>
                      <span className="text-gray-700 dark:text-gray-200 font-semibold">Receive</span>
                  </div>
              </Link>
            </div>
            <div className='flex-1'>
            <Link href="../wallet/send">
                <div  className="w-full px-3 text-center text-sky-500 hover:cursor-pointer hover:text-sky-800 hover:font-semibold hover:animate-pulse">
                    <AiFillUpCircle className="mx-auto" size="30"/>
                    <span className="text-gray-700 dark:text-gray-200 font-semibold">Send</span>
                </div>
            </Link>
            </div>
          </div>
          
        </div>

        <div className="max-w-2xl mx-auto mt-4">
          <div className="flex flex-col mx-auto">

            <div className="max-w-2xl">
            <ListBalance/>
            </div>

            {/* <div className="px-4 border hover:border-sky-400 rounded max-w-lg lg:max-w-md mx-auto mt-10 py-4">
              <h1 className="text-2xl text-slate-800 dark:text-slate-200 font-semibold">Add A Custom Name</h1>
              <p className="text-lg text-slate-700 dark:text-slate-300">Make it easier for people to search for your account and send you money.</p>
              <button onClick={()=>handleStartAddName()} className={`bg-transparent hover:bg-green-500 text-green-500 text-2xl font-semibold hover:text-white py-2 px-4 border border-green-500 hover:border-transparent rounded-lg mt-5 mb-2`}>      
                                    Try
              </button>
            </div> */}
            
          </div>
          
        </div>

        {/* uncomment below for side by side view */}
        {/* <div className="max-w-2xl 2xl:max-w-full mx-auto mt-4">
          <div className="flex flex-col 2xl:flex-row mx-auto">
            <div className="2xl:w-[37%]">

            </div>

            <div className="2xl:w-[33%] max-w-2xl">
            <ListBalance/>
            </div>

            <div className="px-4 border hover:border-sky-400 rounded max-w-lg lg:max-w-md mx-auto 2xl:my-auto mt-10 py-4">
              <h1 className="text-2xl text-slate-800 dark:text-slate-200 font-semibold">Add A Custom Name</h1>
              <p className="text-lg text-slate-700 dark:text-slate-300">Make it easier for people to search for your account and send you money.</p>
              <button onClick={()=>handleStartAddName()} className={`bg-transparent hover:bg-green-500 text-green-500 text-2xl font-semibold hover:text-white py-2 px-4 border border-green-500 hover:border-transparent rounded-lg mt-5 mb-2`}>      
                                    Try
              </button>
            </div>
            
          </div>
          
        </div> */}

        

        <div className="min-h-[10vh]">
          {/* spacefiller between content and bottom of the screen */}
        </div>

    </div>
 
  )
}

export default Profile