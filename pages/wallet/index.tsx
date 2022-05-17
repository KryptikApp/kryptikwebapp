import type { NextPage } from 'next'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Divider from '../../components/Divider'
import { useKryptikAuthContext } from '../../components/KryptikAuthProvider'
import ListBalance from '../../components/lists/ListBalance'
import Link from 'next/link'
import HeaderProfile from '../../components/HeaderProfile'

const Profile: NextPage = () => {
  const { authUser, loading, kryptikWallet, kryptikService, getUserPhotoPath } = useKryptikAuthContext();
  const router = useRouter();
  // ROUTE PROTECTOR: Listen for changes on loading and authUser, redirect if needed
  useEffect(() => {
    if (!loading && !authUser)
      router.push('/')
  }, [authUser, loading])


  return (
    <div>
      
        <div className="text-center max-w-2xl mx-auto content-center">
          <HeaderProfile user={authUser}/>
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