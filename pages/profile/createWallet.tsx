import type { NextPage } from 'next'
import Link from 'next/link'
import { useState } from 'react'
import { Magic } from 'magic-sdk'
import router from 'next/router'

// kryptik imports
import { IWallet } from '../../src/models/IWallet'
import { useKryptikAuthContext } from '../../components/KryptikAuthProvider'

const CreateWallet: NextPage = () => {
  const {signInWithToken, kryptikWallet, kryptikService} = useKryptikAuthContext();
  const [email, setEmail] = useState("");
  const [isLoading, setisLoading] = useState(false);
  console.log("Create Wallet Web 3 Service Id:")
  console.log(kryptikService.serviceId);
  
  const loginUser = async () => {
      setisLoading(true);
      /* Step 4.1: Generate a DID token with Magic */
      let magicKey:string = process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY? process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY : "";
      const magic = new Magic(magicKey)
      const didToken = await magic.auth.loginWithMagicLink({ email })
      console.log("Magic token:")
      console.log(didToken);
      console.log("logging in...");
      /* Step 4.4: POST to our /login endpoint */
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${didToken}`
        },
        body: JSON.stringify({ email })
      })
    
      if (res.status === 200) {
        setisLoading(false);
        console.log("Response body:");
        console.log(res.body);
        let resDecoded = await res.json();
        let customTokenDB:string = resDecoded.dbToken;
        console.log("token:");
        console.log(customTokenDB);
        await signInWithToken(customTokenDB);
        // If we reach this line, it means our
        // authentication succeeded, so we'll
        // redirect to the home page!
        router.push('/')
      } else {
        throw new Error(await res.text())
      }
      setisLoading(false);
  }


  const handleConnect = async () => {
    setisLoading(true);
    // let web3Kryptik:Web3Service = await kryptikAuthContext.kryptikService.StartSevice();
    // console.log("Web 3 service state:");
    // console.log(web3Kryptik.serviceState);
    // let newWallet:IWallet;
    // // creates user wallet if none exist
    // newWallet = await kryptikAuthContext.kryptikService.connectKryptikWallet();
    // console.log("Created NEW KRYPTIK WALLET:");
    // if(newWallet.connected){
    //   kryptikAuthContext.setKryptikWallet(newWallet);
    //   console.log("Wallet connected. Pulling balances...");
    //   let walletBalanceDict:{[ticker: string]: number} = await kryptikAuthContext.kryptikService.getBalanceAllNetworks(newWallet);
    //   // set wallet balance to eth balance for now
    //   newWallet.balance = walletBalanceDict["eth"];
    //   console.log("Ethereum balance");
    //   console.log(newWallet.balance);
    // }
    // setisLoading(false);
  }


  return (
    <div>
        <div className="h-[7rem]">
          {/* padding div for space between top and main elements */}
        </div>
        {
            // INDICATE CONNECTED
            kryptikWallet.connected ? 
          <div className="textCenter max-w-md mx-auto content-center">
            <h1 className="text-3xl font-bold sans ">
              Your wallet is connected.
            </h1>
            <p>
              Eth Address: <span className="bg-clip-text text-green-400">{kryptikWallet.ethAddress}</span>
            </p>
            <p>
              Balance: <span className="bg-clip-text text-green-400">{kryptikWallet.balance}</span>
            </p>
          </div>
        :
        <div className="text-center max-w-md mx-auto content-center">

        <div className="rounded-md border border-solid border-grey-600 py-10 hover:border-grey-800 shadow-md hover:shadow-lg">
        <div className="text-center max-w-2xl mx-auto content-center">

          <div className="flex flex-wrap justify-center">
            <div className="w-6/12 sm:w-4/12 px-4 lg:w-32">
              <img src="/kryptikBrand/kryptikEyez.png" alt="Kryptik Eyes" className="rounded-full max-w-full h-auto align-middle border-none" />
            </div>
          </div>
          <h1 className="text-2xl font-bold lg:mb-2">Welcome</h1> 
          <p>Create your secure, Kryptik wallet in one click.</p>   
        </div>

        <form className="w-full max-w-sm mx-auto content-center lg:pr-20">
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
                <button onClick={()=>loginUser()} className="bg-transparent hover:bg-green-500 text-green-500 font-semibold hover:text-white py-2 px-4 border border-green-500 hover:border-transparent rounded-lg my-5" disabled={isLoading}>
                {
                  // indicate app is creating wallet
                  isLoading &&  
                  <svg className="animate-spin h-5 w-5 mr-3 ..." viewBox="0 0 24 24">
                  {/* spinner */}
                  </svg>
                }         
                            Create Wallet
                </button>
              </div>
              <Link href="../profile/importSeed"><span className="text-blue-400 hover:cursor-pointer hover:text-blue transition-colors duration-300">or import existing seed</span></Link>
          </div>
        </div>
        </div>


        

        
           
        }

    </div>
 
  )
}

export default CreateWallet;

