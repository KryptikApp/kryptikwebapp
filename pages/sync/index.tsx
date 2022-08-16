import type { NextPage } from 'next'
import { useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import {AiFillCheckCircle, AiOutlineCopy} from "react-icons/ai"
import { useQRCode } from 'next-qrcode';
import { useEffect} from 'react'

// kryptik imports
import { useKryptikAuthContext } from '../../components/KryptikAuthProvider'
import { TokenAndNetwork } from '../../src/services/models/token'
import { defaultTokenAndNetwork} from '../../src/services/models/network'
import DropdownNetworks from '../../components/DropdownNetworks'
import { getAddressForNetworkDb } from '../../src/helpers/utils/accountUtils';
import { useRouter } from 'next/router';
import { ServiceState } from '../../src/services/types';


const Sync: NextPage = () => {
    const { kryptikWallet, kryptikService, authUser, loadingAuthUser } = useKryptikAuthContext();
    const[selectedTokenAndNetwork, setSelectedTokenAndNetwork] = useState(defaultTokenAndNetwork);
    const [readableFromAddress, setReadableFromAddress] = useState("");
    const [toAddress, setToAddress] = useState(" ");
    const [isCopied, setIsCopied] = useState(false);
    const { Canvas } = useQRCode();

    const router = useRouter();
    // ROUTE PROTECTOR: Listen for changes on loadingAuthUser and authUser, redirect if needed
    useEffect(() => {
      if (!loadingAuthUser &&  (!authUser || !authUser.isLoggedIn)) router.push('/');
      // ensure service is started
      if(kryptikService.serviceState != ServiceState.started){
        router.push('/')
      }
    }, [authUser, loadingAuthUser])

    useEffect(()=>{
        fetchFromAddress();
    }, []);

    const fetchFromAddress = async() =>{
        let accountAddress = await getAddressForNetworkDb(kryptikWallet, selectedTokenAndNetwork.baseNetworkDb);
         // handle empty address
         if(accountAddress == ""){
           toast.error(`Error: no address found for ${selectedTokenAndNetwork.baseNetworkDb.fullName}. Please contact the Kryptik team or try refreshing your page.`);
           setToAddress(kryptikWallet.resolvedEthAccount.address);
           setReadableFromAddress(kryptikWallet.resolvedEthAccount.address);
           setSelectedTokenAndNetwork(defaultTokenAndNetwork);
           return;
         }
         setToAddress(accountAddress);
         setReadableFromAddress(accountAddress);
     }

    const handleIsCopiedToggle = async() =>{
        // copy selected adress
        navigator.clipboard.writeText("");
        navigator.clipboard.writeText(toAddress);
        if(!isCopied){
          // update copy state
          setIsCopied(true);
        }
    }

      useEffect(()=>{
        fetchFromAddress();
    }, [selectedTokenAndNetwork]);

  
    const handleTokenAndNetworkChange = function(tokenAndNetwork:TokenAndNetwork){
      setSelectedTokenAndNetwork(tokenAndNetwork);
      setIsCopied(false);
    }



  return (
    <div>
        <Toaster/>
        <div className="h-[10vh]">
          {/* padding div for space between top and main elements */}
        </div>
        
        <div className="max-w-lg mx-auto content-center rounded-lg border border-solid border-gray-600 py-10 hover:border-gray-800 dark:border-gray-400 dark:hover:border-gray-200 dark:text-white">
        
          <h1 className="text-center text-3xl font-bold mb-4">Sync Wallet<img src="/kryptikBrand/kryptikEyez.png" alt="Kryptik Eyes" className="rounded-full w-10 ml-2 inline max-h-sm h-auto align-middle border-none" /></h1> 
          
          <p className='text-lg px-2'>This feature is <span className="font-semibold">not yet supported</span>. In the future, you will be able to <span className="text-green-400">sync your wallet</span> across  devices via a simple QR code. For now, please use your <span className="text-sky-500 dark:text-sky-400">original device</span> to check your balance and make transactions.</p>
          
        </div>

        <div className="h-[12rem]">
          {/* padding div for space between bottom and main elements */}
        </div>

    </div>
 
  )
}

export default Sync;