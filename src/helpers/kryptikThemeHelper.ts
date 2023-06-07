import { useEffect, useState } from "react";
import { useKryptikAuthContext } from "../../components/KryptikAuthProvider";
import { useTheme } from "next-themes";

export function useKryptikTheme() {
  // init state
  const [isDark, setIsDark] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const [isAdvanced, setIsAdvanced] = useState(false);
  const [hideBalances, setHideBalances] = useState(false);
  const [themeLoading, setThemeLoading] = useState(true);

  const { authUser } = useKryptikAuthContext();
  const defaultTheme: ITheme = {
    isAdvanced: false,
    hideBalances: false,
    lastUpdated: Date.now(),
  };

  interface ITheme {
    isAdvanced: boolean;
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
    setHideBalances(theme.hideBalances);
    if (theme.isAdvanced) {
      setIsAdvanced(theme.isAdvanced);
    }
  };

  const updateIsDark = function (newIsDark: boolean) {
    console.log("updating is dark...");
    setTheme(newIsDark ? "dark" : "light");
  };

  const updateIsAdvanced = function (newIsAdvanced: boolean, uid: string) {
    console.log("updating is advanced...");
    let newTheme: ITheme = {
      isAdvanced: newIsAdvanced,
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

  useEffect(() => {
    if (resolvedTheme === "dark") {
      setIsDark(true);
    } else {
      setIsDark(false);
    }
  }, [resolvedTheme]);

  return {
    isDark,
    updateIsDark,
    isAdvanced,
    updateIsAdvanced,
    hideBalances,
    updateHideBalances,
    themeLoading,
  };
}
