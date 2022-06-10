import { NextPage } from "next";
import { useEffect, useState } from "react";
import { IBalance } from "../../src/services/Web3Service";
import { useKryptikAuthContext } from "../KryptikAuthProvider";
import ListItem from "./ListItem";
import Link from 'next/link';
import { formatTicker } from "../../src/helpers/wallet/utils";
import Divider from "../Divider";

const ListBalance:NextPage = () => {
    const {kryptikService, kryptikWallet, authUser} = useKryptikAuthContext();
    const initBalances:IBalance[] = [];
    const initBalancesErc20:IBalance[] = [];
    const[isFetchedBalances, setIsFetchedBalances] = useState(false);
    const[isFetchedERC20, setIsFetchedERC20] = useState(false);
    const[balances, setBalances] = useState<IBalance[]>(initBalances);
    const[balancesERC20, setBalancesERC20] = useState<IBalance[]>(initBalances);

    // retrieves wallet balances
    const fetchBalances = async() =>{
        // fetch network balances
        let bals:IBalance[] = await kryptikService.getBalanceAllNetworks(kryptikWallet, authUser);
        setBalances(bals);
        setIsFetchedBalances(true);
        // fetch erc0 balances
        let balsERC20:IBalance[] = await kryptikService.getBalanceERC20(kryptikWallet);
        setBalancesERC20(balsERC20);
        setIsFetchedERC20(true);
    }

    useEffect(() => {
        fetchBalances();
    }, []);

    return(
        <div>
        {
            !isFetchedBalances?<p>Loading Balances.</p>:
            <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
              {balances.map((balance:IBalance) => (
                  (balance.amountCrypto!="0") &&        
                  <ListItem title={balance.fullName} imgSrc={balance.iconPath} subtitle={formatTicker(balance.ticker)}
                   amount={balance.amountCrypto} amountUSD={balance.amountUSD} networkCoinGecko={balance.networkCoinGecko}/>
              ))}
            </ul>
        }
        {
            !isFetchedERC20?<p>Loading ERC20 Balances.</p>:
            <div>
                <div className="flex justify-start mt-5">
                    <h2 className="font-medium text-slate-700">Your Token Balances</h2>
                </div>
                <Divider/>
                <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
                {balancesERC20.map((balance:IBalance) => (       
                    <ListItem title={balance.fullName} imgSrc={balance.iconPath} subtitle={formatTicker(balance.ticker)}
                    amount={balance.amountCrypto} amountUSD={balance.amountUSD} networkCoinGecko={balance.networkCoinGecko}/>
                ))}
                </ul>
            </div>
        }
        </div>
    )   
}

export default ListBalance;