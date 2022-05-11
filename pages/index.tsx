import type { NextPage } from 'next'
import styles from '../styles/Splash.module.css'
import Web3Service from '../src/services/Web3Service';
import { IWallet } from '../src/models/IWallet';
import { createVault, unlockVault } from '../src/handlers/wallet/vaultHandler';
import { useKryptikAuthContext } from '../components/KryptikAuthProvider';

const Home: NextPage = () => {
  const kryptikAuthContext = useKryptikAuthContext();
  
  const handleGetStarted = async() =>{
    console.log("Handle get started!");
    // let web3Kryptik:Web3Service = await kryptikContext.kryptikService.StartSevice();
    // console.log("Web 3 service state:");
    // console.log(web3Kryptik.serviceState);
    // let newWallet:IWallet;
    // // creates user wallet if none exist
    // newWallet = await web3Kryptik.connectKryptikWallet();
    // if(authContext.authUser && !authContext.loading){
    //   console.log("testing vaults!");
    //   let remoteShare:string = createVault(newWallet.seedLoop, authContext.authUser.uid).remoteShare;
    //   console.log("Remote share:");
    //   console.log(remoteShare);
    //   unlockVault(authContext.authUser.uid, remoteShare);
    // }
  }

  return (
    <div>

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
