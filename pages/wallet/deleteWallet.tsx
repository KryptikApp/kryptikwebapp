import type { NextPage } from 'next'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useKryptikAuthContext } from '../../components/KryptikAuthProvider'
import toast, { Toaster } from 'react-hot-toast'
import Divider from '../../components/Divider'
import {removeUserAndWallet } from '../../src/helpers/firebaseHelper'
import { ILoginUserParams, loginUser } from '../../src/handlers/profile/loginHandler'
import { defaultWallet } from '../../src/models/defaultWallet'
import NavProfile from '../../components/navbars/NavProfile'


const DeleteWallet: NextPage = () => {
  const { authUser, loading, signOut, kryptikWallet, signInWithToken, setKryptikWallet } = useKryptikAuthContext();
  const router = useRouter();
  // ROUTE PROTECTOR: Listen for changes on loading and authUser, redirect if needed
  useEffect(() => {
    if (!loading && !authUser)
      router.push('/')
  }, [authUser, loading])


  const handleDeleteWallet = async function(){
    try{
      // refresh login
      await handleRefreshLogin()
      // delete user and local wallet
      await removeUserAndWallet();
      // set wallet to default
      setKryptikWallet(defaultWallet);
      toast.success("Wallet deleted.")
      router.push('/');
    }
    catch(e){
      toast.error("Error: Unable to delete wallet. Please contact the Kryptik team.")
    }
  }

  const handleRefreshLogin = async function(){
    try{
      // login user with undefined seed
      // seed will be created when wallet is created
      const loginParams:ILoginUserParams = {
        email:authUser.uid,
        signInWithTokenFunc:signInWithToken,
        isRefresh:true
      }
      await loginUser(loginParams);
      // If we reach this line, it means our
      // authentication succeeded, so we'll
      // redirect to the home page!
    }
    catch(e){
      throw(new Error("Error: Unable to refresh login."))
    }
  }


  return (
    <div>
        <Toaster/>
        <div className="h-[2rem]">
        {/* padding div for space between top and main elements */}
        </div>

        <div className="lg:px-[30%]">
          <h1 className="text-4xl font-bold sans mb-5 dark:text-white">
                  Delete Wallet
          </h1>
          <Divider/>
          <p className="mb-2 text-red-600"><span className="font-semibold">Warning:</span> Once you delete your wallet there will be no way for Kryptik to recover your funds. Please make sure you have your secret key stored in a safe place.</p>
          <div>
            <Divider/>
            <p className="text-slate-500 text-sm">Note: You may be asked to login again.</p>
            <button onClick={()=>handleDeleteWallet()} className="bg-red-500 hover:bg-red-700 text-white font-semibold py-2 px-4 border border-red-500 hover:border-transparent rounded my-5">
                                Delete Wallet
            </button>
          </div>
        </div>

    <div className="h-[7rem]">
      {/* padding div for space between top and main elements */}
    </div> 
    <NavProfile/>
    </div>
 
  )
}

export default DeleteWallet