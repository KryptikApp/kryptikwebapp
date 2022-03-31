import { createContext, useContext, useState } from 'react'
import { defaultWallet } from '../models/defaultWallet';
import { IWallet } from '../models/IWallet';

// NOTE: lots of projects use redux to track data updates, but react conext works!

let defaultState = {
    wallet: defaultWallet,
    setWallet: (newWallet:IWallet) => {},
}

// Create Context object
const AuthContext = createContext(defaultState);

// Export Provider
export function AuthProvider(props:any) {
	const {value, children} = props
    const setWallet = (newWallet:IWallet) => {
        console.log("Auth provider seting wallet....");
        setWalletState({...walletState, wallet:newWallet})
    }
    
    // this allows us to update wallet from within a child component. Heck yeah!
    const initState = {
        wallet: defaultWallet,
        setWallet: setWallet
      } 
    
    const [walletState, setWalletState] = useState(initState)
	
	return (
	   <AuthContext.Provider value={walletState}>
		{children}
	   </AuthContext.Provider>
	)
}

// Export useContext Hook.
export function useAuthContext() {
	return useContext(AuthContext);
}
