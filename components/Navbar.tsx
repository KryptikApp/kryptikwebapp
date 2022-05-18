import { NextPage } from "next"
import Link from 'next/link'
import { useState } from "react";
import { useRouter } from "next/router";

// wallet SDK helpers
import { useKryptikAuthContext } from "./KryptikAuthProvider";


const Navbar:NextPage = () => {
    const [isMenuMobile, setMenuMobile] = useState(false);
    const {kryptikWallet, authUser} = useKryptikAuthContext();
    const router = useRouter();
    console.log("Router path (Navbar):")
    console.log(router.pathname)

    // change style based on boolean
    const menuWrapperClassName = isMenuMobile
        ? "md:flex flex-col md:flex-row md:ml-auto mt-3 md:mt-0"
        : "hidden md:flex flex-col md:flex-row md:ml-auto mt-3 md:mt-0";
        
    return(
        <nav className="py-2 md:py-4">
            <div className="container px-4 mx-auto md:flex md:items-center">

            <div className="flex justify-between items-center">
                <Link href="/">
                <a href="#" className="font-extrabold text-xl text-transparent bg-clip-text bg-gradient-to-br from-blue-500 to-green-500">Kryptik</a>
                </Link>
                <button id="menuBotton" onClick={()=>setMenuMobile(!isMenuMobile)} type="button" className="inline-flex items-center p-2 ml-3 text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600" aria-controls="mobile-menu" aria-expanded="false">
                    <span className="sr-only">Open main menu</span>
                    <svg  className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"></path></svg>
                    <svg  className="hidden w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                </button>
            </div>
            <div id="menu" className={menuWrapperClassName}>
                {kryptikWallet.connected && authUser? 
                <Link href="../profile"><span className={`p-2 lg:px-4 md:mx-2 text-gray-400 rounded hover:bg-gray-200 hover:cursor-pointer hover:text-gray-700 transition-colors duration-300 ${router.pathname == "/profile" ? "font-bold" : ""} `}>Profile</span></Link>
                :<Link href="../about"><span className={`p-2 lg:px-4 md:mx-2 text-gray-400 rounded hover:bg-gray-200 hover:cursor-pointer hover:text-gray-700 transition-colors duration-300 ${router.pathname == "/about" ? "font-bold" : ""} `}>About</span></Link>
                }
                <Link href="../explore"><span className={`p-2 lg:px-4 md:mx-2 text-gray-400 rounded hover:bg-gray-200 hover:cursor-pointer hover:text-gray-700 transition-colors duration-300 ${router.pathname == "/explore" ? "font-bold" : ""}`}>Explore</span></Link>
                <Link href="../createNft"><span className={`p-2 lg:px-4 md:mx-2 text-green-400 text-center border border-transparent rounded hover:bg-indigo-100 hover:cursor-pointer hover:text-green-500 transition-colors duration-300 ${router.pathname == "/createNft" ? "font-bold" : ""}`}>Create</span></Link> 
                {/* show disconnect button if connected and vise versa */}
                {kryptikWallet.connected && authUser ? 
                <Link href="../wallet/"><span className={`p-2 lg:px-4 md:mx-2 text-green-400 text-center border border-solid border-grey-600 rounded hover:bg-green-400 hover:cursor-pointer hover:text-white transition-colors duration-300 mt-1 md:mt-0 md:ml-1`}>Wallet <img src={authUser.photoUrl} alt="Profile Image" className="inline object-cover w-5 h-5 rounded-full ml-2"/></span></Link>
                :<Link href="../wallet/createWallet"><span className={`p-2 lg:px-4 md:mx-2 text-green-400 text-center border border-solid border-grey-600 rounded hover:bg-green-400 hover:cursor-pointer hover:text-white transition-colors duration-300 mt-1 md:mt-0 md:ml-1`}>Connect</span></Link>}
            </div>
            </div>

        </nav>
    )
    
}

export default Navbar