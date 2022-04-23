import { createContext, useContext, useState } from 'react'
import { defaultWallet } from '../models/defaultWallet';
import { IWallet } from '../models/IWallet';
import Web3Service from '../src/services/Web3Service';

// NOTE: lots of projects use redux to track data updates, but react conext works!

let defaultState = {
    kryptikService: new Web3Service(),
    setKryptikService: (newService:Web3Service) => {},
}

// Create Context object
const KryptikContext = createContext(defaultState);

// Export Provider
export function KryptikServiceProvider(props:any) {
	const {value, children} = props
    const setKryptik = (newKryptikService:Web3Service) => {
        console.log("Kryptik service provider seting wallet....");
        setKryptikState({...kryptikState, kryptikService:newKryptikService})
    }
    
    // this allows us to update wallet from within a child component. Heck yeah!
    let initState={
        kryptikService: new Web3Service(),
        setKryptikService: setKryptik
    }
    
    new Web3Service().StartSevice().then(ks=>{
        initState = {
            kryptikService: ks,
            setKryptikService: setKryptik
        } 
    });
        
    const [kryptikState, setKryptikState] = useState(initState)
	
	return (
	   <KryptikContext.Provider value={kryptikState}>
		{children}
	   </KryptikContext.Provider>
	)
}

// Export useContext Hook.
export function useKryptikContext() {
	return useContext(KryptikContext);
}