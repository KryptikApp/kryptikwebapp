// helps with integrating web3service into app. context
import { useState } from "react";
import { defaultWallet } from "../../models/defaultWallet";
import Web3Service from "../services/Web3Service";


export function useKryptikWeb3Service() {
    //create dummy user of type userDB

    let initServiceState:Web3Service = new Web3Service();
    // start service... expensive operation so minimize use!
    new Web3Service().StartSevice().then(ks=>{
        initServiceState = ks
    });

    // loading value curretly unused.... for future use where
    // we may want to run extra tasks on service setup 
    const [loading, setLoading] = useState(true);
    // set and get kryptik service state
    const [kryptikService, setKryptikService] = useState(initServiceState);

    // wrapper function for wallet 
    const [kryptikWallet, setKryptikWallet] = useState(defaultWallet);

    
    // clear current kryptik web 3 service state
    const clear = () => {
      setKryptikService(new Web3Service());
      setLoading(true);
    };
  
    return {
      kryptikService,
      loading,
      clear
    };
  };