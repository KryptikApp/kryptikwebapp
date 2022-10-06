import type { NextPage } from 'next'
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useKryptikAuthContext } from '../../components/KryptikAuthProvider';
import { useKryptikThemeContext } from '../../components/ThemeProvider';
import TokenCard from '../../components/tokens/TokenCard';
import { TokenAndNetwork, TokenDb } from '../../src/services/models/token';
import { ServiceState } from '../../src/services/types';


const SupportedProtocols: NextPage = () => {
  const {isDark} = useKryptikThemeContext();
  const {kryptikService, kryptikWallet} = useKryptikAuthContext();

  const [allTokens, setAllTokens] = useState<TokenDb[]>([])
  // ensure service is started
  const router = useRouter();
  const {isAdvanced} = useKryptikThemeContext();
  
  async function fetchAllProtocols(){
    if(kryptikService.serviceState != ServiceState.started){
      await kryptikService.StartSevice()
    }
    try{
      const newTokenList:TokenDb[] = kryptikService.getAllTokens();
      setAllTokens(newTokenList)
    }
    catch(e){
      console.log(e)
      console.warn("Unable to fetch all tokens")
    }
  }

  useEffect(()=>{
    fetchAllProtocols()
  }, [])
  
  return (
    <div>
        <div className="dark:text-white">
          <div className="min-h-[100vh]">

            <div className="min-h-[20vh]">
              {/* padding div for space between top and main elements */}
            </div>

            <div className="px-4 md:px-0  max-w-2xl mx-auto">
              <h1 className="text-3xl text-left font-bold sans mb-5">
                    What tokens does Kryptik Support?
              </h1>
              <p className="leading-loose mb-2 text-xl text-justify dark:text-gray-400">Kryptik Supports supports <b>all major tokens</b>, allowing you to track and manage your entire portfolio from one place. Supported tokens are shown below.</p>
              <p className="text-md mt-8 text-gray-700 dark:text-gray-200 text-right">Check out the Kryptik docs <span className="text-sky-400"><Link href="../docs">here</Link></span> 📜</p>
            </div>

            <div className="min-h-[10vh]">
              {/* padding div for space between about and more info */}
            </div>
            {/* divide-y divide-gray-200 dark:divide-gray-700 */}
            <div className="flex flex-col space-y-4 max-w-2xl mx-auto">
            {
                 allTokens.length !=0 && allTokens.map((token:TokenDb, index:number)=>
                    <TokenCard token={token} key={`${token.name} ${index}`}/>
                )
            }
            </div>
           

          </div>
        

        </div>
    

        <div className="h-[6rem]">
          {/* padding div for space between bottom and main elements */}
        </div>

    </div>
       

 
  )
}

export default SupportedProtocols