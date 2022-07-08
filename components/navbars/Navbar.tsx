import { NextPage } from "next"
import Link from 'next/link'
import { useState } from "react";
import { useRouter } from "next/router";
import { RiEyeCloseLine, RiEyeLine } from "react-icons/ri";

// wallet SDK helpers
import { useKryptikAuthContext } from "../KryptikAuthProvider";
import { getUserPhotoPath } from "../../src/helpers/firebaseHelper";
import { useKryptikThemeContext } from "../ThemeProvider";
import { update } from "lodash";
import toast, { Toaster } from "react-hot-toast";
import NavbarProduction from "./NavbarProduction";
import NavbarPrelaunch from "./NavbarPrelaunch";


const Navbar:NextPage = () => {
    const [isMenuMobile, setMenuMobile] = useState(false);
    const {kryptikWallet, authUser} = useKryptikAuthContext();
    const {hideBalances, updateHideBalances} = useKryptikThemeContext();
    const router = useRouter();
    const appStage = process.env.APP_STAGE;
    console.log("Router path (Navbar):")
    console.log(router.pathname)

    // change style based on boolean
    const menuWrapperClassName = isMenuMobile
        ? "md:flex flex-col md:flex-row md:ml-auto mt-3 md:mt-0"
        : "hidden md:flex flex-col md:flex-row md:ml-auto mt-3 md:mt-0";

    const handleHideBalances = function(isHideBalances:boolean){
        updateHideBalances(isHideBalances, authUser.uid);
        if(isHideBalances){
            toast("Your balances will now be HIDDEN while browsing")
        }
        else{
            toast("Your balances will now be VISIBLE while browsing")
        }
    }
        
    return(
        <div>
        {
            appStage == "prelaunch"?
            <NavbarPrelaunch/>
            :
            <NavbarProduction/>
        }
        </div>
    )
    
}

export default Navbar