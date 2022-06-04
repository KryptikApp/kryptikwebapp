import type { NextPage } from 'next'
import Link from 'next/link'
import { useState } from 'react'
import { Magic } from 'magic-sdk'
import router from 'next/router'
import toast, { Toaster } from 'react-hot-toast'
import { Network, NetworkFromTicker } from "hdseedloop"
import { defaultNetworkDb, NetworkDb } from '../../src/services/models/network'
import DropdownNetworks from '../../components/DropdownNetworks'
import {AiFillCheckCircle, AiOutlineCopy} from "react-icons/ai"
import { useQRCode } from 'next-qrcode';
import { useEffect} from 'react'

// kryptik imports
import { useKryptikAuthContext } from '../../components/KryptikAuthProvider'


const Recieve: NextPage = () => {
    const { authUser, loading, kryptikWallet } = useKryptikAuthContext();
    const[selectedNetwork, setSelectedNetwork] = useState(defaultNetworkDb);
    const [readableFromAddress, setReadableFromAddress] = useState("");
    const [toAddress, setToAddress] = useState(" ");
    const [isCopied, setIsCopied] = useState(false);
    const { Canvas } = useQRCode();

    useEffect(()=>{
        fetchFromAddress(NetworkFromTicker(selectedNetwork.ticker));
    }, []);

    const fetchFromAddress = async(network:Network) =>{
        let addys:string[] = await kryptikWallet.seedLoop.getAddresses(network);
         // handle empty address
         if(addys[0] == ""){
           toast.error(`Error: no address found for ${network.fullName}. Please contact the Kryptik team or try refreshing your page.`);
           setToAddress(kryptikWallet.ethAddress);
           setReadableFromAddress(kryptikWallet.ethAddress);
           setSelectedNetwork(defaultNetworkDb);
           return;
         }
         setToAddress(addys[0]);
         setReadableFromAddress(addys[0]);
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
        let nw:Network = NetworkFromTicker(selectedNetwork.ticker);
        fetchFromAddress(nw);

    }, [selectedNetwork]);

      const handleNetowrkChange = function(network:NetworkDb) {
        console.log(network);
        setSelectedNetwork(network);
        setIsCopied(false);
      }



  return (
    <div>
        <Toaster/>
        <div className="h-[7rem]">
          {/* padding div for space between top and main elements */}
        </div>
        
        
        <div className="text-center max-w-md mx-auto content-center">

        <div className="rounded-md border border-solid border-grey-600 py-10 hover:border-grey-800 shadow-md hover:shadow-lg">
        <div className="text-center max-w-2xl mx-auto content-center">

          <div className="flex flex-wrap justify-center">
            <div className="w-6/12 sm:w-4/12 px-4 lg:w-32">
              <img src="/kryptikBrand/kryptikEyez.png" alt="Kryptik Eyes" className="rounded-full max-w-full h-auto align-middle border-none" />
            </div>
          </div>
          <h1 className="text-2xl font-bold lg:mb-2">Recieve</h1> 
          <p>Easily recive money by having someone scan your qr code or copy the address, select network below</p>   
        </div>

        {/* network dropdown */}
        <div className="max-w-xs mx-auto">
                    <DropdownNetworks selectedNetwork={selectedNetwork} selectFunction={handleNetowrkChange}/>
                </div>


            <div className="max-w-2xl mx-auto content-center">
        
                <Canvas
                text={toAddress}
                options={{
                    type: 'image/jpeg',
                    quality: 0.3,
                    level: 'M',
                    margin: 3,
                    scale: 4,
                    width: 200,
                    color: {
                    dark: '#010599FF',
                    light: '#FFBF60FF',
                    },
                }}
                />
            </div>

          {
            isCopied?
            <p className="font-bold text-green-600 hover:cursor-pointer" onClick={()=>handleIsCopiedToggle()}><AiFillCheckCircle className="inline mr-3"/>Copied to Clipboard</p>:
            <p className="hover:cursor-pointer" onClick={()=>handleIsCopiedToggle()}><AiOutlineCopy className="inline mr-3"/>Copy address to clipboard</p>
          }

        </div>
        </div>
          
        

    </div>
 
  )
}

export default Recieve;