import type { NextPage } from 'next'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useKryptikAuthContext } from '../../components/KryptikAuthProvider'
import NavProfile from '../../components/NavProfile'
import toast, { Toaster } from 'react-hot-toast'
import Divider from '../../components/Divider'
import { useKryptikThemeContext } from '../../components/ThemeProvider'
import Link from 'next/link'


const Settings: NextPage = () => {
  const { authUser, loading, signOut, kryptikWallet, signInWithToken } = useKryptikAuthContext();
  const {updateIsDark, isDark, updateIsAdvanced, isAdvanced, isVisible, updateIsVisible} = useKryptikThemeContext();
  const [updateVisibleLoading, setUpdateVisibleLoading] = useState(false);
  const router = useRouter();
  // ROUTE PROTECTOR: Listen for changes on loading and authUser, redirect if needed
  useEffect(() => {
    if (!loading && !authUser.isLoggedIn)
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


  const handleUpdateWalletVisibility = async function(){
    setUpdateVisibleLoading(true);
    try{
      await updateIsVisible(!isVisible, authUser.uid, kryptikWallet);
      if(!isVisible){
        toast.success("Your wallet is now visible");
      }
      else{
        toast.success("Your wallet is now private")
      }
    }
    catch(e){
      console.log(e);
      toast.error("Unable to update wallet visiblity");
    }
    setUpdateVisibleLoading(false);
  }

  const handleUpdateIsAdvanced = function(newIsAdvanced:boolean){
    updateIsAdvanced(newIsAdvanced, authUser.uid);
    if(newIsAdvanced){
      toast.success("Advanced mode activated!");
    }
    else{
      toast.success("Profile updated!");
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
                  Settings
          </h1>
          <Divider/>
          <p className="mb-2 text-justify text-green-500 dark:text-green-600">Your Krytpik wallet settings will be managed on this page.</p>
          
          {/* visibility toggle */}

          <div className="hover:bg-gray-100 hover:dark:bg-[#141414] py-4 rounded">
            <div>
              <h2 className='font-bold text-gray-500 dark:text-gray-400 mb-1 inline'>Wallet Visiblity</h2>
              {
                                            updateVisibleLoading &&
                                            <svg role="status" className="inline w-4 h-4 ml-3 text-white animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB"/>
                                            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor"/>
                                            </svg>
              }
            </div>
            <label className="inline-flex relative items-center cursor-pointer mt-2 mb-2">
              <input type="checkbox" checked={isVisible?true:false} id={isVisible?"checked-toggle":"default-toggle"} className="sr-only peer" onClick={(()=>handleUpdateWalletVisibility())}/>
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-3 peer-focus:ring-blue-300 dark:peer-focus:ring-sky-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-sky-500"></div>
              <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">Wallet Visible</span>
            </label>
            <p className="text-slate-500 text-sm">When your wallet is 'visible' others can discover your account via email. This setting can be changed at any time.</p>
          </div>

          {/* dark mode stereo */} 

          <div className='hover:bg-gray-100 hover:dark:bg-[#141414] py-4 rounded'>
          <h1 className='font-bold text-gray-500 dark:text-gray-400 mb-1'>Kryptik Theme</h1>

          <div className="flex mb-2">
            <div className="form-check form-check-inline" onClick={()=>updateIsDark(false, authUser.uid)}>
              <input className="form-check-input form-check-input appearance-none rounded-full h-4 w-4 border border-gray-300 bg-white checked:bg-sky-500 checked:border-sky-600 focus:outline-none transition duration-200 mt-1 align-top bg-no-repeat bg-center bg-contain float-left mr-2 cursor-pointer" type="radio" name="inlineRadioOptions" id="inlineRadioLight" value="light" checked={isDark?false:true}/>
              <label className="form-check-label inline-block text-gray-800 dark:text-slate-200" htmlFor="inlineRadioLight">Light</label>
            </div>

            <div className="form-check form-check-inline ml-4" onClick={()=>updateIsDark(true, authUser.uid)}>
              <input className="form-check-input form-check-input appearance-none rounded-full h-4 w-4 border border-gray-300 bg-white checked:bg-sky-500 checked:border-blue-600 focus:outline-none transition duration-200 mt-1 align-top bg-no-repeat bg-center bg-contain float-left mr-2 cursor-pointer" type="radio" name="inlineRadioOptions" id="inlineRadioDark" value="dark" checked={isDark?true:false}/>
              <label className="form-check-label inline-block text-gray-800 dark:text-slate-200" htmlFor="inlineRadioDark">Dark</label>
            </div>
          </div>
            <p className="text-slate-500 text-sm">Switch between stealthy night mode and <em>clean as a dream</em> light mode.</p>
          </div>

          {/* advanced mode toggle */}
          <div className="hover:bg-gray-100 hover:dark:bg-[#141414] py-4 rounded">
            <h2 className='font-bold text-gray-500 dark:text-gray-400 mb-1'>Advanced Mode</h2>
            <label className="inline-flex relative items-center cursor-pointer mt-2 mb-2">
              <input type="checkbox" checked={isAdvanced?true:false} id={isAdvanced?"checked-toggle":"default-toggle"} className="sr-only peer" onClick={(()=>handleUpdateIsAdvanced(!isAdvanced))}/>
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-3 peer-focus:ring-blue-300 dark:peer-focus:ring-sky-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-sky-500"></div>
              <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">Advanced Mode</span>
            </label>
            <p className="text-slate-500 text-sm">Advanced mode will allow you to interact with testnets and set custom transaction fees.</p>
          </div>
          <Divider/>
          <button onClick={()=>handleLogout()} className="bg-transparent hover:bg-red-500 text-black-500 font-semibold hover:text-white py-2 px-4 border border-red-500 hover:border-transparent rounded my-5 dark:text-white">
                            Logout
          </button>
          <br/>
          <Link href="../wallet/deleteWallet">
            <p className="text-red-500 text-sm hover:cursor-pointer">Delete Wallet</p>
          </Link>
        </div>

    <div className="h-[7rem]">
      {/* padding div for space between top and main elements */}
    </div> 
    <NavProfile/>
    </div>
 
  )
}

export default Settings