import type { NextPage } from 'next'
import { useState } from 'react'
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
    const { kryptikWallet } = useKryptikAuthContext();
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
        <div className="h-[5rem]">
          {/* padding div for space between top and main elements */}
        </div>
        
        <div className="max-w-lg mx-auto content-center rounded-lg border border-solid border-grey-600 py-10 hover:border-grey-800">
          <h1 className="text-center text-3xl font-bold lg:mb-2">Recieve  <img src="/kryptikBrand/kryptikEyez.png" alt="Kryptik Eyes" className="rounded-full w-10 inline max-h-sm h-auto align-middle border-none" /></h1> 
          <p className="mx-auto text-center text-slate-500 text-sm">Easily receive money on {selectedNetwork.fullName} by having someone scan the code below.</p> 
           {/* network dropdown */}
          <div className="max-w-xs mx-auto">
                      <DropdownNetworks selectedNetwork={selectedNetwork} selectFunction={handleNetowrkChange}/>
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