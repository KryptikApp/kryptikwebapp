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
    console.log(`resolving kryptik account w/ id: ${account}`);
    // if not a valid email return null
    if(!isValidEmailAddress(account)) return null;
    console.log(`is valid email addy`);
    let docRef = doc(firestore, EMAIL_TO_ACCOUNT_DB_LOCATION, account);
    let dbRes = await getDoc(docRef);
    let dbResData = dbRes.data();
     //maps ticker to blockchain address
    const tickerToAddress:{ [ticker: string]: string } = {};
    for (const ticker in dbResData) {
        console.log(`Checking resolver for: ${ticker}`)
        console.log(dbResData[ticker]);
        const addressDb:string = dbResData[ticker];
        tickerToAddress[ticker.toLowerCase()] = addressDb;
        // now key and value are the property name and value
    }
    let addressMatched = tickerToAddress[networkDB.ticker.toLowerCase()]
    if(!addressMatched) return null;
    let resolvedAccount:IResolvedAccount = {
        address: addressMatched,
        isResolved: true,
        names: [account]
    }
    return resolvedAccount;
}


export const isValidEmailAddress = function(email:string){
    /* Checks for anystring@anystring.anystring */
    let re = /\S+@\S+\.\S+/;
    return re.test(email);
}