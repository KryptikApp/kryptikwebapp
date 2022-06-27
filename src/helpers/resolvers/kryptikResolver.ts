// converts a registered email address to a blockchain address if present

import { collection, doc, getDoc, query } from "firebase/firestore";
import { firestore } from "../firebaseHelper";
import { IAccountResolverParams, IResolvedAccount } from "./accountResolver";

//otherwise returns null
export const EMAIL_TO_ACCOUNT_DB_LOCATION = "emailToAccounts"

export interface IBlockchainAccounts{
    avaxc?:string,
    btc?:string,
    eth?:string,
    "eth(rop.)"?:string
    "eth(arbitrum)"?:string
    near?:string
    sol?:string
}


//tries to convert registered email address to blockchain address
export const resolveKryptikAccount = async function(params:IAccountResolverParams):Promise<IResolvedAccount|null>{
    const {account, networkDB} = params;
    // if not a valid email return null
    if(!isValidEmailAddress(account)) return null;
    let docRef = doc(firestore, EMAIL_TO_ACCOUNT_DB_LOCATION, account);
    let dbRes = await getDoc(docRef);
    let dbResData = dbRes.data();
     //maps ticker to blockchain address
    const tickerToAddress:{ [ticker: string]: string } = {};
    for (const ticker in dbResData) {
        const addressDb:string = dbResData[ticker];
        tickerToAddress[ticker.toLowerCase()] = addressDb;
        // now key and value are the property name and value
    }
    let addressMatched = tickerToAddress[networkDB.ticker.toLowerCase()]
    if(!addressMatched) return null;
    let resolvedAccount:IResolvedAccount = {
        address: addressMatched,
        isResolved: true,
        name: account
    }
    return resolvedAccount;
}


export const isValidEmailAddress = function(email:string){
    let regex = new RegExp(' /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/')
    return regex.test(email);
}