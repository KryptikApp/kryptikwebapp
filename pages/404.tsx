import type { NextPage } from 'next'
import Link from 'next/link';

import { useKryptikThemeContext } from '../components/ThemeProvider';


const Custom404: NextPage = () => {
  const {isDark, themeLoading} = useKryptikThemeContext()

  return (
    <div className={`${(themeLoading||isDark && "text-white")} mx-auto max-w-xl`}>
       <div className="min-h-[10rem]">
       </div>
       <div className="text-center">
            <p><span className="text-5xl" title="404">404</span></p>
            <p className="text-lg dark:text-slate-500 text-slate-400">Whoops! You're in unexplored territory.</p>
            <Link href="/explore">
                 <p className="text-md dark:text-white hover:cursor-pointer dark:hover:text-sky-500 transition-colors duration-1500 mt-4">Keep exploring?</p>
            </Link>
       </div>
   
    </div>
 
  )
}

export default Custom404