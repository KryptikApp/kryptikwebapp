import type { NextPage } from 'next'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useKryptikAuthContext } from '../../components/KryptikAuthProvider'
import NavProfile from '../../components/NavProfile'
import toast, { Toaster } from 'react-hot-toast'
import Divider from '../../components/Divider'
import { removeUser } from '../../src/helpers/firebaseHelper'


const Settings: NextPage = () => {
  const { authUser, loading, signOut, updateCurrentUserKryptik } = useKryptikAuthContext();
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
          <h1 className="text-4xl font-bold sans mb-5">
                  Settings
          </h1>
          <Divider/>
          <p className="mb-2 text-justify">Your Krytpik wallet settings will be managed on this page.</p>
          <div>
            <label className="inline-flex relative items-center cursor-pointer">
              <input type="checkbox" checked={isAdvanced?true:false} id={isAdvanced?"checked-toggle":"default-toggle"} className="sr-only peer" onClick={(()=>handleUpdateIsAdvanced())}/>
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-3 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">Advanced Mode</span>
            </label>
          <p className="text-slate-500 text-sm">Advanced mode will allow you to interact with testnets and set custom transaction fees.</p>
          </div>
          <button onClick={()=>handleLogout()} className="bg-transparent hover:bg-red-500 text-black-500 font-semibold hover:text-white py-2 px-4 border border-red-500 hover:border-transparent rounded my-5">
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