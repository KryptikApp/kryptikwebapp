import type { NextPage } from 'next'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useKryptikAuthContext } from '../../components/KryptikAuthProvider'
import NavProfile from '../../components/NavProfile'
import toast, { Toaster } from 'react-hot-toast'
import Divider from '../../components/Divider'
import { removeUser } from '../../src/helpers/firebaseHelper'
import { useKryptikThemeContext } from '../../components/ThemeProvider'


const Settings: NextPage = () => {
  const { authUser, loading, signOut, updateCurrentUserKryptik } = useKryptikAuthContext();
  const {updateIsDark, isDark} = useKryptikThemeContext();
  const [isAdvanced, setIsAdvanced] = useState(authUser.isAdvanced);
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

  const handleDeleteWallet = function(){
    try{
      removeUser(authUser);
      toast.success("Wallet deleted.")
      router.push('/');
    }
    catch(e){
      toast.error("Error: Unable to delete wallet. Please contact the Kryptik team.")
    }
  }

  const handleUpdateIsAdvanced = async function(){
    console.log("RUNNING UPDATE ADVANCED");
    // only update if local is different than remote
    if(isAdvanced == undefined) return;
    let advancedNew: boolean = !isAdvanced;
    try{
        authUser.isAdvanced = advancedNew;
        await updateCurrentUserKryptik(authUser);
        if(advancedNew){
          toast.success("You're now advanced!");
        }
        else{
          toast.success("Profile Updated!");
        }
        setIsAdvanced(advancedNew);
    }
    catch(e){
      toast.error("Error: unable to update profile");
    }
  };

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
          {/* advanced mode toggle */}
          <div>
            <label className="inline-flex relative items-center cursor-pointer">
              <input type="checkbox" checked={isAdvanced?true:false} id={isAdvanced?"checked-toggle":"default-toggle"} className="sr-only peer" onClick={(()=>handleUpdateIsAdvanced())}/>
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-3 peer-focus:ring-blue-300 dark:peer-focus:ring-sky-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-sky-500"></div>
              <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">Advanced Mode</span>
            </label>
            <p className="text-slate-500 text-sm">Advanced mode will allow you to interact with testnets and set custom transaction fees.</p>
          </div>
          {/* dark mode stereo */}
          
          <div className="flex mt-4">

            <div className="form-check form-check-inline" onClick={()=>updateIsDark(false)}>
              <input className="form-check-input form-check-input appearance-none rounded-full h-4 w-4 border border-gray-300 bg-white checked:bg-sky-500 checked:border-sky-600 focus:outline-none transition duration-200 mt-1 align-top bg-no-repeat bg-center bg-contain float-left mr-2 cursor-pointer" type="radio" name="inlineRadioOptions" id="inlineRadioLight" value="light" checked={isDark?false:true}/>
              <label className="form-check-label inline-block text-gray-800 dark:text-slate-200" htmlFor="inlineRadioLight">Light</label>
            </div>

            <div className="form-check form-check-inline ml-4">
              <input className="form-check-input form-check-input appearance-none rounded-full h-4 w-4 border border-gray-300 bg-white checked:bg-sky-500 checked:border-blue-600 focus:outline-none transition duration-200 mt-1 align-top bg-no-repeat bg-center bg-contain float-left mr-2 cursor-pointer" type="radio" name="inlineRadioOptions" id="inlineRadioDark" value="dark" checked={isDark?true:false} onClick={()=>updateIsDark(true)}/>
              <label className="form-check-label inline-block text-gray-800 dark:text-slate-200" htmlFor="inlineRadioDark">Dark</label>
            </div>

          </div>

          <button onClick={()=>handleLogout()} className="bg-transparent hover:bg-red-500 text-black-500 font-semibold hover:text-white py-2 px-4 border border-red-500 hover:border-transparent rounded my-5 dark:text-white">
                            Logout
          </button>
          <div>
          <Divider/>
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

export default Settings