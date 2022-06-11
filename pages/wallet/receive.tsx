import type { NextPage } from 'next'
import { useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import { defaultTokenAndNetwork} from '../../src/services/models/network'
import DropdownNetworks from '../../components/DropdownNetworks'
import {AiFillCheckCircle, AiOutlineCopy} from "react-icons/ai"
import { useQRCode } from 'next-qrcode';
import { useEffect} from 'react'

// kryptik imports
import { useKryptikAuthContext } from '../../components/KryptikAuthProvider'
import { TokenAndNetwork } from '../../src/services/models/token'


const Recieve: NextPage = () => {
    const { kryptikWallet, kryptikService } = useKryptikAuthContext();
    const[selectedTokenAndNetwork, setSelectedTokenAndNetwork] = useState(defaultTokenAndNetwork);
    const [readableFromAddress, setReadableFromAddress] = useState("");
    const [toAddress, setToAddress] = useState(" ");
    const [isCopied, setIsCopied] = useState(false);
    const { Canvas } = useQRCode();

    useEffect(()=>{
        fetchFromAddress();
    }, []);

    const fetchFromAddress = async() =>{
        let accountAddress = await kryptikService.getAddressForNetworkDb(kryptikWallet, selectedTokenAndNetwork.baseNetworkDb);
         // handle empty address
         if(accountAddress == ""){
           toast.error(`Error: no address found for ${selectedTokenAndNetwork.baseNetworkDb.fullName}. Please contact the Kryptik team or try refreshing your page.`);
           setToAddress(kryptikWallet.ethAddress);
           setReadableFromAddress(kryptikWallet.ethAddress);
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
        <div className="h-[5rem]">
          {/* padding div for space between top and main elements */}
        </div>
        
        <div className="max-w-lg mx-auto content-center rounded-lg border border-solid border-grey-600 py-10 hover:border-grey-800">
          <h1 className="text-center text-3xl font-bold lg:mb-2">Recieve  <img src="/kryptikBrand/kryptikEyez.png" alt="Kryptik Eyes" className="rounded-full w-10 inline max-h-sm h-auto align-middle border-none" /></h1> 
          {
            selectedTokenAndNetwork.tokenData?
            <p className="mx-auto text-center text-slate-500 text-sm px-4">Easily receive {selectedTokenAndNetwork.tokenData.erc20Db.name} on {selectedTokenAndNetwork.baseNetworkDb.fullName} by having someone scan the code below.</p>:
            <p className="mx-auto text-center text-slate-500 text-sm px-4">Easily receive money on {selectedTokenAndNetwork.baseNetworkDb.fullName} by having someone scan the code below.</p> 
          }
          
           {/* network dropdown */}
          <div className="max-w-xs mx-auto">
                      <DropdownNetworks selectedTokenAndNetwork={selectedTokenAndNetwork} selectFunction={handleTokenAndNetworkChange}/>
          </div>
          {/* QR CODE */}
          <div className="flex">
            <div className="flex-1"/>
            <div className="flex-2">
            <Canvas
                text={toAddress}
                options={{
                    type: 'image/jpeg',
                    quality: 0.3,
                    level: 'M',
                    margin: 3,
                    scale: 4,
                    width: 300,
                    color: {
                    dark: '#20d0f7',
                    light: '##fcfcfc',
                    },
                }}
                />
            </div>
            <div className="flex-1"/>
          </div>
          <div className="text-center">
              {
                isCopied?
                <p className="font-bold text-green-600 hover:cursor-pointer" onClick={()=>handleIsCopiedToggle()}><AiFillCheckCircle className="inline mr-3"/>Copied to Clipboard</p>:
                <p className="hover:cursor-pointer" onClick={()=>handleIsCopiedToggle()}><AiOutlineCopy className="inline mr-3"/>Copy address to clipboard</p>
              }
          </div>
        </div>

        <div className="h-[3rem]">
          {/* padding div for space between bottom and main elements */}
        </div>

    </div>
 
  )
}

export default Recieve;