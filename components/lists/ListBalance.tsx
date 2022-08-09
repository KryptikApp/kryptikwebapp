import { NextPage } from "next";
import { useEffect, useState } from "react";

import { useKryptikAuthContext } from "../KryptikAuthProvider";
import ListItemBalance from "./ListItemBalance";
import Divider from "../Divider";
import ListItemLoading from "./ListItemLoading";
import { roundToDecimals } from "../../src/helpers/utils/numberUtils";
import { useKryptikThemeContext } from "../ThemeProvider";
import { useRouter } from "next/router";
import { ServiceState } from "../../src/services/types";
import { IBalance } from "../../src/services/models/IBalance";
import { TokenAndNetwork } from "../../src/services/models/token";
import { KryptikBalanceHolder } from "../../src/services/models/KryptikBalanceHolder";

const ListBalance:NextPage = () => {
    const {kryptikService, kryptikWallet} = useKryptikAuthContext();
    // ensure service is started
    const router = useRouter();
    const {isAdvanced} = useKryptikThemeContext()
    const initTokenAndBalances:TokenAndNetwork[] = [];
    const[isFetchedBalances, setIsFetchedBalances] = useState(false);
    const[tokenAndBalances, setTokenAndBalances] = useState<TokenAndNetwork[]>(initTokenAndBalances);
    const[balanceHolder, setBalanceHolder] = useState<KryptikBalanceHolder|null>(null);
    const[progressPercent, setProgressPercent] = useState(0);
    const totalToFetch = kryptikService.NetworkDbs.length + kryptikService.tokenDbs.length;
    const stepSize:number = Number(((1/totalToFetch)*100));

    const incrementLoadProgress = function(tokenANdBalance:TokenAndNetwork|null){
        let progressBar = document.getElementById("progressBar");
        if(progressBar){
            let currentWidth = progressBar.style.width;
            // remove % from element width
            let lastIndex = currentWidth.indexOf("%");
            let currentProgress = Number(currentWidth.slice(0, lastIndex));
            currentProgress = currentProgress+stepSize;
            // update ui progress percent.. not to exceed 100%
            if(currentProgress>100){
                progressBar.style.width = `${100}%`;
                setProgressPercent(100)
            }
            else{
                progressBar.style.width = `${currentProgress}%`;
                setProgressPercent(currentProgress);
            }
        }
    }

    // retrieves wallet balances
    const fetchBalances = async() =>{
        const balanceHolder:KryptikBalanceHolder = await kryptikService.getAllBalances({walletUser:kryptikWallet, isAdvanced:isAdvanced, onFetch:incrementLoadProgress});
        const newTokenAndBals:TokenAndNetwork[] = balanceHolder.getNonzeroBalances();
        console.log(newTokenAndBals);
        setTokenAndBalances(newTokenAndBals);
        setBalanceHolder(balanceHolder);
        setIsFetchedBalances(true);
    }

    useEffect(() => {
        if(kryptikService.serviceState != ServiceState.started){
            router.push('/')
        }
        if(isFetchedBalances) return;
        fetchBalances();
    }, []);

    return(
        <div>
        <div>
                <div className="flex flex-row mt-5">
                    <h2 className="text-lg text-slate-700 dark:text-slate-200">Your Network Balances</h2>
                    <div className="flex-grow text-right">
                        {
                            (isFetchedBalances && balanceHolder) &&
                            <h2 className="text-sm text-slate-500 dark:text-slate-500 pt-1">Last Updated: {balanceHolder?.getLastUpdateTimestamp()}</h2>
                        }
                    </div>
                </div>
                {/* progress bar */}
                {
                    !(isFetchedBalances)&&
                    <div className="max-w-2xl bg-gray-200 dark:bg-[#141414] rounded-full h-6">
                        <div id="progressBar" className="bg-gradient-to-r from-sky-400 to-sky-600 h-6 rounded-full text-gray-700" style={{width: `0%`, maxWidth:`100%`}}>{progressPercent>15?`${roundToDecimals(progressPercent, 2)}%`:""}</div>
                    </div>
                }
                
                <Divider/>
        {/* Network balances */}
        </div>
        {
            !isFetchedBalances?
            
            <ul role="list">
            {
                <div>
                    <ListItemLoading/>
                    <ListItemLoading/>
                    <ListItemLoading/>
                </div>
            }
            </ul>
            :
            <div>
                <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
                {tokenAndBalances.map((tokenAndBalance:TokenAndNetwork, index:number) => (
                    (tokenAndBalance.networkBalance || tokenAndBalance.tokenData?.tokenBalance) &&      
                    <ListItemBalance key={index} tokenAndNetwork={tokenAndBalance} htmlKey={100000+index}
                    />
                ))}
                </ul>
            </div>
        }

        
        </div>
    )   
}

export default ListBalance;