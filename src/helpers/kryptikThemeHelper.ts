import { useEffect, useState } from "react";

export function useKryptikTheme() {
    // init state
    const [isDark, setIsDark] = useState(false);
    const [hideBalances, setHideBalances] = useState(false);
    const [themeLoading, setThemeLoading] = useState(true);
    const themeLocation = "kryptik|theme"
    const defaultTheme:ITheme = {
        isDark: false,
        hideBalances:false,
        lastUpdated: Date.now()
    }
    interface ITheme{
        isDark:boolean,
        hideBalances:boolean,
        lastUpdated: number
    }

    const fetchTheme = function(){
        let theme:ITheme;
        let themeString:string|null = localStorage.getItem(themeLocation);
        // fetch stored theme
        if(!themeString){
            theme = defaultTheme
        }
        else{
            theme = JSON.parse(themeString)
        }
        // update state
        setIsDark(theme.isDark);
        setHideBalances(theme.hideBalances);
    }

    const updateIsDark = function(newIsDark:boolean){
        console.log("updating is dark...");
        let newTheme:ITheme = {
            isDark: newIsDark,
            hideBalances: hideBalances,
            lastUpdated: Date.now()
        }
        // update app state
        setIsDark(newIsDark);
        // update stored theme
        updateTheme(newTheme);
    }

    const updateHideBalances = function(newHideBalances:boolean){
        console.log("updating hide balances...");
        let newTheme:ITheme = {
            isDark: isDark,
            hideBalances: newHideBalances,
            lastUpdated: Date.now()
        };
        // update app state
        setHideBalances(newHideBalances);
        // update stored theme
        updateTheme(newTheme);
    }

    // updates local storage theme value
    const updateTheme = function(newTheme:ITheme){
        let themeString = JSON.stringify(newTheme);
        localStorage.setItem(themeLocation, themeString);
    }

    useEffect(()=>{
        setThemeLoading(true);
        // fetch current theme
        fetchTheme();
        setThemeLoading(false);
    }, [])

    return{
        isDark, 
        updateIsDark,
        hideBalances,
        updateHideBalances,
        themeLoading,
    }
}