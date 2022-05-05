// helps with integrating web3service into app. context
import { useEffect, useState } from "react";
import { defaultWallet } from "../../models/defaultWallet";
import { IWallet } from "../../models/IWallet";
import Web3Service from "../services/Web3Service";


export function useKryptikWeb3Service() {
    console.log("Setting kryptik service state");
    // loading value curretly unused.... for future use where
    // we may want to run extra tasks on service setup 
    const [loading, setLoading] = useState(true);
    //create service
    let initServiceState:Web3Service = new Web3Service();
    // set and get kryptik service state
    const [kryptikService, setKryptikService] = useState(initServiceState);
    // wrapper function for wallet 
    const [kryptikWallet, setKryptikWallet] = useState(defaultWallet);

    // wallet state change event handler
    const walletStateChanged = function(wallet:IWallet){
      console.log("Wallet event handler fired!");
      setKryptikWallet(wallet);
    }

    // async start web 3 service
    useEffect(() => {
      const beginService = () => {
        console.log("Fetching.....")
          // start service... expensive operation so minimize use!
        initServiceState.StartSevice().then(ks=>{
            console.log("Started service with effect");
            setKryptikService(ks);
            initServiceState.onWalletChanged = walletStateChanged;
        });
      };
      beginService();
    }, []);

    
    // clear current kryptik web 3 service state
    const clear = () => {
      setKryptikService(new Web3Service());
      setLoading(true);
    };
  
    return {
      kryptikService,
      setKryptikWallet,
      kryptikWallet,
      loading,
      clear
    };
  };