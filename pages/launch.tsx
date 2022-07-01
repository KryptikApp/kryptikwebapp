import type { NextPage } from 'next'
import toast, { Toaster } from 'react-hot-toast';

import { useKryptikAuthContext } from '../components/KryptikAuthProvider';
import Link from 'next/link';


const Launch: NextPage = () => {
  const {kryptikWallet, authUser} = useKryptikAuthContext();

  const handleGetStarted = async() =>{
    console.log("Handle get started!");
    toast('Handle get started');
  }

  return (
    <div>
        <Toaster/>
        <div className="h-[6rem]">
          {/* padding div for space between top and main elements */}
        </div>

        <div className="max-w-3xl content-center mx-auto">
            <div className="flex flex-col">

                <div className="flex-3 text-center content-center pt-10">
                    <h1 className="text-7xl font-bold sans dark:text-white">
                        Crypto Made <span className="text-transparent bg-clip-text bg-gradient-to-br from-cyan-500 to-green-500">Easy</span>
                    </h1>
                    <h1 className="text-xl text-center mt-4 dark:text-gray-300">Save, send, and collect with ease.</h1>
                    <button onClick={()=>handleGetStarted()} className="text-xl bg-transparent hover:bg-green-500 text-green-500 font-semibold hover:text-white py-2 px-10 border border-green-500 hover:border-transparent rounded my-5">
                            Get Started
                    </button>
                </div>
                <div className="flex-2 content-end px-10">
                    <img src="/kryptikBrand/kryptikSearch.png" alt="Kryptik Eyes" className="w-60 h-auto border-none mx-auto center"></img>
                </div>
            </div>
        </div>

    </div>
 
  )
}

export default Launch