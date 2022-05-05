import {firestore} from "../helpers/firebaseHelper"
import { collection, getDocs, query, where } from "firebase/firestore";
import { ServiceState, Status } from './types';
import BaseService from './BaseService';
import {NetworkDb} from './models/network'
import {
    JsonRpcProvider,
    StaticJsonRpcProvider,
} from '@ethersproject/providers';
import {
    clusterApiUrl,
    Connection,
  } from '@solana/web3.js';

import HDSeedLoop, { Network, NetworkFamily, NetworkFromTicker, SeedLoop, SerializedSeedLoop } from "hdseedloop";
import { IWallet } from "../../models/IWallet";
import { defaultWallet } from "../../models/defaultWallet";

const NetworkDbsRef = collection(firestore, "networks")


class KryptikProvider{
    public ethProvider: StaticJsonRpcProvider|undefined;
    public solProvider: Connection|undefined;
    public network:Network;
    constructor(rpcEndpoint:string, network:Network){
        this.network = network;
        if(network.getNetworkfamily() == NetworkFamily.EVM){
            if(network.ticker == "bnb"){
                this.ethProvider = new StaticJsonRpcProvider(rpcEndpoint, { name: 'binance', chainId: 56 });
            }
            else{
                this.ethProvider = new StaticJsonRpcProvider(rpcEndpoint);
            }    
        }
        if(network.getNetworkfamily()==NetworkFamily.Solana){
            this.solProvider = new Connection(rpcEndpoint);
        }
    }
}

interface ITransactionHistory{
    assetName: string,
    assetImagePath: string,
    assetTicker: string,
    hash: string,
    amountCrypto: string,
}

class Web3Service extends BaseService{
    getProviderForNetwork(nw: NetworkDb) {
        throw new Error("Method not implemented.");
    }
    private wallet:IWallet|null = null;
    public isWalletSet:boolean = false;
    public NetworkDbs:NetworkDb[] = []
    public NetworkDbsSupported:NetworkDb[] = []
    // NetworkDb is referenced by its BIP44 chain id
    public rpcEndpoints: { [ticker:string]: string } = {};
    public web3Provider: StaticJsonRpcProvider = (null as unknown) as StaticJsonRpcProvider;
    //providers for each network
    public networkProviders: { [ticker:string]: KryptikProvider } = {};
    // event handlers
    public onWalletChanged?: (wallet:IWallet) => void
   
    constructor() {
        console.log("constructing new web3 class");
        super();
    }

    // set wallet for kryptik web 3 service
    // should only be used by functions within class
    // use connect wallet to set wallet 
    private internalSetWallet(inputWallet:IWallet):IWallet{
        this.wallet = inputWallet;
        this.isWalletSet = true;
        if(this.onWalletChanged) this.onWalletChanged(this.wallet);
        return this.wallet;
    }

    // get wallet for kryptik web 3 service
    getWallet():IWallet|null{
        if(!this.isWalletSet) return null;
        return this.wallet;
    }

    connectKryptikWallet = async (seed?:string): Promise<IWallet> => {   
        // check for kryptik wallet in local storage
        let existingWallet = window.localStorage.getItem("kryptikWallet");
        let seedloopKryptik:HDSeedLoop;
        // if there is already a seedloop available... use it!
        if(existingWallet){
          let currSeedloop:SerializedSeedLoop = JSON.parse(existingWallet);
          seedloopKryptik = HDSeedLoop.deserialize(currSeedloop);
        }
        else{
            // use imported seed to create seedloop
            if(seed){
              seedloopKryptik = new HDSeedLoop({mnemonic:seed})
            }
            else{
              seedloopKryptik = new HDSeedLoop();
            }
        }
        let ethNetwork = NetworkFromTicker("eth");
        // get all ethereum addreses for wallet
        let etheAddysAll = await seedloopKryptik.getAddresses(ethNetwork);
        let ethAddyFirst = etheAddysAll[0];
        let newKryptikWallet:IWallet = {
            ...defaultWallet,
            walletProviderName: "kryptik",
            connected: true,
            seedLoop: seedloopKryptik,
            ethAddress: ethAddyFirst
        };
        console.log("New kryptik wallet:");
        console.log(newKryptikWallet);
        // serialize seed loop for storage
        let hdseedloopSerialized:SerializedSeedLoop =  await newKryptikWallet.seedLoop.serialize();
        // uncomment to save seed loop in local storage
        // window.localStorage.setItem("kryptikWallet", JSON.stringify(hdseedloopSerialized));
        // set wallet for internal use
        // ALLOW THIS TO BE SET IF USING LOCAL CLASS WALLET
        // this.internalSetWallet(newKryptikWallet);
        // returns new kryptik wallet that adheres to wallet interface
        return newKryptikWallet;
    };

    async InternalStartService(){
        try{
            await this.populateNetworkDbsAsync();
        }
        catch{
            throw(Error("Error: Unable to populate NetworkDbs when starting web3 service."))
        }
        this.setRpcEndpoints();
        this.setSupportedProviders();
        // console logs for debugging
        // REMOVE for production
        console.log("Internal start service: KryptiK Web3");
        console.log("Service Id:");
        console.log(this.serviceId);
        return this;
    }

    // sets rpc endpoints for each supported NetworkDb
    private setRpcEndpoints(){
        this.NetworkDbs.forEach((NetworkDb:NetworkDb)=>{
            let ticker:string = NetworkDb.ticker;
            if(NetworkDb.isSupported){
                try{
                    this.rpcEndpoints[ticker] = NetworkDb.provider;
                }
                // TODO: add better handler 
                catch{
                    console.warn("NetworkDb is specified as supported, but there was an error adding rpc endpoint. Check rpc config.")
                }               
            }
        });
    }

    // sets providers for each supported NetworkDb
    private setSupportedProviders(){
        for (let ticker in this.rpcEndpoints) {
            this.setProviderFromTicker(ticker);
        }
    }

    private setProviderFromTicker(ticker:string):KryptikProvider{
        let network:Network = NetworkFromTicker(ticker);
        let rpcEndpoint:string = this.rpcEndpoints[ticker];
        let newKryptikProvider = new KryptikProvider(rpcEndpoint, network);
        this.networkProviders[ticker] = newKryptikProvider;
        return newKryptikProvider;
    }

    private async populateNetworkDbsAsync() :Promise<NetworkDb[]>{
        console.log("POPULATING Networkksdb");
        console.log("Web 3 service ID:");
        console.log(this.serviceId);
        const q = query(NetworkDbsRef);
        const querySnapshot = await getDocs(q);
        let NetworkDbsResult:NetworkDb[] = [];
        querySnapshot.forEach((doc) => {
            // doc.data() is never undefined for query doc snapshots
            let docData = doc.data();
            let providerFromDb:string = "";
            if(docData.provider) providerFromDb = docData.provider;
            let NetworkDbToAdd:NetworkDb = {
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
            NetworkDbsResult.push(NetworkDbToAdd);
        });
        this.NetworkDbs = NetworkDbsResult;
        return NetworkDbsResult;
    }

    getSupportedNetworkDbs():NetworkDb[]{
        let NetworkDbsResult:NetworkDb[] = []
        this.NetworkDbs.forEach((NetworkDb) => {
            // filter results based on searchquery
            if(NetworkDb.isSupported){
                // build NetworkDb object from doc result     
                NetworkDbsResult.push(NetworkDb);
                // console.log(doc.id, " => ", doc.data());
            }
        });
        return NetworkDbsResult;
    }

    async searchNetworkDbsAsync(searchQuery:string, onlySupported?:boolean) :Promise<NetworkDb[]>{
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
                return this.getSupportedNetworkDbs();
            }
            else{
                return this.NetworkDbs;
            }
        }
        // standardize search query 
        searchQuery = searchQuery.toUpperCase();
        // initialize NetworkDbs list
        let NetworkDbsResult:NetworkDb[] = []
        if(onlySupported){
            this.NetworkDbs.forEach((NetworkDb) => {
                // filter results based on searchquery
                if((NetworkDb.ticker.toUpperCase().includes(searchQuery) || NetworkDb.fullName.toUpperCase().includes(searchQuery)) && NetworkDb.isSupported){
                    // build NetworkDb object from doc result     
                    NetworkDbsResult.push(NetworkDb);
                    // console.log(doc.id, " => ", doc.data());
                }
                });
        }
        else{
            this.NetworkDbs.forEach((NetworkDb) => {
                // filter results based on searchquery
                if(NetworkDb.ticker.toUpperCase().includes(searchQuery) || NetworkDb.fullName.toUpperCase().includes(searchQuery)){
                    // build NetworkDb object from doc result     
                    NetworkDbsResult.push(NetworkDb);
                    // console.log(doc.id, " => ", doc.data());
                }
                });
        }
        return NetworkDbsResult;
    }

    getAllNetworkDbs(onlySupported?:boolean){
        if(this.serviceState != ServiceState.started) throw("Service is not running. NetworkDb data has not been populated.")
        // set default to false if 
        if(onlySupported == undefined){
            onlySupported = false
        }
        if(onlySupported){
            return this.getSupportedNetworkDbs();
        }
        else{
            return this.NetworkDbs;
        }
    }

    // send rpc call given a NetworkDb
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
    async getKryptikProviderForNetworkDb (
      networkDb: NetworkDb
      ): Promise<KryptikProvider>{
          return this.getKryptikProviderFromTicker(networkDb.ticker);
      }
      private async getKryptikProviderFromTicker (
          ticker:string
      ): Promise<KryptikProvider>{
          // try to get existing provider (set on construction)... else, make provider and add to dict.
          if(this.networkProviders[ticker]!=null) return this.networkProviders[ticker];
          let newKryptikProvider:KryptikProvider = this.setProviderFromTicker(ticker);
          return newKryptikProvider;
      }
      networkDbtoKryptikNetwork(networkFromDb:NetworkDb):Network{
          return new Network(networkFromDb.fullName, networkFromDb.ticker);
    }
    
    // TODO: Update to support tx. based networks
    getBalanceAllNetworks = async(walletUser:IWallet):Promise<{ [ticker: string]: number }> =>{
        let currWallet:IWallet = this.wallet?this.wallet:walletUser;
        let networksFromDb = this.getSupportedNetworkDbs();
        // initialize return dict.
        let balanceDict: { [ticker: string]: number } = {};
        console.log("Supported networks:");
        console.log(networksFromDb);
        networksFromDb.forEach(async nw => {
            let network:Network = new Network(nw.fullName, nw.ticker);
            let kryptikProvider:KryptikProvider = await this.getKryptikProviderForNetworkDb(nw);
            if(network.getNetworkfamily()==NetworkFamily.EVM){
                if(!kryptikProvider.ethProvider) throw Error("No ethereum provider set up.");
                let ethNetworkProvider:JsonRpcProvider = kryptikProvider.ethProvider;
                console.log("Processing Network:")
                console.log(nw);
                // gets all addresses for network
                let allAddys:string[] = await currWallet.seedLoop.getAddresses(network);
                // gets first address for network
                let firstAddy:string = "allAddys[0];"
                console.log(`${nw.fullName} Addy:`);
                console.log(firstAddy);
                // get provider for network
                let networkBalance = await ethNetworkProvider.getBalance(firstAddy);
                // add network balance to dict. with network ticker as key
                balanceDict[network.ticker] = networkBalance.toNumber();
                console.log(`${nw.fullName} Balance:`);
                console.log(balanceDict[network.ticker]);
            }
        });
        // return (
        //   ethers.BigNumber.from(balance)
        //     .div(ethers.BigNumber.from("10000000000000000"))
        //     .toNumber() / 100
        // );
        console.log("Returning balance dict:");
        console.log(balanceDict);
        return balanceDict;
    }
    
     // TODO: Update to support tx. based networks
     getTransactionsAllNetworks = async():Promise<ITransactionHistory[]> =>{
        throw(Error("Not implemented yet."));
        // let networksFromDb = this.getSupportedNetworkDbs();
        // // initialize return dict.
        // let transactionList:ITransactionHistory[] = [];
        // console.log("Supported networks:");
        // console.log(networksFromDb);
        // networksFromDb.forEach(async nw => {
        //     let network:Network = new Network(nw.fullName, nw.ticker);
        //     let kryptikProvider:KryptikProvider = await this.getKryptikProviderForNetworkDb(nw);
        //     if(network.ticker=="eth" && this.wallet.seedLoop.networkOnSeedloop(network)){
        //         if(!kryptikProvider.ethProvider) throw Error("No ethereum provider set up.");
        //         console.log("Processing Network:")
        //         console.log(nw);
        //         // gets all addresses for network
        //         let allAddys:string[] = await this.wallet.seedLoop.getAddresses(network);
        //         // gets first address for network
        //         let firstAddy:string = allAddys[0];
        //         console.log(`${nw.fullName} Addy:`);
        //         console.log(firstAddy);
        //         // add network balance to dict. with network ticker as key
        //     }
        // });
        // console.log("Returning transaction history:");
        // return transactionList;
    }
        
}


export default Web3Service;