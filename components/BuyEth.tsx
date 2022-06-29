import { NextPage } from "next";
import Link from 'next/link';
import { useKryptikAuthContext } from "./KryptikAuthProvider";

const BuyEth:NextPage = () => {
    const {kryptikService, authUser, kryptikWallet} = useKryptikAuthContext();
    return(
        <div>
<Link href={`https://buy.ramp.network/?userAddress=${kryptikWallet.ethAddress}&userEmailAddress=${authUser.uid}&defaultAsset=ETH_ETH&fiatCurrency=USD&fiatValue=25`}>
    <span className={`p-2 lg:px-4 md:mx-2 text-green-400 text-center border border-solid border-gray-300 dark:border-gray-600 dark:hover:border-sky-200 rounded hover:bg-green-400 hover:cursor-pointer hover:text-white transition-colors duration-300 mt-1 md:mt-0 md:ml-1`}>Buy ETH here</span></Link>
</div>
    )   
}

export default BuyEth;