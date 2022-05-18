import type { NextPage } from 'next'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useKryptikAuthContext } from '../../components/KryptikAuthProvider'
import NavProfile from '../../components/NavProfile'
import toast, { Toaster } from 'react-hot-toast'


const Settings: NextPage = () => {
  const { authUser, loading, signOut } = useKryptikAuthContext();
  const router = useRouter();
  // ROUTE PROTECTOR: Listen for changes on loading and authUser, redirect if needed
  useEffect(() => {
    if (!loading && !authUser)
      router.push('/')
  }, [authUser, loading])

  const handleLogout = function(){
    try{
      signOut();
      router.push('/');
    }
    catch(e){
      toast.error("Unable to sign out. Please contact support.");
    }
  }


  return (
    <div>
        <div className="h-[2rem]">
        {/* padding div for space between top and main elements */}
        </div>

        <div className="lg:px-[30%]">
          <h1 className="text-4xl font-bold sans mb-5">
                  Settings
          </h1>
          <p className="mb-2 text-justify">Your Krytpik wallet settings will be managed on this page.</p>
          <button onClick={()=>handleLogout()} className="bg-transparent hover:bg-red-500 text-black-500 font-semibold hover:text-white py-2 px-4 border border-red-500 hover:border-transparent rounded my-5">
                            Logout
          </button>
        </div>

    <div className="h-[7rem]">
      {/* padding div for space between top and main elements */}
    </div> 
    <NavProfile/>
    </div>
 
  )
}

export default Settings