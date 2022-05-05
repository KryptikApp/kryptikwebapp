import { createContext, useContext, useState } from 'react'
import { defaultWallet } from '../models/defaultWallet';
import { IWallet } from '../models/IWallet';
import { useKryptikWeb3Service } from '../src/helpers/web3Helper';
import Web3Service from '../src/services/Web3Service';

// NOTE: lots of projects use redux to track data updates, but react conext works!

let defaultState = {
    kryptikService: new Web3Service(),
	kryptikWallet: defaultWallet,
    loading: false,
	setKryptikWallet: (newWallet:IWallet) => {},
    clear: () => {},
}

// Create Context object
const KryptikServiceContext = createContext(defaultState);

// Export Provider
export function KryptikServiceProvider(props:any) {
	const {value, children} = props;
    let kryptikServiceState = useKryptikWeb3Service();
	return (
	   <KryptikServiceContext.Provider value={kryptikServiceState}>
		{children}
	   </KryptikServiceContext.Provider>
	)
}

// Export useContext Hook.
export function useKryptikServiceContext() {
	return useContext(KryptikServiceContext);
}