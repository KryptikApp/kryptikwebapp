import type { NextPage } from 'next'
import toast, { Toaster } from 'react-hot-toast';

import { useKryptikAuthContext } from '../components/KryptikAuthProvider';
import Link from 'next/link';
import SearchAddy from '../components/search/searchAddy';


const Home: NextPage = () => {
  const {kryptikWallet, authUser} = useKryptikAuthContext();

  const handleGetStarted = async() =>{
    console.log("Handle get started!");
    toast('Handle get started');
  }

  return (
    <div>
        <Toaster/>
        <div className="h-[10rem]">
          {/* padding div for space between top and main elements */}
        </div>

        <div className="text-center max-w-2xl mx-auto content-center">
          {/* <h1 className="text-5xl font-bold sans dark:text-white">
              Crypto Made <span className="text-transparent bg-clip-text bg-gradient-to-br from-cyan-500 to-green-500">Easy</span>
          </h1>
          <h1 className="text-center mt-4 dark:text-gray-300">Save, send, and collect with ease.</h1>
          <button onClick={()=>handleGetStarted()} className="bg-transparent hover:bg-green-500 text-green-500 font-semibold hover:text-white py-2 px-4 border border-green-500 hover:border-transparent rounded my-5">
                            Get Started
          </button>
          <div className="text-green-500">
            <Link href="../wallet/createName">Create Near Name</Link>
            <br/>
            <Link href="launch">Launch Page</Link>
          </div>
          <div className="dark:text-white">
            <p>UID: {authUser.uid}</p>
            <p>Wallet Connected: {kryptikWallet.connected?"True":"False"}</p>
            <p>Ethereum Address: {kryptikWallet.ethAddress}</p>
          </div> */}
          <SearchAddy/>
        </div>
        <div className="h-[10rem]">
          {/* padding div for space between top and main elements */}
        </div>
    </div>
 
  )
}

export default Home
