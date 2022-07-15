import { NextPage } from "next"
import Link from 'next/link'
import { useState } from "react";
import { useRouter } from "next/router";
import { RiEyeCloseLine, RiEyeLine } from "react-icons/ri";

// wallet SDK helpers
import { Toaster } from "react-hot-toast";


const NavbarPrelaunch:NextPage = () => {
    const [isMenuMobile, setMenuMobile] = useState(false);
    const router = useRouter();


    // change style based on boolean
    const menuWrapperClassName = isMenuMobile
        ? "flex flex-col md:flex-row mx-auto min-h-[100vh] md:min-h-0 md:ml-auto mt-8 md:mt-0 z-20 md:z-0"
        : "hidden md:flex md:flex-row md:ml-auto mt-3 md:mt-0";

        
    return(
        <nav className="py-2 md:py-4">
            <div className="container px-4 mx-auto md:flex md:items-center">

            <div className="flex justify-between items-center hover:cursor-pointer">
                <Link href="/">
                <span className="font-extrabold text-3xl text-transparent bg-clip-text bg-gradient-to-br from-blue-500 to-green-500 hover:outline-4 hover:outline-blue-400 dark:hover:text-white transition-colors duration-1500">Kryptik</span>
                </Link>
                <button id="nav-icon" onClick={()=>setMenuMobile(!isMenuMobile)} type="button" className={`inline-flex ${isMenuMobile && "open"} items-center ml-3 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:hover:bg-gray-700 dark:focus:ring-gray-600`} aria-controls="mobile-menu" aria-expanded="false">
                <span className="bg-gray-500 dark:bg-gray-400"></span>
                <span className="bg-gray-500 dark:bg-gray-400"></span>
                <span className="bg-gray-500 dark:bg-gray-400"></span>
                </button>
            </div>
            <div id="menu" className={menuWrapperClassName} onClick={()=>setMenuMobile(false)}>
                <Link href="../about"><span className={`p-2 lg:px-4 md:mx-2 text-gray-400 text-3xl md:text-lg rounded hover:bg-gray-200 hover:cursor-pointer hover:text-gray-700 dark:hover:bg-gray-100 dark:hover:text-black transition-colors duration-300 ${router.pathname == "/about" ? "font-bold" : ""} `}>About</span></Link>
                <Link href="../vision"><span className={`p-2 lg:px-4 md:mx-2 text-gray-400 text-3xl md:text-lg rounded hover:bg-gray-200 hover:cursor-pointer hover:text-gray-700 dark:hover:bg-gray-100 dark:hover:text-black transition-colors duration-300 ${router.pathname == "/vision" ? "font-bold" : ""} `}>Vision</span></Link>
                {/* show disconnect button if connected and vise versa */}
                <Link href="../explore"><span className={`p-2 lg:px-4 md:mx-2 text-green-400 text-3xl md:text-lg md:text-center md:border md:border-solid md:border-gray-300 md:dark:border-gray-600 md:dark:hover:border-sky-200 rounded hover:bg-green-400 hover:cursor-pointer hover:text-white transition-colors duration-300 mt-1 md:mt-0 md:ml-1`}>Explore</span></Link>
            </div>
            </div>
        <Toaster/>
        </nav>
    )
    
}

export default NavbarPrelaunch