import type { NextPage } from 'next'
import { useState } from 'react'
import { Magic } from 'magic-sdk'
import router from 'next/router'
import toast, { Toaster } from 'react-hot-toast'

//kryptic imports
import { useKryptikAuthContext } from '../../components/KryptikAuthProvider'

const ImportSeed: NextPage = () => {

  const {signInWithToken, kryptikWallet} = useKryptikAuthContext();
  const [seed, setSeed] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setisLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");


  const handleSeed = function(seedIn:string){
    setSeed(seedIn);
  }

  const loginUserWithSeed = async () => {
    setisLoading(true);
    /* Step 4.1: Generate a DID token with Magic */
    let magicKey:string = process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY? process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY : "";
    const magic = new Magic(magicKey)
    setLoadingMessage("Fetching authentication token.");
    const didToken = await magic.auth.loginWithMagicLink({ email });
    setLoadingMessage("Authenticating with server.");

    // hitting login API
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${didToken}`
      },
      body: JSON.stringify({ email })
    })
  
    if (res.status === 200) {
      setLoadingMessage("Connecting wallet on device.");
      let resDecoded = await res.json();
      let customTokenDB:string = resDecoded.dbToken;
      await signInWithToken(customTokenDB, seed);
      // If we reach this line, it means our
      // authentication succeeded, so we'll
      // redirect to the home page!
      toast.success("Kryptik Wallet connected.");
      setisLoading(false);
      router.push('/')
    } 
    else {
      toast.error("Unable to connect Kryptik wallet. Please contact support.");
      setisLoading(false);
      throw new Error(await res.text())
    }
}

  return (
    <div className="h-screen w-full">
        <div className="h-[7rem]">
          {/* padding div for space between top and main elements */}
        </div>
        
        <div className="text-center max-w-2xl mx-auto content-center">
          <div className="flex flex-wrap justify-center">
            <div className="w-6/12 sm:w-4/12 px-4 lg:w-32">
              <img src="/kryptikBrand/kryptikEyez.png" alt="Kryptik Eyes" className="rounded-full max-w-full h-auto align-middle border-none" />
            </div>
          </div>
          <h1 className="text-2xl font-bold lg:mb-2">Import Wallet</h1>       
        </div>
        {/* email input */} 
      <form className="w-full max-w-sm mx-auto content-center lg:pr-20">

        <div className="md:flex md:items-center lg:mr-4">
          
          <div className="md:w-1/3">
              <label className="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4">
                Your Seed
              </label>
            </div>
            <div className="md:w-2/3">
              <input type="password" className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-400" id="inline-full-name" required onChange={(e) => handleSeed(e.target.value)}/>
            </div>
          </div>

          <div className="md:flex md:items-center mt-4 lg:mr-4">
          <div className="md:w-1/3">
              <label className="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4">
                Your Email
              </label>
            </div>
            <div className="md:w-2/3">
              <input className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-400" id="inline-full-name" placeholder="abcd@gmail.com" required onChange={(e) => setEmail(e.target.value)}/>
            </div>
           </div>
        </form>
        <div className="text-center max-w-2xl mx-auto content-center">
          <div className="flex flex-wrap justify-center">
            <button onClick={()=>loginUserWithSeed()} className="bg-transparent hover:bg-green-500 text-green-500 font-semibold hover:text-white py-2 px-4 border border-green-500 hover:border-transparent rounded-lg my-5">
                         Import Seed
            </button>
          </div>
        </div>

    </div>
 
  )
}

export default ImportSeed;