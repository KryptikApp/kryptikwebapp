import { defaultNetworks } from "hdseedloop";
import { useEffect, useState } from "react";
import { useKryptikAuthContext } from "../../components/KryptikAuthProvider";
import { IWallet } from "../models/KryptikWallet";
import {
  addUserBlockchainAccountDB,
  BlockchainAccountDb,
  deleteUserBlockchainAccountDB,
} from "./accounts";
import { getAddressForNetwork } from "./utils/accountUtils";

export function useKryptikTheme() {
  // init state
  const [isDark, setIsDark] = useState(false);
  const [isAdvanced, setIsAdvanced] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [hideBalances, setHideBalances] = useState(false);
  const [themeLoading, setThemeLoading] = useState(true);
  const { authUser } = useKryptikAuthContext();
  const defaultTheme: ITheme = {
    isAdvanced: false,
    isDark: true,
    isVisible: false,
    hideBalances: false,
    lastUpdated: Date.now(),
  };
  interface ITheme {
    isAdvanced: boolean;
    isDark: boolean;
    isVisible: boolean;
    hideBalances: boolean;
    lastUpdated: number;
  }

  const generateThemeLocation = function (uid: string) {
    let themeLocation = `kryptik|${uid}|theme`;
    return themeLocation;
  };

  const fetchTheme = function (uid?: string) {
    let theme: ITheme;
    let themeString: string | null = null;
    if (uid) {
      let themeLocation = generateThemeLocation(uid);
      themeString = localStorage.getItem(themeLocation);
    }
    // fetch stored theme
    if (!themeString) {
      theme = defaultTheme;
    } else {
      theme = { ...JSON.parse(themeString) };
    }
    // update state
    setIsDark(theme.isDark);
    setHideBalances(theme.hideBalances);
    if (theme.isAdvanced) {
      setIsAdvanced(theme.isAdvanced);
    }
    if (theme.isVisible) {
      setIsVisible(theme.isVisible);
    }
  };

  const updateIsDark = function (
    newIsDark: boolean,
    uid: string,
    persist: boolean = true
  ) {
    console.log("updating is dark...");
    // update app state
    setIsDark(newIsDark);
    if (persist) {
      let newTheme: ITheme = {
        isAdvanced: isAdvanced,
        isDark: newIsDark,
        isVisible: isVisible,
        hideBalances: hideBalances,
        lastUpdated: Date.now(),
      };
      // update stored theme
      updateTheme(newTheme, uid);
    }
  };

  const updateIsVisible = async function (
    newIsVisible: boolean,
    uid: string,
    wallet: IWallet
  ) {
    let newTheme: ITheme = {
      isAdvanced: isAdvanced,
      isDark: isDark,
      isVisible: newIsVisible,
      hideBalances: hideBalances,
      lastUpdated: Date.now(),
    };
    let success: boolean = false;
    if (newIsVisible) {
      let blockchainAccounts: BlockchainAccountDb = {
        evmAddress: "",
        nearAddress: "",
        solAddress: "",
      };
      // PERPETUAL TODO: UPDATE WHEN NETWORK WITH DIFFERENT NETWORK FAMILY IS ADDED
      const solNetwork = defaultNetworks["sol"];
      const ethNetwork = defaultNetworks["eth"];
      const nearNetwork = defaultNetworks["near"];
      const solAddy = getAddressForNetwork(wallet, solNetwork);
      const ethAddy = getAddressForNetwork(wallet, ethNetwork);
      const nearAddy = getAddressForNetwork(wallet, nearNetwork);
      // add data to ticker-addy dictionary
      blockchainAccounts.solAddress = solAddy;
      blockchainAccounts.evmAddress = ethAddy;
      blockchainAccounts.nearAddress = nearAddy;
      console.log("adding addys to remote...");
      success = await addUserBlockchainAccountDB(blockchainAccounts);
      console.log("----");
    } else {
      success = await deleteUserBlockchainAccountDB();
    }
    if (success) {
      // update app state
      setIsVisible(newIsVisible);
      // update stored theme
      updateTheme(newTheme, uid);
    } else {
      throw new Error("Unable to add blockchain accounts");
    }
  };

  const updateIsAdvanced = function (newIsAdvanced: boolean, uid: string) {
    console.log("updating is advanced...");
    let newTheme: ITheme = {
      isAdvanced: newIsAdvanced,
      isDark: isDark,
      isVisible: isVisible,
      hideBalances: hideBalances,
      lastUpdated: Date.now(),
    };
    // update app state
    setIsAdvanced(newIsAdvanced);
    // update stored theme
    updateTheme(newTheme, uid);
  };

  const updateHideBalances = function (newHideBalances: boolean, uid: string) {
    console.log("updating hide balances...");
    let newTheme: ITheme = {
      isAdvanced: isAdvanced,
      isDark: isDark,
      isVisible: isVisible,
      hideBalances: newHideBalances,
      lastUpdated: Date.now(),
    };
    // update app state
    setHideBalances(newHideBalances);
    // update stored theme
    updateTheme(newTheme, uid);
  };

  // updates local storage theme value
  const updateTheme = function (newTheme: ITheme, uid: string) {
    let themeLocation = generateThemeLocation(uid);
    let themeString = JSON.stringify(newTheme);
    localStorage.setItem(themeLocation, themeString);
  };

  useEffect(() => {
    setThemeLoading(true);
    // fetch current theme
    fetchTheme(authUser?.uid);
    setThemeLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setThemeLoading(true);
    // fetch current theme
    fetchTheme(authUser?.uid);
    setThemeLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser]);

  return {
    isDark,
    updateIsDark,
    isAdvanced,
    updateIsAdvanced,
    isVisible,
    updateIsVisible,
    hideBalances,
    updateHideBalances,
    themeLoading,
  };
}
