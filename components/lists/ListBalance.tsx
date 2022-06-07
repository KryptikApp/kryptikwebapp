import { NextPage } from "next";
import { useEffect, useState } from "react";
import { IBalance } from "../../src/services/Web3Service";
import { useKryptikAuthContext } from "../KryptikAuthProvider";
import ListItem from "./ListItem";
import Link from 'next/link';

const ListBalance:NextPage = () => {
    const {kryptikService, kryptikWallet} = useKryptikAuthContext();
    const initBalances:IBalance[] = [];
    const[isFetched, setIsFetched] = useState(false);
    const[balances, setBalances] = useState<IBalance[]>(initBalances);

    // retrieves wallet balances
    const fetchBalances = async() =>{
        let bals:IBalance[] = await kryptikService.getBalanceAllNetworks(kryptikWallet);
        setBalances(bals);
        setIsFetched(true);
    }

    useEffect(() => {
        fetchBalances();
    }, []);

    return(
        <div>
        {
            !isFetched?<p>Loading Balances.</p>:
            <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
              {balances.map((balance:IBalance) => (        
                  <ListItem title={balance.fullName} imgSrc={balance.iconPath} subtitle={balance.ticker}
                   amount={balance.amountCrypto} amountUSD={balance.amountUSD} networkCoinGecko={balance.networkCoinGecko}/>
              ))}
            </ul>
        }
        </div>
    )   
}

export default ListBalance;