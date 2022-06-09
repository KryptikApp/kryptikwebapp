import {firestore} from "../helpers/firebaseHelper"
import { collection, getDocs, query, where } from "firebase/firestore";
import { ServiceState } from './types';
import BaseService from './BaseService';
import {NetworkDb} from './models/network'
import {
    JsonRpcProvider,
    StaticJsonRpcProvider,
} from '@ethersproject/providers';
import {
    clusterApiUrl,
    Connection,
    PublicKey,
    Transaction,
  } from '@solana/web3.js';

import HDSeedLoop, { HDKeyring, Network, NetworkFamily, NetworkFromTicker, SeedLoop, SerializedSeedLoop } from "hdseedloop";
import { IWallet } from "../models/IWallet";
import { defaultWallet } from "../models/defaultWallet";
import { createVault, unlockVault, VaultAndShares } from "../handlers/wallet/vaultHandler";
import { BigNumber, utils } from "ethers";
import { getPriceOfTicker } from "../helpers/coinGeckoHelper";
import TransactionFeeData, { defaultEVMGas } from "./models/transaction";
import { lamportsToSol, networkFromNetworkDb, roundCryptoAmount, roundUsdAmount } from "../helpers/wallet/utils";
import { async } from "@firebase/util";
import { UserDB } from "../models/user";
import toast from "react-hot-toast";

const NetworkDbsRef = collection(firestore, "networks")


export class KryptikProvider{
    public ethProvider: StaticJsonRpcProvider|undefined;
    public solProvider: Connection|undefined;
    public network:Network;
    constructor(rpcEndpoint:string, networkDb:NetworkDb){
        let network = networkFromNetworkDb(networkDb);
        this.network = network;
        if(network.networkFamily == NetworkFamily.EVM){
            this.ethProvider = new StaticJsonRpcProvider(rpcEndpoint, { name: networkDb.fullName, chainId: networkDb.chainIdEVM });  
        }
        if(network.networkFamily == NetworkFamily.Solana){
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

export interface IBalance{
    fullName: string,
    ticker:string,
    iconPath:string,
    amountCrypto: string,
    amountUSD: string,
    networkCoinGecko: string
}

export interface IConnectWalletReturn{
    wallet:IWallet,
    remoteShare:string
}

class Web3Service extends BaseService{
    getProviderForNetwork(nw: NetworkDb):KryptikProvider {
        return(this.networkProviders[nw.ticker]);
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

    createSeedloop(seed?:string):HDSeedLoop{
        let seedloopKryptik:HDSeedLoop;
        if(seed){
            // create new seedloop from imported seed
            seedloopKryptik = new HDSeedLoop({mnemonic:seed})
        }
        else{
            seedloopKryptik = new HDSeedLoop();
        }
        return seedloopKryptik;
    }

    // UPDATE TO RETURN REMOTE SHARE
    connectKryptikWallet = async (uid:string, remoteShare?:string, seed?:string): Promise<IConnectWalletReturn> => {   
        let seedloopKryptik:HDSeedLoop;
        let remoteShareReturn:string;
        if(remoteShare){
          remoteShareReturn = remoteShare;
          // access existing wallet from local storage vault
          let vaultSeedloop:HDSeedLoop|null = unlockVault(uid, remoteShare);
          // if there is already a seedloop available... use it!
          if(vaultSeedloop){
              seedloopKryptik = vaultSeedloop;
          }
          else{
              throw new Error("Remote share provided, but there is no corresponding seed loop on the client for given uid");
          }
        }
        // CASE: Remote share not provided
        else{
            // create new vault for seedloop 
            seedloopKryptik = this.createSeedloop(seed);
            let newVaultandShare:VaultAndShares = createVault(seedloopKryptik, uid);
            remoteShareReturn = newVaultandShare.remoteShare;
        }

        let ethNetwork = NetworkFromTicker("eth");
        // get all ethereum addreses for wallet
        let etheAddysAll = await seedloopKryptik.getAddresses(ethNetwork);
        let ethAddyFirst = etheAddysAll[0];
        // set values for new wallet
        let newKryptikWallet:IWallet = {
            ...defaultWallet,
            walletProviderName: "kryptik",
            connected: true,
            seedLoop: seedloopKryptik,
            ethAddress: ethAddyFirst,
            uid: uid
        };
        // set return values
        let connectionReturnObject:IConnectWalletReturn = {
            wallet:newKryptikWallet,
            remoteShare: remoteShareReturn
        }
        return connectionReturnObject;
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
        for(const NetworkDb of this.NetworkDbs){
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
        }
    }

    // sets providers for each supported NetworkDb
    private setSupportedProviders(){
        for (let ticker in this.rpcEndpoints) {
            this.setProviderFromTicker(ticker);
        }
    }

    private setProviderFromTicker(ticker:string):KryptikProvider{
        let rpcEndpoint:string = this.rpcEndpoints[ticker];
        let networkDb = this.NetworkDbs.find((nw)=>nw.ticker==ticker);
        if(!networkDb) throw(new Error("Error: Unable to find service networkdb by ticker."))
        let newKryptikProvider = new KryptikProvider(rpcEndpoint, networkDb);
        this.networkProviders[ticker] = newKryptikProvider;
        return newKryptikProvider;
    }

    private async populateNetworkDbsAsync() :Promise<NetworkDb[]>{
        console.log("POPULATING Networkksdb");
        console.log("Service ID:");
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
                networkFamilyName: docData.networkFamilyName,
                ticker: docData.ticker,
                chainId: docData.chainId,
                chainIdEVM: docData.chainIdEVM,
                hexColor: docData.hexColor,
                about: docData.about,
                dateCreated: docData.dateCreated,
                iconPath: docData.iconPath,
                whitePaperPath: docData.whitePaperPath,
                isSupported: docData.isSupported,
                provider: providerFromDb,
                coingeckoId: docData.coingeckoId,
                isTestnet: docData.isTestnet?docData.isTestnet:false
            }
            NetworkDbsResult.push(NetworkDbToAdd);
        });
        this.NetworkDbs = NetworkDbsResult;
        return NetworkDbsResult;
    }

    getSupportedNetworkDbs():NetworkDb[]{
        let NetworkDbsResult:NetworkDb[] = [];
        for(const NetworkDb of this.NetworkDbs){
            // filter results based on searchquery
            if(NetworkDb.isSupported){
                // build NetworkDb object from doc result     
                NetworkDbsResult.push(NetworkDb);
                // console.log(doc.id, " => ", doc.data());
            }
        }
        return NetworkDbsResult;
    }

    async searchNetworkDbsAsync(searchQuery:string, onlySupported?:boolean) :Promise<NetworkDb[]>{
        console.log("Searching....");
        console.log("Is Only supported:")
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


    // TODO: Update to support tx. based networks
    getBalanceAllNetworks = async(walletUser:IWallet, user?:UserDB):Promise<IBalance[]> =>{
        let networksFromDb = this.getSupportedNetworkDbs();
        // initialize return array
        let balances:IBalance[] = [];
        for(const nw of networksFromDb){
            console.log("NETWORK FETCHING FOR:");
            console.log(nw.fullName);
            // only show testnets to advanced users
            if(nw.isTestnet && user && !user.isAdvanced) continue;
            let network:Network = networkFromNetworkDb(nw);
            let kryptikProvider:KryptikProvider = await this.getKryptikProviderForNetworkDb(nw);
            let priceUSD = await getPriceOfTicker(nw.coingeckoId);
            // get balance for supported evm family networks
            if(network.networkFamily==NetworkFamily.EVM){
                if(!kryptikProvider.ethProvider) throw Error(`No ethereum provider set up for ${network.fullName}.`);
                let ethNetworkProvider:JsonRpcProvider = kryptikProvider.ethProvider;
                // if network doesn't exist on seedloop... create it
                if(!walletUser.seedLoop.networkOnSeedloop(network)){
                    console.log("Creating keyring for:");
                    console.log(network.fullName);
                    let newKeyring = walletUser.seedLoop.addKeyRingByNetwork(network);
                    if(!newKeyring){
                        toast.error(`Unable to read balance for ${network.fullName}`);
                        continue;
                    }
                }
                // gets all addresses for network
                let allAddys:string[] = await walletUser.seedLoop.getAddresses(network);
                // gets first address for network
                let firstAddy:string = allAddys[0];
                // get balance in layer 1 token amount
                let networkBalance:number = Number(utils.formatEther(await ethNetworkProvider.getBalance(firstAddy)));
                // prettify ether balance
                let networkBalanceAdjusted:Number = roundCryptoAmount(networkBalance);
                let networkBalanceString = networkBalanceAdjusted.toString();
                let amountUSD = roundUsdAmount((priceUSD * networkBalance));
                let newBalanceObj:IBalance = {fullName:nw.fullName, ticker:nw.ticker, iconPath:nw.iconPath, 
                    amountCrypto:networkBalanceString, amountUSD:amountUSD.toString(), networkCoinGecko:nw.coingeckoId}
                // add adjusted balance to balances return object
                balances.push(newBalanceObj);
            }
            // get balance for supported solana family networks
            if(network.networkFamily == NetworkFamily.Solana){
                if(!kryptikProvider.solProvider) throw(new Error("No solana provider is set up."))
                let solNetworkProvider:Connection = kryptikProvider.solProvider;
                // gets all addresses for network
                let allAddys:string[] = await walletUser.seedLoop.getAddresses(network);
                let firstAddy:string = allAddys[0];
                console.log("SOLANA ADDRESS:");
                console.log(allAddys);
                console.log(firstAddy);
                // gets pub key for solana network
                let solNetwork:Network = NetworkFromTicker("sol");
                let keyring:HDKeyring = await walletUser.seedLoop.getKeyRing(solNetwork);
                let solPubKey:PublicKey|null = keyring.getSolanaFamilyPubKey();
                if(!solPubKey){
                    continue;
                }
                let networkBalance = await solNetworkProvider.getBalance(solPubKey);
                // adjust network balance value
                networkBalance = lamportsToSol(networkBalance);
                let amountUSD = roundUsdAmount((priceUSD * networkBalance.valueOf()));
                let newBalanceObj:IBalance = {fullName:nw.fullName, ticker: nw.ticker, iconPath:nw.iconPath, 
                    amountCrypto:roundCryptoAmount(networkBalance).toString(), amountUSD:amountUSD.toString(), networkCoinGecko:nw.coingeckoId};
                balances.push(newBalanceObj);
            }
        }
        return balances;
    }

    getTransactionFeeData = async(networkDb:NetworkDb, solTransaction?:Transaction):Promise<TransactionFeeData|null> => {
        let network:Network =  networkFromNetworkDb(networkDb);
        let tokenPriceUsd = await getPriceOfTicker(networkDb.coingeckoId);
        switch(network.networkFamily){
            case (NetworkFamily.EVM): { 
                let transactionFeeData:TransactionFeeData = await this.getTransactionFeeData1559Compatible(networkDb, tokenPriceUsd);
                return transactionFeeData;
                break; 
             } 
             case(NetworkFamily.Solana):{
                if(!solTransaction) return null;
                let transactionFeeData:TransactionFeeData = await this.getTransactionFeeDataSolana(networkDb, tokenPriceUsd, solTransaction);
                return transactionFeeData;
             }
             default: { 
                 // for now... just keep original address
                return null;
                break; 
             } 
        }
    }

    getTransactionFeeDataSolana = async(network:NetworkDb, tokenPriceUsd:number, transaction:Transaction):Promise<TransactionFeeData> =>{
        let kryptikProvider:KryptikProvider;
        kryptikProvider = await this.getKryptikProviderForNetworkDb(network);
        // validate provider
        if(!kryptikProvider.solProvider){
            throw(new Error(`No provider specified for ${kryptikProvider.network.fullName}`));
        }
        let solNetworkProvider:Connection = kryptikProvider.solProvider;
        const feeData = await solNetworkProvider.getFeeForMessage(
            transaction.compileMessage(),
            'confirmed',
        );
        let feeInSol:number = lamportsToSol(feeData.value);
        let feeInUsd:number = tokenPriceUsd*feeInSol;
        let transactionFeeData:TransactionFeeData = {
            network: kryptikProvider.network,
            isFresh: true,
            lowerBoundCrypto: feeInSol,
            lowerBoundUSD: feeInUsd,
            upperBoundCrypto: feeInSol,
            upperBoundUSD: feeInUsd,
            EVMGas: defaultEVMGas
        };
        return transactionFeeData;
    }

    getTransactionFeeData1559Compatible = async(network:NetworkDb, tokenPriceUsd:number):Promise<TransactionFeeData> =>{
        let kryptikProvider:KryptikProvider;
        kryptikProvider = await this.getKryptikProviderForNetworkDb(network);
        // validate provider
        if(!kryptikProvider.ethProvider){
            throw(new Error(`No provider specified for ${kryptikProvider.network.fullName}`));
        }
        let ethNetworkProvider:JsonRpcProvider = kryptikProvider.ethProvider;
        let feeData = await ethNetworkProvider.getFeeData();
        let gasLimit:number = 21000;
        // validate fee data response
        if(!feeData.maxFeePerGas || !feeData.maxPriorityFeePerGas || !feeData.gasPrice){
            // arbitrum uses pre EIP-1559 fee structure
            if(network.ticker == "eth(arbitrum)"){
                let baseGas = await ethNetworkProvider.getGasPrice();
                // FIX ASAP
                // ARTIFICIALLY INFLATING, BECAUSE OG VALUE TOO SMALL
                gasLimit = gasLimit*30;
                feeData.gasPrice = baseGas;
                feeData.maxFeePerGas = baseGas;
                feeData.maxPriorityFeePerGas = BigNumber.from(0);
            }
            else{
                throw(new Error(`No fee data returned for ${kryptikProvider.network.fullName}`));
            }
        }
        // calculate fees in token amount
        let baseFeePerGas:number = Number(utils.formatEther(feeData.gasPrice));
        let maxFeePerGas:number = Number(utils.formatEther(feeData.maxFeePerGas));
        let maxTipPerGas:number = Number(utils.formatEther(feeData.maxPriorityFeePerGas));
        let baseTipPerGas:number = maxTipPerGas*.3;
        // amount hardcoded to gas required to transfer ether to someone else
        let lowerBoundCrypto:number = gasLimit*(baseFeePerGas+baseTipPerGas);
        let lowerBoundUSD:number = lowerBoundCrypto*tokenPriceUsd;
        let upperBoundCrypto:number = gasLimit*(maxFeePerGas+maxTipPerGas);
        let upperBoundUsd:number = upperBoundCrypto*tokenPriceUsd;
        // create new fee data object
        let transactionFeeData:TransactionFeeData = {
            network: kryptikProvider.network,
            isFresh: true,
            lowerBoundCrypto: lowerBoundCrypto,
            lowerBoundUSD: lowerBoundUSD,
            upperBoundCrypto: upperBoundCrypto,
            upperBoundUSD: upperBoundUsd,
            EVMGas:{
                // add inputs in original wei amount
                gasLimit: gasLimit,
                gasPrice: feeData.gasPrice,
                maxFeePerGas: feeData.maxFeePerGas,
                maxPriorityFeePerGas: feeData.maxPriorityFeePerGas 
            }
        }
        return transactionFeeData;
    }

    // // amount of gas required for a particular transaction
    // getGasAmount(network){

    // }
    
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