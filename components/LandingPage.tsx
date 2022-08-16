import type { NextPage } from 'next'
import { Toaster } from 'react-hot-toast';

import { useKryptikAuthContext } from '../components/KryptikAuthProvider';
import UserLandingPage from './landings/UserLandingPage';
import BrandLandingPage from './landings/BrandLandingPage';
import { useEffect } from 'react';
import { useRouter } from 'next/router';


const LandingPage: NextPage = () => {
  const router = useRouter();
  const {authUser, loadingAuthUser, loadingWallet} = useKryptikAuthContext();

  // useEffect(()=>{
  //   if(!loading && kryptikWallet.connected){
  //     router.push("/wallet")
  //   }
  // }, [loading])

  return (
    <div>
        <Toaster/>
        <div className="h-[10vh]">
          {/* padding div for space between top and main elements */}
        </div>

        <div className="dark:text-white">
          
          {
            ((loadingAuthUser||loadingWallet||authUser))?
            <UserLandingPage/>:
            <BrandLandingPage/>
          }
          
        </div>
        <div className="h-[10rem]">
          {/* padding div for space between top and main elements */}
        </div>
    </div>
 
  )
}

export default LandingPage