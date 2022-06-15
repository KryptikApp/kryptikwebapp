import { NextPage } from "next";
import { useEffect, useState } from "react";
import { IBalance } from "../../src/services/Web3Service";
import { useKryptikAuthContext } from "../KryptikAuthProvider";
import ListItem from "./ListItem";
import Link from 'next/link';
import { formatTicker } from "../../src/helpers/wallet/utils";
import Divider from "../Divider";
import { NetworkDb } from "../../src/services/models/network";
import ListItemLoading from "./ListItemLoading";

const ListBalance:NextPage = () => {
    const {kryptikService, kryptikWallet, authUser} = useKryptikAuthContext();
    const initBalances:IBalance[] = [];
    const[isFetchedBalances, setIsFetchedBalances] = useState(false);
    const[isFetchedERC20, setIsFetchedERC20] = useState(false);
    const[isFetchedSpl, setIsFetchedSpl] = useState(false);
    const[balances, setBalances] = useState<IBalance[]>(initBalances);
    const[balancesERC20, setBalancesERC20] = useState<IBalance[]>(initBalances);
    const[balancesSpl, setBalancesSpl] = useState<IBalance[]>(initBalances);


    // retrieves wallet balances
    const fetchBalances = async() =>{
        // fetch network balances
        let bals:IBalance[] = await kryptikService.getBalanceAllNetworks(kryptikWallet, authUser);
        setBalances(bals);
        setIsFetchedBalances(true);
        // fetch erc0 balances
        let balsERC20:IBalance[] = await kryptikService.getBalanceAllERC20Tokens(kryptikWallet);
        setBalancesERC20(balsERC20);
        setIsFetchedERC20(true);
        // fetch spl balances
        let balsSpl:IBalance[] = await kryptikService.getBalanceAllSplTokens(kryptikWallet);
        setBalancesSpl(balsSpl);
        setIsFetchedSpl(true);
    }

    useEffect(() => {
        fetchBalances();
    }, []);

    return(
        <div>
            {/* Network balances */}
        <div>
                <div className="flex justify-start mt-5">
                    <h2 className="font-medium text-slate-700">Your Network Balances</h2>
                </div>
                <Divider/>
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
                    amount={balance.amountCrypto} amountUSD={balance.amountUSD} networkCoinGecko={balance.networkCoinGecko}
                    imgSrcSecondary={balance.iconPathSecondary}
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
                    amount={balance.amountCrypto} amountUSD={balance.amountUSD} networkCoinGecko={balance.networkCoinGecko}
                    imgSrcSecondary={balance.iconPathSecondary}
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
                    amount={balance.amountCrypto} amountUSD={balance.amountUSD} networkCoinGecko={balance.networkCoinGecko}
                    imgSrcSecondary={balance.iconPathSecondary}
                    />
                ))}
                </ul>
            </div>
        }
        </div>
    )   
}

export default ListBalance;