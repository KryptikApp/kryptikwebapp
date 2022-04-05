import {firestore} from "../helpers/firebaseHelper"
import { collection, getDocs, query, where } from "firebase/firestore";
import { ServiceState, Status } from './types';
import BaseService from './BaseService';
import {Network} from './models/network'
import {
    StaticJsonRpcProvider,
} from '@ethersproject/providers';
import { stringify } from '@firebase/util';
import { chain } from "lodash";

const networksRef = collection(firestore, "networks")


class Web3Service extends BaseService{
    public networks:Network[] = []
    public networksSupported:Network[] = []
    // network is referenced by its BIP44 chain id
    public rpcEndpoints: { [networkId:number]: string } = {};
    // providers for each network
    public providers: {[networkId:number]: any} = {};

    public web3Provider: StaticJsonRpcProvider = (null as unknown) as StaticJsonRpcProvider;
    public networkProviders: { [networkId:number]: StaticJsonRpcProvider } = {};
   
    constructor() {
        super();
    }

    async InternalStartService(){
        try{
            await this.populateNetworksAsync();
        }
        catch{
            throw(Error("Error: Unable to populate networks when starting web3 service."))
        }
        this.setRpcEndpoints();
        this.setProviders();
        console.log("internal start service search assets");
        return this;
    }

    // sets rpc endpoints for each supported network
    private setRpcEndpoints(){
        this.networks.forEach((network:Network)=>{
            let chainId:number = network.chainId
            if(network.isSupported){
                try{
                    this.rpcEndpoints[chainId] = network.provider;
                }
                // TODO: add better handler 
                catch{
                    console.warn("Network is specified as supported, but there was an error adding rpc endpoint. Check rpc config.")
                }               
            }
        });
    }

    // sets providers for each supported network
    private setProviders(){
        for (let chainId in this.rpcEndpoints) {
            let newProvider = new StaticJsonRpcProvider(this.rpcEndpoints[chainId]);
            this.providers[chainId] = newProvider;
        }
    }

    private async populateNetworksAsync() :Promise<Status>{
        const q = query(networksRef);
        const querySnapshot = await getDocs(q);
        let networksResult:Network[] = []
        querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        let docData = doc.data();
        let providerFromDb:string = "";
        if(docData.provider) providerFromDb = docData.provider;
        let networkToAdd:Network = {
            fullName: docData.fullName,
            ticker: docData.ticker,
            chainId: docData.chainId,
            hexColor: docData.hexColor,
            about: docData.about,
            dateCreated: docData.dateCreated,
            iconPath: docData.iconPath,
            whitePaperPath: docData.whitePaperPath,
            isSupported: docData.isSupported,
            provider: providerFromDb
        }
        networksResult.push(networkToAdd);
        });
        this.networks = networksResult;
        return Status.Success;
    }

    getSupportedNetworks():Network[]{
        let networksResult:Network[] = []
        this.networks.forEach((network) => {
            // filter results based on searchquery
            if(network.isSupported){
                // build network object from doc result     
                networksResult.push(network);
                // console.log(doc.id, " => ", doc.data());
            }
            });
        return networksResult;
    }

    async searchNetworksAsync(searchQuery:string, onlySupported?:boolean) :Promise<Network[]>{
        console.log("Searching....");
        console.log("Only supported:")
        console.log(onlySupported);
        // set default to false if not specified
            if(onlySupported==undefined){
            onlySupported=false
        }
        // TODO: update to be if null or empty
        if(searchQuery == ""){
            if(onlySupported){
                return this.getSupportedNetworks();
            }
            else{
                return this.networks;
            }
        }
        // standardize search query 
        searchQuery = searchQuery.toUpperCase();
        // initialize networks list
        let networksResult:Network[] = []
        if(onlySupported){
            console.log("entered")
            this.networks.forEach((network) => {
                // filter results based on searchquery
                if((network.ticker.toUpperCase().includes(searchQuery) || network.fullName.toUpperCase().includes(searchQuery)) && network.isSupported){
                    // build network object from doc result     
                    networksResult.push(network);
                    // console.log(doc.id, " => ", doc.data());
                }
                });
        }
        else{
            this.networks.forEach((network) => {
                // filter results based on searchquery
                if(network.ticker.toUpperCase().includes(searchQuery) || network.fullName.toUpperCase().includes(searchQuery)){
                    // build network object from doc result     
                    networksResult.push(network);
                    // console.log(doc.id, " => ", doc.data());
                }
                });
        }
        return networksResult;
    }

    getAllNetworks(onlySupported?:boolean){
        if(this.serviceState != ServiceState.started) throw("Service is not running. Network data has not been populated.")
        // set default to false if 
        if(onlySupported == undefined){
            onlySupported = false
        }
        if(onlySupported){
            return this.getSupportedNetworks();
        }
        else{
            return this.networks;
        }
    }

    // send rpc call given a network
    async sendRpcCall(
        payload: {
          method: string;
          params: any[];
        },
        provider: StaticJsonRpcProvider | null = null
      ):Promise<any>
      {
          return (provider || this.web3Provider)?.send(payload.method, payload.params);
      }

      // helper functions!!

      async getProviderForNetwork (
        network: Network
      ): Promise<StaticJsonRpcProvider>{
        let chainId:number = network.chainId;
        return this.getProviderForChainId(chainId);
        }

        async getProviderForChainId (
            chainId:number
        ): Promise<StaticJsonRpcProvider>{
            // try to get existing provider (set on construction)... else, make provider and add to dict.
            if(this.networkProviders[chainId]!=null) return this.networkProviders[chainId];
            // 2x check to ensure provider class accepts chain id as number
            let newProvider = new StaticJsonRpcProvider(this.rpcEndpoints[chainId], chainId);
            this.networkProviders[chainId] = newProvider;
            await newProvider.ready;
            return newProvider;
        }
}


export default Web3Service;