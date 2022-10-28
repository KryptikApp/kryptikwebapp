import { defaultNetworks } from "hdseedloop";
import { useEffect, useState } from "react";
import { useKryptikAuthContext } from "../../components/KryptikAuthProvider";
import { IWallet } from "../models/KryptikWallet";
import { addUserBlockchainAccountsDB, deleteUserBlockchainAccountsDB } from "./firebaseHelper";
import { getAddressForNetwork } from "./utils/accountUtils";

export function useKryptikTheme() {
    // init state
    const [isDark, setIsDark] = useState(false);
    const [isAdvanced, setIsAdvanced] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [hideBalances, setHideBalances] = useState(false);
    const [themeLoading, setThemeLoading] = useState(true);
    const{authUser} = useKryptikAuthContext();
    
    const defaultTheme:ITheme = {
        isAdvanced:false,
        isDark: true,
        isVisible: false,
        hideBalances:false,
        lastUpdated: Date.now()
    }
    interface ITheme{
        isAdvanced:boolean,
        isDark:boolean,
        isVisible:boolean,
        hideBalances:boolean,
        lastUpdated: number
    }

    const generateThemeLocation = function(uid:string){
        let themeLocation = `kryptik|${uid}|theme`
        return themeLocation;
    }

    const fetchTheme = function(uid?:string){
        let theme:ITheme;
        let themeString:string|null = null;
        if(uid)
        {
            let themeLocation = generateThemeLocation(uid)
            themeString = localStorage.getItem(themeLocation);
        }
        // fetch stored theme
        if(!themeString){
            theme = defaultTheme
        }
        else{
            theme = {...JSON.parse(themeString)}
        }
        // update state
        setIsDark(theme.isDark);
        setHideBalances(theme.hideBalances);
        if(theme.isAdvanced){
            setIsAdvanced(theme.isAdvanced);
        }
        if(theme.isVisible){
            setIsVisible(theme.isVisible);
        }
    }

    const updateIsDark = function(newIsDark:boolean, uid:string, persist:boolean=true){
        console.log("updating is dark...");
        // update app state
        setIsDark(newIsDark);
        if(persist){
            let newTheme:ITheme = {
                isAdvanced: isAdvanced,
                isDark: newIsDark,
                isVisible: isVisible,
                hideBalances: hideBalances,
                lastUpdated: Date.now()
            }
            // update stored theme
            updateTheme(newTheme, uid);
        }   
    }

    const updateIsVisible = async function(newIsVisible:boolean, uid:string, wallet:IWallet){
        let newTheme:ITheme = {
            isAdvanced: isAdvanced,
            isDark: isDark,
            isVisible: newIsVisible,
            hideBalances: hideBalances,
            lastUpdated: Date.now()
        }
        if(newIsVisible){
            let blockchainAccounts:any = {}
            // PERPETUAL TODO: UPDATE WHEN NETWORK WITH DIFFERENT ADDY IS ADDED
            const solNetwork = defaultNetworks["sol"];
            const ethNetwork = defaultNetworks["eth"];
            const nearNetwork = defaultNetworks["near"];
            const solAddy = getAddressForNetwork(wallet, solNetwork);
            const ethAddy = getAddressForNetwork(wallet, ethNetwork);
            const nearAddy = getAddressForNetwork(wallet, nearNetwork);
            // add data to ticker-addy dictionary
            blockchainAccounts[solNetwork.ticker] = solAddy;
            blockchainAccounts[ethNetwork.ticker] = ethAddy;
            blockchainAccounts[nearNetwork.ticker] = nearAddy;
            console.log("adding addys to remote...");
            await addUserBlockchainAccountsDB(blockchainAccounts);
            console.log("----");
        }
        else{
            await deleteUserBlockchainAccountsDB();
        }
        // update app state
        setIsVisible(newIsVisible);
        // update stored theme
        updateTheme(newTheme, uid);
    }

    const updateIsAdvanced = function(newIsAdvanced:boolean, uid:string){
        console.log("updating is advanced...");
        let newTheme:ITheme = {
            isAdvanced: newIsAdvanced,
            isDark: isDark,
            isVisible: isVisible,
            hideBalances: hideBalances,
            lastUpdated: Date.now()
        }
        // update app state
        setIsAdvanced(newIsAdvanced);
        // update stored theme
        updateTheme(newTheme, uid);
    }

    const updateHideBalances = function(newHideBalances:boolean, uid:string){
        console.log("updating hide balances...");
        let newTheme:ITheme = {
            isAdvanced: isAdvanced,
            isDark: isDark,
            isVisible: isVisible,
            hideBalances: newHideBalances,
            lastUpdated: Date.now()
        };
        // update app state
        setHideBalances(newHideBalances);
        // update stored theme
        updateTheme(newTheme, uid);
    }

    // updates local storage theme value
    const updateTheme = function(newTheme:ITheme, uid:string){
        let themeLocation = generateThemeLocation(uid);
        let themeString = JSON.stringify(newTheme);
        localStorage.setItem(themeLocation, themeString);
    }

    useEffect(()=>{
        setThemeLoading(true);
        // fetch current theme
        fetchTheme(authUser?.uid);
        setThemeLoading(false);
    }, [])

    useEffect(()=>{
        setThemeLoading(true);
        // fetch current theme
        fetchTheme(authUser?.uid);
        setThemeLoading(false);
    }, [authUser])

    return{
        isDark, 
        updateIsDark,
        isAdvanced,
        updateIsAdvanced,
        isVisible,
        updateIsVisible,
        hideBalances,
        updateHideBalances,
        themeLoading,
    }
}