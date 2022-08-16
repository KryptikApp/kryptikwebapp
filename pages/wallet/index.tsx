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


  return (
    <div>
      
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
          <ListBalance/>
        </div>

        <div className="min-h-[10vh]">
          {/* spacefiller between content and bottom of the screen */}
        </div>

    </div>
 
  )
}

export default Profile