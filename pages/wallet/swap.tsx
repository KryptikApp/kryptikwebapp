import type { NextPage } from 'next'
import { useEffect, useState } from 'react';
import { useKryptikThemeContext } from '../../components/ThemeProvider';
import { fetch0xSwapOptions } from '../../src/requests/swaps/0xSwaps';


const Swap: NextPage = () => {
  const {isDark} = useKryptikThemeContext();
  const [isLoading, setIsLoading] = useState(false);

  const handleSwapRequest = async function(){
    setIsLoading(true);
    await fetch0xSwapOptions("DAI", "WBTC", 100000);
    setIsLoading(false);
  }
  return (

    <div className="dark:text-white">
        <div className="max-w-2xl mx-auto px-4 md:px-0 min-h-[100vh]">
            <div className="bg-white dark:bg-black md:ml-6 mt-8 md:mt-0 rounded-lg min-h-[30rem] md:min-h-[25rem] h-fit md:max-h-[40rem] dark:border dark:border-gray-100 md:overflow-x-hidden overflow-y-auto no-scrollbar">
                <div className="flex flex-col">
                    <div>

                    </div>
                    <div>

                    </div>
                    <div>
                          <button onClick={()=>handleSwapRequest()} className={`bg-transparent hover:bg-sky-400 text-sky-500 font-semibold hover:text-white text-2xl py-2 px-20 ${isLoading?"hover:cursor-not-allowed":""} border border-sky-400 hover:border-transparent rounded-lg my-5`} disabled={isLoading}>      
                                  {
                                          !isLoading?"Send":
                                          <svg role="status" className="inline w-4 h-4 ml-3 text-white animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                          <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB"/>
                                          <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor"/>
                                          </svg>
                                    }
                          </button>
                    </div>
                </div>
            </div>
        </div>
        <div className="h-[6rem]">
          {/* padding div for space between bottom and main elements */}
        </div>
    </div>
       

 
  )
}

export default Swap