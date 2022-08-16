import { NextPage } from "next";
import { useEffect, useState } from "react";
import { NetworkDb } from "../../src/services/models/network";
import { ServiceState } from "../../src/services/types";
import IconSneakPeek from "../IconSneakPeek";
import { useKryptikAuthContext } from "../KryptikAuthProvider";

const AvailableNetworks:NextPage = () => {
    const {authUser, kryptikWallet, kryptikService} = useKryptikAuthContext();
    const [allNetworks, setAllNetworks] = useState<NetworkDb[]>([])
    const [networksToShow, setNetworksToShow] = useState<NetworkDb[]>([]);
    const [iconsToShow, setIconsToShow] = useState<string[]>([]);
    const [maxAmountToShow, setMaxAmountToShow] = useState(4);
    const fetchNetworks = async()=>{
        if(kryptikService.serviceState != ServiceState.started) return;
        const supportedNetworks = kryptikService.getAllNetworkDbs(true);
        setAllNetworks(supportedNetworks);
        if(supportedNetworks.length<maxAmountToShow){
            setNetworksToShow(supportedNetworks)
        }
        else{
            let newNetworksToShow:NetworkDb[] = [];
            let newIconsToShow:string[] = [];
            let ethNetwork:NetworkDb|null = kryptikService.getNetworkDbByTicker("eth");
            let solNetwork:NetworkDb|null = kryptikService.getNetworkDbByTicker("sol");
            let nearNetwork:NetworkDb|null = kryptikService.getNetworkDbByTicker("near");
            let avaxcNetwork:NetworkDb|null = kryptikService.getNetworkDbByTicker("avaxc");
            if(ethNetwork){
                newNetworksToShow.push(ethNetwork);
                newIconsToShow.push(ethNetwork.iconPath);
            }
            if(solNetwork){
                newNetworksToShow.push(solNetwork);
                newIconsToShow.push(solNetwork.iconPath);
            }
            if(nearNetwork){
                newNetworksToShow.push(nearNetwork);
                newIconsToShow.push(nearNetwork.iconPath);
            }
            if(avaxcNetwork){
                newNetworksToShow.push(avaxcNetwork);
                newIconsToShow.push(avaxcNetwork.iconPath);
            }
            //uncomment below for simple slice slection
            // newNetworksToShow = supportedNetworks.slice(0, maxAmountToShow);
            setNetworksToShow(newNetworksToShow);
            setIconsToShow(newIconsToShow);
        }
    }
    useEffect(()=>{
        fetchNetworks();
    }, [])
    return(
        <IconSneakPeek icons={iconsToShow} groupTotal={allNetworks.length}/>
    )   
}

export default AvailableNetworks;