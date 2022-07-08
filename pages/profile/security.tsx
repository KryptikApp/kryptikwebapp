import type { NextPage } from 'next'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import {AiOutlineEye, AiOutlineEyeInvisible, AiFillCheckCircle, AiOutlineCopy} from "react-icons/ai"

import { useKryptikAuthContext } from '../../components/KryptikAuthProvider'
import Divider from '../../components/Divider'
import NavProfile from '../../components/navbars/NavProfile'


const Profile: NextPage = () => {
  const {authUser, loading, getSeedPhrase} = useKryptikAuthContext();
  const router = useRouter();
  // ROUTE PROTECTOR: Listen for changes on loading and authUser, redirect if needed
  useEffect(() => {
    if (!loading && !authUser.isLoggedIn)
      router.push('/')
  }, [authUser, loading])

  const [isVisible, setIsVisible] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleIsVisibleToggle = function(){
    setIsVisible(!isVisible);
  }

  const handleIsCopiedToggle = function(){
    // copy seedphrase to clipboard
    navigator.clipboard.writeText(getSeedPhrase());
    if(!isCopied){
      // update copy state
      setIsCopied(true);
    }
  }


  return (
    <div>
      
        <div className="h-[2rem]">
        {/* padding div for space between top and main elements */}
        </div>

        <div className="lg:px-[30%]">
          <h1 className="text-4xl font-bold sans mb-5 dark:text-white">
                  Security
          </h1>
          <p className="mb-2 text-lg text-justify dark:text-white">Kryptik improves wallet security by encrypting a serialized wallet on the client and 
          splitting the encryption key between local storage and the server via shamir secret sharing. </p>
          <Divider/>
          <h2 className="text-xl text-red-600 font-bold sans mb-2">Your Recovery Phrase 
            {isVisible? <AiOutlineEye className="inline ml-3 hover:cursor-pointer" size="22" onClick={()=>handleIsVisibleToggle()}/>:
            <AiOutlineEyeInvisible className="inline ml-3 hover:cursor-pointer" size="22" onClick={()=>handleIsVisibleToggle()}/>
            }
          </h2>
          <p className="text-slate-500 text-sm mb-5 dark:text-slate-300">Save these 12 words in a safe place. Do not share them with anyone, even Kryptik. Anyone with your recovery phrase can steal your funds.</p>
          <textarea disabled className={`${!isVisible && "blur-sm"} mb-4 bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-4 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-400`} value={getSeedPhrase()}>
          </textarea>
          {
            isCopied?
            <p className="font-bold text-green-600 hover:cursor-pointer" onClick={()=>handleIsCopiedToggle()}><AiFillCheckCircle className="inline mr-3"/>Copied to Clipboard</p>:
            <p className="hover:cursor-pointer" onClick={()=>handleIsCopiedToggle()}><AiOutlineCopy className="inline mr-3"/>Copy to clipboard</p>
          }
        </div>

    <div className="h-[7rem]">
      {/* padding div for space between top and main elements */}
    </div>
    <NavProfile/>
    </div>
 
  )
}

export default Profile