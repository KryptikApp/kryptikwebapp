import { NextPage } from "next"
import Link from 'next/link'
import { useRouter } from "next/router";
import {AiOutlineSetting, AiOutlineUser, AiOutlineLock, AiOutlineWallet, AiOutlineCamera} from "react-icons/ai"



const NavProfile:NextPage = () => {
    const router = useRouter();
        
    return(
        <nav className="fixed bottom-0 inset-x-0 bg-slate-50 opacity-80 flex justify-between text-sm text-sky-600 hover:cursor-pointer">

        <Link href="../profile/security">
            <div  className="w-full block py-5 px-3 text-center hover:bg-slate-200 hover:text-sky-800">
                <AiOutlineLock className="w-6 h-6 mb-2 mx-auto" size="20"/>
                <span className={`${router.pathname == "/profile/security" ? "font-bold" : ""}`}>Security</span>
            </div>
        </Link>
        
        <Link href="../profile/">
            <div  className="w-full block py-5 px-3 text-center hover:bg-slate-200 hover:text-sky-800">
                <AiOutlineUser className="w-6 h-6 mb-2 mx-auto" size="20"/>
                <span className={`${router.pathname == "/profile" ? "font-bold" : ""}`}>Profile</span>
            </div>
        </Link>
    
        <Link href="../profile/avatar">
            <div  className="w-full block py-5 px-3 text-center hover:bg-slate-200 hover:text-sky-800">
                <AiOutlineCamera className="w-6 h-6 mb-2 mx-auto" size="20"/>
                <span className={`${router.pathname == "/profile/avatar" ? "font-bold" : ""}`}>Avatar</span>
            </div>
        </Link>
    
        <Link href="../profile/settings">
            <div  className="w-full block py-5 px-3 text-center hover:bg-slate-200 hover:text-sky-800">
                <AiOutlineSetting className="w-6 h-6 mb-2 mx-auto" size="20"/>
                <span className={`${router.pathname == "/profile/settings" ? "font-bold" : ""}`}>Settings</span>
            </div>
        </Link>
    
        </nav>
    )
    
}

export default NavProfile