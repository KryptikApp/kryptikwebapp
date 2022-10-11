import { NetworkFromTicker, truncateAddress } from 'hdseedloop';
import type { NextPage } from 'next'
import { useRouter } from 'next/router';
import { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';

import { useKryptikAuthContext } from '../../components/KryptikAuthProvider';
import { updateVaultSeedloop } from '../../src/handlers/wallet/vaultHandler';
import { readExtraUserData } from '../../src/helpers/firebaseHelper';
import { WalletStatus } from '../../src/models/KryptikWallet';
import { UserExtraData } from '../../src/models/user';
import AvailableNetworks from '../networks/AvailableNetworks';

// landing page for users who are logged in and have a wallet
const UserLandingPage: NextPage = () => {
  const router = useRouter();
  const {kryptikWallet, authUser, loadingAuthUser, loadingWallet, walletStatus, updateWalletStatus} = useKryptikAuthContext();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  

  const handleGoToWallet = async() =>{
    router.push("/wallet")
  }

  const handleSyncWallet = function(){
    router.push("/sync")
  }

  const handleUnlockWallet = async function(){
    if(kryptikWallet.status != WalletStatus.Locked) return;
    if(!authUser){
        toast.error("You must be logged in to lock your wallet.");
        return;
    }
    setLoading(true);
    try{
        let unlocked = kryptikWallet.seedLoop.unlock(password);
        if(unlocked){
            // update persistent wallet in vault
            let remoteData:UserExtraData = await readExtraUserData(authUser);
            let remoteShare:string = remoteData.remoteShare;
            if(remoteShare){
            updateVaultSeedloop(authUser.uid, remoteShare, kryptikWallet);
            }
            else{
            toast.error("Unable to persist changes. Your wallet will stil be locked for the remainder of your session.")
            }
            updateWalletStatus(WalletStatus.Connected)
            toast.success("Your wallet is unlocked!");
        }
        else{
            toast.error("Password incorrect.");
        }
    }
    catch(e){
        console.warn(e);
        toast.error("Error encountered while unlocking your wallet. Please contact support.")
    }
    setLoading(false);
  }

  return (
    <div>
        <Toaster/>
        <div className="h-[10vh]">
          {/* padding div for space between top and main elements */}
        </div>

        <div className="dark:text-white">
            <div className="background-animate p-1 rounded-lg bg-gradient-to-br from-sky-400 via-emerald-600 to-green-500 max-w-xl mx-auto">

            <div className='max-w-xl mx-auto rounded-lg pt-2 pb-8 px-3 bg-[#FBFDFD] dark:bg-[#0d0d0d]'>
                <div className="flex flex-row mb-4">
                
                <div className="flex-grow">
                    <h1 className="text-2xl text-center font-semibold inline">Your Kryptik Wallet</h1>
                    {
                        (loadingAuthUser||loadingWallet)&&
                        <svg role="status" className="inline w-4 h-4 ml-3 mb-1 text-white animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB"/>
                          <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor"/>
                        </svg>
                    }
                </div>

                </div>
                <div className="flex flex-col text-xl">
                    <div className="flex flex-col">
                       {/* wallet status */}
                        <div className="flex flex-row">
                            <div className="flex-1">
                                <p className="text-slate-600 text-left dark:text-slate-300">Wallet Status</p>
                            </div>
                            <div className="flex-1 px-1">
                                <div className='text-right float-right'>
                                {
                                    (loadingAuthUser||loadingWallet)?
                                    <div className="text-sm font-medium text-gray-900 truncate w-10 mx-auto mb-2 h-4 bg-gray-400 animate-pulse rounded"/>:
                                    walletStatus == WalletStatus.Connected?
                                    <p className="text-green-400 font-semibold">Connected</p>:
                                    walletStatus == WalletStatus.Locked?
                                    <p className="text-yellow-500 font-semibold">Locked 🔒</p>:
                                    walletStatus == WalletStatus.Disconected?
                                    <p className="text-red-500 font-semibold">Disconnected</p>:
                                    walletStatus == WalletStatus.OutOfSync&&
                                    <p className="text-sky-500 dark:text-sky-400 font-semibold">Needs to Sync</p>
                                }
                                </div>
                            </div>
                        </div>
                        {/* display available networks */}
                        <div className="flex flex-row mt-2">
                            <div className="flex-1">
                                <p className="text-slate-600 text-left dark:text-slate-300">Available Networks</p>
                            </div>
                            <div className="flex-1 px-1">
                                <div className='text-right float-right'>
                                {
                                    (loadingAuthUser||loadingWallet)?
                                    <div className="text-sm font-medium text-gray-900 truncate w-10 mx-auto mb-2 h-4 bg-gray-400 animate-pulse rounded"/>:
                                    <AvailableNetworks/>
                                }
                                </div>
                            </div>
                        </div>
                        {/* display resolved ethereum addy*/}
                        <div className="flex flex-row mt-2">
                            <div className="flex-1">
                                <p className="text-slate-600 text-left dark:text-slate-300">Ethereum Address</p>
                            </div>
                            <div className="flex-1 px-1">
                                <div className='text-right float-right'>
                                {
                                    (loadingAuthUser||loadingWallet)?
                                    <div className="text-sm font-medium text-gray-900 truncate w-20 mx-auto mb-2 h-4 bg-gray-400 animate-pulse rounded"/>:
                                    <p>
                                         {walletStatus==WalletStatus.Connected?kryptikWallet.resolvedEthAccount.names?kryptikWallet.resolvedEthAccount.names[0]:truncateAddress(kryptikWallet.resolvedEthAccount.address, NetworkFromTicker("eth")):"0x---------"}
                                    </p>
                                }
                                </div>
                            </div>
                        </div>
                        <p className="text-lg text-left text-slate-400 dark:text-slate-500 my-4">Your Kryptik wallet lets you <span className="text-sky-500 dark:text-sky-400">send</span>, <span className="text-green-500 dark:text-green-400">save</span>, and <span className="text-purple-500 dark:text-purple-400">swap</span> digital assets.</p>
                        {
                            walletStatus == WalletStatus.Locked?
                            <div className="flex flex-col">
                               <input type="password" className="bg-gray-200 dark:bg-gray-700 appearance-none border border-gray-200 rounded w-full py-3 px-4 text-gray-800 dark:text-white leading-tight focus:outline-none focus:bg-white focus:border-sky-400 dark:focus:border-sky-500 text-xl" id="inline-full-name" placeholder="Enter your password" required onChange={(e) => setPassword(e.target.value)}/>
                               <div className='mt-4 text-right float-right'>
                                    <button onClick={()=>handleUnlockWallet()} className="bg-transparent hover:bg-green-500 text-green-500 font-semibold hover:text-white py-2 px-4 border border-green-500 hover:border-transparent rounded" disabled={loading}>
                                        {
                                            !loading?"Unlock":
                                            <svg role="status" className="inline w-4 h-4 ml-3 text-white animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB"/>
                                            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor"/>
                                            </svg>
                                        }
                                    </button>
                                </div>
                            </div>:
                            <div className="flex flex-row">
                            <div className='flex-grow text-right float-right'>
                               {
                                   walletStatus == WalletStatus.OutOfSync?
                                   <button onClick={()=>handleSyncWallet()} className="bg-transparent hover:bg-green-500 text-green-500 font-semibold hover:text-white py-2 px-4 border border-green-500 hover:border-transparent rounded">
                                               Sync Wallet
                                   </button>:
                                   <button onClick={()=>handleGoToWallet()} className="bg-transparent hover:bg-green-500 text-green-500 font-semibold hover:text-white py-2 px-4 border border-green-500 hover:border-transparent rounded">
                                               Go to Wallet
                                   </button>
                               }
                               
                               </div>
                       </div>
                        }
                        
                    </div>
                </div>
            </div>

            </div>
        </div>

    </div>
 
  )
}

export default UserLandingPage