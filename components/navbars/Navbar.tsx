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
    const appMode = process.env.NEXT_PUBLIC_APP_MODE;
 
    return(
        <div>
        {
            appMode == "prelaunch"?
            <NavbarPrelaunch/>
            :
            <NavbarProduction/>
        }
        </div>
    )
    
}

export default Navbar