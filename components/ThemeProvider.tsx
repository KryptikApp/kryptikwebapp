import { createContext, useContext} from 'react'

import { useKryptikTheme } from '../src/helpers/kryptikThemeHelper';
import { IWallet } from '../src/models/KryptikWallet';


const kryptikThemeContext = createContext({
    isDark:true,
    themeLoading:true,
    updateIsDark: (newIsDark:boolean, uid:string)=>{},
    isAdvanced:false,
    updateIsAdvanced: (newIsAdvanced:boolean, uid:string)=>{},
    isVisible:false,
    updateIsVisible: async (newIsVisible:boolean, uid:string, wallet:IWallet)=>{},
    hideBalances:false,
    updateHideBalances:(newHideBalances:boolean, uid:string)=>{},
  });

export function KryptikThemeProvider(props:any) {
  const {value, children} = props
  const theme = useKryptikTheme();
  return <kryptikThemeContext.Provider value={theme}>{children}</kryptikThemeContext.Provider>;
}
// custom hook to use the authUserContext and access authUser and loading
export const useKryptikThemeContext = () => useContext(kryptikThemeContext);