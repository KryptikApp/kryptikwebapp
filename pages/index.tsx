import type { NextPage } from 'next'
import toast, { Toaster } from 'react-hot-toast';

import styles from '../styles/Splash.module.css'
import { useKryptikAuthContext } from '../components/KryptikAuthProvider';

const Home: NextPage = () => {
  const kryptikAuthContext = useKryptikAuthContext();
  
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
          <h1 className="text-5xl font-bold sans ">
              Crypto Made <span className="text-transparent bg-clip-text bg-gradient-to-br from-cyan-500 to-green-500">Easy</span>
          </h1>
          <h1 className={styles.description}>Send crypto to anyone, anywhere, anytime.</h1>
          <button onClick={()=>handleGetStarted()} className="bg-transparent hover:bg-green-500 text-green-500 font-semibold hover:text-white py-2 px-4 border border-green-500 hover:border-transparent rounded my-5">
                            Get Started
          </button>
          <p>UID: {kryptikAuthContext.authUser.uid}</p>
          <p>Wallet Connected: {kryptikAuthContext.kryptikWallet.connected?"True":"False"}</p>
          <p>Ethereum Address: {kryptikAuthContext.kryptikWallet.ethAddress}</p>
        </div>

    </div>
 
  )
}

export default Home
