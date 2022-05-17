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
                <button onClick={()=>loginUser()} className={`bg-transparent hover:bg-green-500 text-green-500 font-semibold hover:text-white py-2 px-4 ${isLoading?"hover:cursor-not-allowed":""} border border-green-500 hover:border-transparent rounded-lg my-5`} disabled={isLoading}>      
                            Create Wallet
                            {
                                    !isLoading?"":
                                    <svg role="status" className="inline w-4 h-4 ml-3 text-white animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB"/>
                                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor"/>
                                    </svg>
                        }
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

