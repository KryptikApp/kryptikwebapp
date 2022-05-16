import type { NextPage } from 'next'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Divider from '../../components/Divider'
import { useKryptikAuthContext } from '../../components/KryptikAuthProvider'
import NavProfile from '../../components/NavProfile'


const Settings: NextPage = () => {
  const { authUser, loading, getUserPhotoPath, signOut } = useKryptikAuthContext();
  const router = useRouter();
  // ROUTE PROTECTOR: Listen for changes on loading and authUser, redirect if needed
  useEffect(() => {
    if (!loading && !authUser)
      router.push('/')
  }, [authUser, loading])


  return (
    <div>
      
        <div className="text-center max-w-2xl mx-auto content-center">
          <h1>Settings</h1>
        </div>

        
    <NavProfile/>
    </div>
 
  )
}

export default Settings