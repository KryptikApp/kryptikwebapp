import { NextPage } from "next";
import { useEffect, useState } from "react";
import { IBalance } from "../../src/services/Web3Service";
import { useKryptikAuthContext } from "../KryptikAuthProvider";
import ListItem from "./ListItem";
import { formatTicker, roundToDecimals } from "../../src/helpers/wallet/utils";
import Divider from "../Divider";
import ListItemLoading from "./ListItemLoading";

const ListBalance:NextPage = () => {
    const {kryptikService, kryptikWallet, authUser} = useKryptikAuthContext();
    const initBalances:IBalance[] = [];
    const[isFetchedBalances, setIsFetchedBalances] = useState(false);
    const[isFetchedERC20, setIsFetchedERC20] = useState(false);
    const[isFetchedSpl, setIsFetchedSpl] = useState(false);
    const[isFetchedNep141, setIsFetchedNep141] = useState(false);
    const[balances, setBalances] = useState<IBalance[]>(initBalances);
    const[balancesERC20, setBalancesERC20] = useState<IBalance[]>(initBalances);
    const[balancesNep141, setBalancesNep141] = useState<IBalance[]>(initBalances);
    const[balancesSpl, setBalancesSpl] = useState<IBalance[]>(initBalances);
    const[progressPercent, setProgressPercent] = useState(0);
    const totalToFetch = kryptikService.NetworkDbs.length + kryptikService.erc20Dbs.length + 
    kryptikService.nep141Dbs.length + kryptikService.splDbs.length;
    const stepSize:number = Number(((1/totalToFetch)*100));

    const incrementLoadProgress = function(balance:IBalance|null){
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
        // fetch network balances
        let bals:IBalance[] = await kryptikService.getBalanceAllNetworks(kryptikWallet, authUser, incrementLoadProgress);
        setBalances(bals);
        setIsFetchedBalances(true);
        // fetch erc0 balances
        let balsERC20:IBalance[] = await kryptikService.getBalanceAllERC20Tokens(kryptikWallet, incrementLoadProgress);
        setBalancesERC20(balsERC20);
        setIsFetchedERC20(true);
        // fetch spl balances
        let balsSpl:IBalance[] = await kryptikService.getBalanceAllSplTokens(kryptikWallet, incrementLoadProgress);
        setBalancesSpl(balsSpl);
        setIsFetchedSpl(true);
        // fetch nep141 balances
        let balsNep141:IBalance[] = await kryptikService.getBalanceAllNep141Tokens(kryptikWallet, incrementLoadProgress);
        setBalancesNep141(balsNep141);
        setIsFetchedNep141(true);
    }

    useEffect(() => {
        if(isFetchedBalances&&isFetchedERC20&&isFetchedNep141&&isFetchedSpl) return;
        fetchBalances();
    }, []);

    return(
        <div>
        <div>
                <div className="flex justify-start mt-5">
                    <h2 className="font-medium text-slate-700">Your Network Balances</h2>
                </div>
                {/* progress bar */}
                {
                    !(isFetchedBalances&&isFetchedERC20&&isFetchedNep141&&isFetchedSpl)&&
                    <div className="max-w-2xl bg-gray-200 rounded-full h-6">
                        <div id="progressBar" className="bg-sky-400 h-6 rounded-full text-gray-700" style={{width: `0%`, maxWidth:`100%`}}>{roundToDecimals(progressPercent, 2)}%</div>
                    </div>
                }
                
                <Divider/>
        {/* Network balances */}
        </div>
        {
            !isFetchedBalances?
            
            <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
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
                {balances.map((balance:IBalance) => (
                    (balance.amountCrypto!="0") &&        
                    <ListItem title={balance.fullName} imgSrc={balance.iconPath} subtitle={formatTicker(balance.ticker)}
                    amount={balance.amountCrypto} amountUSD={balance.amountUSD} coinGeckoId={balance.coinGeckoId}
                    imgSrcSecondary={balance.iconPathSecondary}
                    infoLink={true}
                    networkTicker={balance.ticker}
                    />
                ))}
                </ul>
            </div>
        }
        {/* ERC20 Balances */}
        <div>
                <div className="flex justify-start mt-5">
                    <h2 className="font-medium text-slate-700">Your ERC20 Balances</h2>
                </div>
                <Divider/>
        </div>
        {
            !isFetchedERC20?
            <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
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
                {balancesERC20.map((balance:IBalance) => (    
                    (balance.amountCrypto!="0") &&     
                    <ListItem title={balance.fullName} imgSrc={balance.iconPath} subtitle={formatTicker(balance.ticker)}
                    amount={balance.amountCrypto} amountUSD={balance.amountUSD} coinGeckoId={balance.coinGeckoId}
                    imgSrcSecondary={balance.iconPathSecondary}
                    infoLink={true}
                    networkTicker={balance.baseNetworkTicker}
                    tokenTicker={balance.ticker}
                    />
                ))}
                </ul>
            </div>
        }
        {/* SPL Balances */}
        <div>
                <div className="flex justify-start mt-5">
                    <h2 className="font-medium text-slate-700">Your SPL Balances</h2>
                </div>
                <Divider/>
        </div>
        {
            !isFetchedSpl?
            <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
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
                {balancesSpl.map((balance:IBalance) => (    
                    (balance.amountCrypto!="0") &&     
                    <ListItem title={balance.fullName} imgSrc={balance.iconPath} subtitle={formatTicker(balance.ticker)}
                    amount={balance.amountCrypto} amountUSD={balance.amountUSD} coinGeckoId={balance.coinGeckoId}
                    imgSrcSecondary={balance.iconPathSecondary}
                    infoLink={true}
                    networkTicker={balance.baseNetworkTicker}
                    tokenTicker={balance.ticker}
                    />
                ))}
                </ul>
            </div>
        }

        {/* NEP141 Balances */}
        <div>
                <div className="flex justify-start mt-5">
                    <h2 className="font-medium text-slate-700">Your Nep141 Balances</h2>
                </div>
                <Divider/>
        </div>
        {
            !isFetchedNep141?
            <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
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
            {
                (balancesNep141.length == 0)? 
                <h2 className="text-slate-700 mx-auto my-8">No NEP141 Token Balances</h2>
                :
                <div>
                    <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
                    {balancesNep141.map((balance:IBalance) => (    
                        (balance.amountCrypto!="0") &&     
                        <ListItem title={balance.fullName} imgSrc={balance.iconPath} subtitle={formatTicker(balance.ticker)}
                        amount={balance.amountCrypto} amountUSD={balance.amountUSD} coinGeckoId={balance.coinGeckoId}
                        imgSrcSecondary={balance.iconPathSecondary}
                        infoLink={true}
                        networkTicker={balance.baseNetworkTicker}
                        tokenTicker={balance.ticker}
                        />
                    ))}
                    </ul>
                </div>
            }
            </div>
            
        }
        
        </div>
    )   
}

export default ListBalance;