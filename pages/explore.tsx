import type { NextPage } from 'next'
import toast, { Toaster } from 'react-hot-toast';

import { useKryptikAuthContext } from '../components/KryptikAuthProvider';
import Link from 'next/link';
import SearchAddy from '../components/search/searchAddy';
import SearchNetwork from '../components/search/searchNetwork';


const Explore: NextPage = () => {

  return (
    <div>
        <Toaster/>
        <div className="h-[10rem]">
          {/* padding div for space between top and main elements */}
        </div>
        
        <div className="text-center max-w-2xl mx-auto content-center">
          <SearchNetwork/>
        </div>

        <div className="h-[10rem]">
          {/* padding div for space between top and main elements */}
        </div>
    </div>
 
  )
}

export default Explore