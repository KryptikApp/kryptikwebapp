import type { NextPage } from 'next'
import toast, { Toaster } from 'react-hot-toast';

import { useKryptikAuthContext } from '../components/KryptikAuthProvider';
import { useEffect, useState } from 'react';
import { IAccountResolverParams, IResolvedAccount, resolveAccount, defaultResolvedAccount } from '../src/helpers/resolvers/accountResolver';
import { defaultNetworkDb } from '../src/services/models/network';
import { ServiceState } from '../src/services/types';
import { KryptikProvider } from '../src/services/models/provider';
import { networkFromNetworkDb } from '../src/helpers/utils/networkUtils';

const Home: NextPage = () => {
  const {kryptikWallet, kryptikService, authUser} = useKryptikAuthContext();
  const [resolvedAccount, setResolvedAccount] = useState<IResolvedAccount>(defaultResolvedAccount);

 const fetchResolvedAccount = async function(){
    // make sure service is started
    if(kryptikService.serviceState != ServiceState.started) return;
    let nearNetworkDb = kryptikService.getNetworkDbByTicker("near");
    if(!nearNetworkDb) return;
    let network = networkFromNetworkDb(nearNetworkDb);
    let provider = await kryptikService.getKryptikProviderForNetworkDb(nearNetworkDb)
    let addys = await kryptikWallet.seedLoop.getAddresses(network);
    console.log(addys[0]);
    let resolveParams:IAccountResolverParams ={
      account: addys[0],
      networkDB: nearNetworkDb,
      kryptikProvider: provider
    }
    let newResolvedAccount:IResolvedAccount|null = await resolveAccount(resolveParams)
    if(newResolvedAccount && newResolvedAccount.isResolved){
      setResolvedAccount(newResolvedAccount);
    }
  }

  useEffect(() => {
    fetchResolvedAccount();
  }, [authUser])

  useEffect(()=>{
    fetchResolvedAccount();
  }, [])
  
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
          <h1 className="text-5xl font-bold sans dark:text-white">
              Crypto Made <span className="text-transparent bg-clip-text bg-gradient-to-br from-cyan-500 to-green-500">Easy</span>
          </h1>
          <h1 className="text-center mt-4 dark:text-gray-300">Save, send, and collect with ease.</h1>
          <button onClick={()=>handleGetStarted()} className="bg-transparent hover:bg-green-500 text-green-500 font-semibold hover:text-white py-2 px-4 border border-green-500 hover:border-transparent rounded my-5">
                            Get Started
          </button>

          <div className="dark:text-white">
            <p>UID: {authUser.uid}</p>
            <p>Wallet Connected: {kryptikWallet.connected?"True":"False"}</p>
            <p>Ethereum Address: {kryptikWallet.ethAddress}</p>
            <p>Resolved ETH Name: {resolvedAccount.name?resolvedAccount.name:"Not Set"}</p>
          </div>

        </div>

    </div>
 
  )
}

export default Home
