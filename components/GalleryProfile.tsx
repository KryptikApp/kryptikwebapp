import { Network, truncateAddress } from "hdseedloop";
import { NextPage } from "next";
import { useEffect, useState } from "react";
import { getUserPhotoPath } from "../src/helpers/firebaseHelper";
import { defaultResolvedAccount, IAccountResolverParams, IResolvedAccount, resolveAccount } from "../src/helpers/resolvers/accountResolver";
import { resolveEVMAccount } from "../src/helpers/resolvers/evmResolver";
import { networkFromNetworkDb } from "../src/helpers/utils/networkUtils";
import { defaultNetworkDb, NetworkDb } from "../src/services/models/network";
import { KryptikProvider } from "../src/services/models/provider";
import { useKryptikAuthContext } from "./KryptikAuthProvider";
import ProfileName from "./ProfileName";
interface Props{
    account?:string,
    networkDb?:NetworkDb
}


const GalleryProfile:NextPage<Props> = (props) => {
    const {account, networkDb} = {...props};
    const {authUser, kryptikWallet, kryptikService} = useKryptikAuthContext();
    const [loadingResolvedAccount, setLoadingResolvedAccount] = useState(false);
    const [resolvedAccount, setResolvedAccount] = useState(defaultResolvedAccount);
    const [nameToDisplay, setNameToDisplay] = useState("");
    const [addytoDisplay, setAddyToDisplay] = useState<string|null>(null);
    const [avatarToDisplay, setAvatarToDisplay] = useState("");

const fetchAccountName = async function(){
    setLoadingResolvedAccount(true);
    let provider:KryptikProvider = await kryptikService.getKryptikProviderForNetworkDb(networkDb?networkDb:defaultNetworkDb);
    // note default networkdb should be eth
    let newResolvedAccount:IResolvedAccount|null = null;
    if(account){
        let resolverParams:IAccountResolverParams = {
            account: account,
            kryptikProvider: provider,
            networkDB: networkDb?networkDb:defaultNetworkDb
        }
        newResolvedAccount= await resolveAccount(resolverParams);
    }
    else{
        newResolvedAccount = await kryptikWallet.getResolvedAccount(provider);
        // update shared name state
        kryptikWallet.resolvedEthAccount = newResolvedAccount;
    }
    if(!newResolvedAccount){
        newResolvedAccount = defaultResolvedAccount
    }
    let network:Network = networkFromNetworkDb(networkDb?networkDb:defaultNetworkDb);
    if(authUser.isLoggedIn && authUser.name && !newResolvedAccount.names && !account){
        setNameToDisplay(authUser.name)
        let newAddy = truncateAddress(newResolvedAccount.address, network);
        setAddyToDisplay(newAddy);
    }
    else{
        // TODO: UPDATE TO REMOVE NESTED IF STATEMENT
        if(newResolvedAccount.names)
        {
            let newAddy = truncateAddress(newResolvedAccount.address, network);
            setAddyToDisplay(newAddy);
            setNameToDisplay(newResolvedAccount.names[0]);
        }
        else{
            setNameToDisplay(truncateAddress(newResolvedAccount.address, networkFromNetworkDb(networkDb?networkDb:defaultNetworkDb)))
        }
       
    }
    console.log(newResolvedAccount);
    setAvatarToDisplay(newResolvedAccount.avatarPath?newResolvedAccount.avatarPath:getUserPhotoPath(authUser));
    setResolvedAccount(newResolvedAccount);
    setLoadingResolvedAccount(false);
    }

    useEffect(()=>{
        fetchAccountName();
    }, []);
    return(
        <div className="mx-auto text-center">
              {
                loadingResolvedAccount?
                <div className="w-28 h-28 md:w-24 md:h-24 min-w-20 min-h-20 rounded-full mx-auto mb-2 bg-gray-50 dark:bg-gray-900"/>:
                <img src={avatarToDisplay} alt="Profile Image" className="object-cover w-28 h-28 md:w-24 md:h-24 rounded-full mx-auto mb-2"/>
              }
              
              <div>
                 <div>
                    <h1 className="mt-3 font-bold text-3xl dark:text-white inline">{nameToDisplay}</h1>
                    {
                        addytoDisplay &&
                        <h1 className="mt-3 font-bold text-xl dark:text-slate-600">{addytoDisplay}</h1>
                    }
                 </div>
                    {
                                            loadingResolvedAccount &&
                                            <svg role="status" className="inline w-4 h-4 ml-3 text-white animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB"/>
                                            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor"/>
                                            </svg>
                     } 
                </div>
        </div>
    )   
}

export default GalleryProfile;