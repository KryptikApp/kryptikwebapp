import type { NextPage } from 'next'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Divider from '../../components/Divider'
import { useKryptikAuthContext } from '../../components/KryptikAuthProvider'
import ListBalance from '../../components/lists/ListBalance'
import HeaderProfile from '../../components/HeaderProfile'
import {AiFillDownCircle, AiFillUpCircle, AiFillPayCircle} from "react-icons/ai"
import Link from 'next/link'

const Profile: NextPage = () => {
  const { authUser, loading } = useKryptikAuthContext();
  const router = useRouter();
  // ROUTE PROTECTOR: Listen for changes on loading and authUser, redirect if needed
  useEffect(() => {
    if (!loading && !authUser)
      router.push('/')
  }, [authUser, loading])


  return (
    <div>
      
        <div className="text-center max-w-2xl mx-auto content-center">
          <HeaderProfile user={authUser} showBio={false} center={true}/>
          <div className="flex items-center mx-auto content-center space-x-4 max-w-xs">
           <div className='flex-1'>
              <Link href="../wallet/send">
                  <div  className="w-full py-5 px-3 text-center text-sky-600 hover:cursor-pointer hover:text-sky-800 hover:font-semibold hover:animate-pulse">
                      <AiFillPayCircle className="mx-auto" size="30"/>
                      <span className="text-gray-700">Swap</span>
                  </div>
              </Link>
            </div>
            <div className='flex-1'>
              <Link href="../wallet/receive">
                  <div  className="w-full py-5 px-3 text-center text-sky-600 hover:cursor-pointer hover:text-sky-800 hover:font-semibold hover:animate-pulse">
                      <AiFillDownCircle className="mx-auto" size="30"/>
                      <span className="text-gray-700">Receive</span>
                  </div>
              </Link>
            </div>
            <div className='flex-1'>
            <Link href="../wallet/send">
                <div  className="w-full py-5 px-3 text-center text-sky-600 hover:cursor-pointer hover:text-sky-800 hover:font-semibold hover:animate-pulse">
                    <AiFillUpCircle className="mx-auto" size="30"/>
                    <span className="text-gray-700">Send</span>
                </div>
            </Link>
            </div>
          </div>
          <div className="flex justify-start mt-5">
            <h2 className="font-medium text-slate-700">Your Balances</h2>
          </div>
          <Divider/>
          <ListBalance/>
        </div>

    </div>
 
  )
}

export default Profile