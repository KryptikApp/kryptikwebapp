import { NextPage } from "next";
import Link from 'next/link';
import { useKryptikAuthContext } from "./KryptikAuthProvider";

// component provides a button that links to autopopulated "ramp.network"
const BuyEth:NextPage = () => {
    const {authUser, kryptikWallet} = useKryptikAuthContext();
    return(
        <div>
            {
                authUser?
                <a target="_blank" rel="noopener noreferrer" href={`https://buy.ramp.network/?userAddress=${kryptikWallet.resolvedEthAccount.address}&userEmailAddress=${authUser.uid}&defaultAsset=ETH_ETH&fiatCurrency=USD&fiatValue=25`}>
                <span className={`p-2 lg:px-4 md:mx-2 text-green-400 text-center border border-solid border-gray-300 dark:border-gray-600 dark:hover:border-sky-200 rounded hover:bg-green-400 hover:cursor-pointer hover:text-white transition-colors duration-300 mt-1 md:mt-0 md:ml-1`}>Buy ETH</span></a>:
                 <a target="_blank" rel="noopener noreferrer"  href={`https://buy.ramp.network/?defaultAsset=ETH_ETH&fiatCurrency=USD&fiatValue=25`}>
                 <span className={`p-2 lg:px-4 md:mx-2 text-green-400 text-center border border-solid border-gray-300 dark:border-gray-600 dark:hover:border-sky-200 rounded hover:bg-green-400 hover:cursor-pointer hover:text-white transition-colors duration-300 mt-1 md:mt-0 md:ml-1`}>Buy ETH</span></a>
            }
           
        </div>
    )   
}

export default BuyEth;