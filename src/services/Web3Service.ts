import {firestore} from "../helpers/firebaseHelper"
import { collection, getDocs, query, where } from "firebase/firestore";
import { ServiceState } from './types';
import BaseService from './BaseService';
import {defaultNetworkDb, defaultTokenAndNetwork, NetworkBalanceParameters, NetworkDb, placeHolderEVMAddress} from './models/network'
import {
    JsonRpcProvider,
    StaticJsonRpcProvider,
} from '@ethersproject/providers';
import {
    Connection,
    PublicKey,
    RpcResponseAndContext,
    TokenAmount,
  } from '@solana/web3.js';
  import { Account as NearAccount, Near } from "near-api-js";
import { AccountBalance as NearAccountBalance } from "near-api-js/lib/account";
import { BigNumber, Contract, utils } from "ethers";
import { BlockResult } from "near-api-js/lib/providers/provider";

import HDSeedLoop, {Network, NetworkFamily, NetworkFamilyFromFamilyName, NetworkFromTicker, WalletKryptik } from "hdseedloop";
import { IWallet } from "../models/IWallet";
import { defaultWallet } from "../models/defaultWallet";
import { createVault, unlockVault, VaultAndShares } from "../handlers/wallet/vaultHandler";
import { getPriceOfTicker } from "../helpers/coinGeckoHelper";
import TransactionFeeData, {defaultEVMGas, FeeDataEvmParameters, FeeDataNearParameters, FeeDataParameters, FeeDataSolParameters, TxType} from "./models/transaction";
import { UserDB } from "../models/user";
import { CreateEVMContractParameters, TokenBalanceParameters, ChainData, TokenDb, ERC20Params, SplParams, Nep141Params, TokenAndNetwork } from "./models/token";
import {erc20Abi} from "../abis/erc20Abi";
import { KryptikProvider } from "./models/provider";
import { searchTokenListByTicker } from "../helpers/search";
import { createEd25519PubKey, createSolTokenAccount } from "../helpers/utils/accountUtils";
import { networkFromNetworkDb, isNetworkArbitrum, getChainDataForNetwork } from "../helpers/utils/networkUtils";
import { lamportsToSol, divByDecimals, roundCryptoAmount, roundUsdAmount, multByDecimals, roundToDecimals } from "../helpers/utils/numberUtils";

const NetworkDbsRef = collection(firestore, "networks");
const ERC20DbRef = collection(firestore, "erc20tokens");
const SplDbRef = collection(firestore, "spltokens");
const Nep141Ref = collection(firestore, "nep141tokens")




export interface IBalance{
    fullName: string,
    ticker:string,
    iconPath:string,
    iconPathSecondary?:string,
    amountCrypto: string,
    amountUSD: string,
    coinGeckoId: string,
    baseNetworkTicker: string
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
    public NetworkDbs:NetworkDb[] = [];
    public erc20Dbs:TokenDb[] = [];
    public nep141Dbs:TokenDb[] = [];
    public splDbs:TokenDb[] = [];
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
        // fetch network data
        try{
            await this.populateNetworkDbsAsync();
        }
        catch{
            throw(Error("Error: Unable to populate NetworkDbs when starting web3 service."))
        }
        // fetch erc20 data
        try{
            await this.populateErc20DbsAsync();
        }
        catch{
            throw(new Error("Error: Unable to populate ERC20 array from database when starting web3 service."));
        }
        // fetch nep141 data
        try{
            await this.populateNep141DbsAsync();
        }
        catch{
            throw(new Error("Error: Unable to populate Nep141 array from database when starting web3 service."));
        }
        // fetch spl data
        try{
            await this.populateSplDbsAsync();
        }
        catch{
            throw(new Error("Error: Unable to populate SPL array from database when starting web3 service."));
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

    private async populateErc20DbsAsync():Promise<TokenDb[]>{
        console.log("Populating erc20 data from db");
        const q = query(ERC20DbRef);
        const querySnapshot = await getDocs(q);
        let erc20DbsResult:TokenDb[] = [];
        querySnapshot.forEach((doc) => {
            let docData = doc.data();
            let erc20DbToAdd:TokenDb = {
                name: docData.name,
                coingeckoId: docData.coingeckoId,
                symbol: docData.symbol,
                decimals: docData.decimals,
                hexColor: docData.hexColor?docData.hexColor:"#000000",
                chainData:docData.chainData,
                logoURI: docData.logoURI,
                extensions: docData.extensions,
                tags:docData.tags
            }
            erc20DbsResult.push(erc20DbToAdd);
        });
        this.erc20Dbs = erc20DbsResult;
        return this.erc20Dbs;
    }

    private async populateSplDbsAsync():Promise<TokenDb[]>{
        console.log("Populating spl data from db");
        const q = query(SplDbRef);
        const querySnapshot = await getDocs(q);
        let splDbsResult:TokenDb[] = [];
        querySnapshot.forEach((doc) => {
            let docData = doc.data();
            let splDbToAdd:TokenDb = {
                name: docData.name,
                coingeckoId: docData.coingeckoId,
                symbol: docData.symbol,
                decimals: docData.decimals,
                hexColor: docData.hexColor?docData.hexColor:"#000000",
                chainData:docData.chainData,
                logoURI: docData.logoURI,
                extensions: docData.extensions,
                tags:docData.tags
            }
            splDbsResult.push(splDbToAdd);
        });
        this.splDbs = splDbsResult;
        return this.splDbs;
    }

    private async populateNep141DbsAsync():Promise<TokenDb[]>{
        console.log("Populating nep141 data from db");
        const q = query(Nep141Ref);
        const querySnapshot = await getDocs(q);
        let nep141DbsResult:TokenDb[] = [];
        querySnapshot.forEach((doc) => {
            let docData = doc.data();
            let nep141DbToAdd:TokenDb = {
                name: docData.name,
                coingeckoId: docData.coingeckoId,
                symbol: docData.symbol,
                decimals: docData.decimals,
                hexColor: docData.hexColor?docData.hexColor:"#000000",
                chainData:docData.chainData,
                logoURI: docData.logoURI,
                extensions: docData.extensions,
                tags:docData.tags
            }
            nep141DbsResult.push(nep141DbToAdd);
        });
        this.nep141Dbs = nep141DbsResult;
        return this.nep141Dbs;
    }

    private async populateNetworkDbsAsync():Promise<NetworkDb[]>{
        console.log("POPULATING Networks from db");
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
            // UPDATE TO ADD NONSUPPORTED AS WELL?
            if(docData.isSupported){
                let NetworkDbToAdd:NetworkDb = {
                    fullName: docData.fullName,
                    networkFamilyName: docData.networkFamilyName,
                    ticker: docData.ticker,
                    chainId: docData.chainId,
                    chainIdEVM: docData.chainIdEVM,
                    hexColor: docData.hexColor,
                    decimals: docData.decimals?docData.decimals:6,
                    about: docData.about,
                    blockExplorerURL: docData.blockExplorerURL,
                    dateCreated: docData.dateCreated,
                    iconPath: docData.iconPath,
                    whitePaperPath: docData.whitePaperPath,
                    isSupported: docData.isSupported,
                    provider: providerFromDb,
                    coingeckoId: docData.coingeckoId,
                    isTestnet: docData.isTestnet?docData.isTestnet:false
                }
                NetworkDbsResult.push(NetworkDbToAdd);
            }
        });
        this.NetworkDbs = NetworkDbsResult;
        return NetworkDbsResult;
    }

    getSupportedNetworkDbs():NetworkDb[]{
        return this.NetworkDbs;
        // UNCOMMENT CODE BELOW TO HANDLE UNSUPPORTED NETWORKS;
        // let NetworkDbsResult:NetworkDb[] = [];
        // for(const NetworkDb of this.NetworkDbs){
        //     // filter results based on searchquery
        //     if(NetworkDb.isSupported){
        //         // build NetworkDb object from doc result     
        //         NetworkDbsResult.push(NetworkDb);
        //     }
        // }
        // return NetworkDbsResult;
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

    //TODO: change to simple dictionary lookup
    getNetworkDbByTicker(ticker:string):NetworkDb|null{
        for(const nw of this.NetworkDbs){
            if(nw.ticker == ticker) return nw;
        }
        return null;
    }

    // GET BALANCE FOR A SINGLE NETWORK
    getBalanceNetwork = async(params:NetworkBalanceParameters):Promise<IBalance|null> =>{
       let priceUSD = await getPriceOfTicker(params.networkDb.coingeckoId);
       let balanceNetwork:number;
       let network:Network = networkFromNetworkDb(params.networkDb);
       let kryptikProvider:KryptikProvider = await this.getKryptikProviderForNetworkDb(params.networkDb);
       console.log(`Getting network balance for ${network.fullName}`);
       console.log(`Address: ${params.accountAddress}`);
       // get balance in layer 1 token amount
       switch(network.networkFamily){
            case(NetworkFamily.EVM):{
                if(!kryptikProvider.ethProvider) return null;
                let ethNetworkProvider:JsonRpcProvider = kryptikProvider.ethProvider;
                balanceNetwork = Number(utils.formatEther(await ethNetworkProvider.getBalance(params.accountAddress)));
                break;
            }
            case(NetworkFamily.Solana):{
                // gets pub key for solana network
                let solPubKey:PublicKey = createEd25519PubKey(params.accountAddress);
                // ensures provider is set
                if(!kryptikProvider.solProvider) throw(new Error("No near provider is set up."))
                let solNetworkProvider:Connection = kryptikProvider.solProvider;
                balanceNetwork = lamportsToSol(await solNetworkProvider.getBalance(solPubKey));
                break;
            }
            case(NetworkFamily.Near):{
                // ensures provider is set
                if(!kryptikProvider.nearProvider) throw(new Error("No solana provider is set up."))
                let nearNetworkProvider:Near = kryptikProvider.nearProvider;
                // create account with implicit address
                try{
                    let nearAccount = await nearNetworkProvider.account(params.accountAddress);
                    let nearBalanceObject:NearAccountBalance = await nearAccount.getAccountBalance();
                    balanceNetwork = divByDecimals(Number(nearBalanceObject.total), params.networkDb.decimals).asNumber;
                }
                catch(e){
                    balanceNetwork = 0;
                }
                break;
            }
            default:{
                return null;
            }
       }
       // prettify balance
       let networkBalanceAdjusted:Number = roundCryptoAmount(balanceNetwork);
       let networkBalanceString = networkBalanceAdjusted.toString();
       let amountUSD = roundUsdAmount((priceUSD * balanceNetwork));
       // HANDLE ICONS FOR LAYER TWO NETWORKS
       let iconMain = params.networkDb.iconPath;
       let iconSecondary = undefined;
       // UPDATE IF SO any second layer maps with main layer
       if(params.networkDb.ticker == "eth(arbitrum)"){
           iconMain = defaultNetworkDb.iconPath
           iconSecondary = params.networkDb.iconPath;
       }
       // create new balance obj for balance data
       let newBalanceObj:IBalance = {fullName:params.networkDb.fullName, ticker:params.networkDb.ticker, iconPath:iconMain, 
           iconPathSecondary:iconSecondary, amountCrypto:networkBalanceString, 
           amountUSD:amountUSD.toString(), coinGeckoId:params.networkDb.coingeckoId, baseNetworkTicker:network.ticker};

        return newBalanceObj;
    }


    // TODO: Update to support tx. based networks
    getBalanceAllNetworks = async(walletUser:IWallet, user?:UserDB, onFetch?:(balance:IBalance|null)=>void):Promise<IBalance[]> =>{
        let networksFromDb = this.getSupportedNetworkDbs();
        // initialize return array
        let balances:IBalance[] = [];
        for(const nw of networksFromDb){
            // only show testnets to advanced users
            if(nw.isTestnet && user && !user.isAdvanced){
                if(onFetch){
                    onFetch(null);
                }
                continue;
            }
            // gets all addresses for network
            let accountAddress:string = await this.getAddressForNetworkDb(walletUser, nw);
            let NetworkBalanceParams:NetworkBalanceParameters = {
                accountAddress: accountAddress,
                networkDb: nw
            }
            try{
                let networkBalance:IBalance|null = await this.getBalanceNetwork(NetworkBalanceParams);
                // push balance obj to balance data array
                if(networkBalance) balances.push(networkBalance);
                if(onFetch){
                    onFetch(networkBalance);
                }
            }
            catch(e){
                if(onFetch){
                    onFetch(null);
                }
                console.warn(`Unable to fetch network balance for ${nw.fullName}`);
            }
            
        }
        return balances;
    }

    // gets balance for a single erc20 token
    async getBalanceErc20Token(params:TokenBalanceParameters):Promise<IBalance>{
        if(!params.erc20Params) throw(new Error("Error: Contract must be provided to fetch erc20 token balance."))
        // fetch price
        let priceUSD = await getPriceOfTicker(params.tokenDb.coingeckoId);
        // fetch balance
        console.log(`getting ${params.tokenDb.name} balance for ${params.accountAddress}`);
        let networkBalance:number = Number(utils.formatEther(await params.erc20Params.erc20Contract.balanceOf(params.accountAddress)));
        // prettify token balance
        let networkBalanceAdjusted:Number = roundCryptoAmount(networkBalance);
        let networkBalanceString = networkBalanceAdjusted.toString();
        let amountUSD = roundUsdAmount((priceUSD * networkBalance));
        // create new object for balance data
        let newBalanceObj:IBalance = {fullName:params.tokenDb.name, ticker:params.tokenDb.symbol, iconPath:params.tokenDb.logoURI,
        iconPathSecondary: params.networkDb.iconPath, amountCrypto:networkBalanceString, amountUSD:amountUSD.toString(), 
        coinGeckoId:params.networkDb.coingeckoId, baseNetworkTicker:params.networkDb.ticker}
        return newBalanceObj;
    }

    async getBalanceNep141Token(params:TokenBalanceParameters):Promise<IBalance>{
        if(!params.nep141Params) throw(new Error("Error: Contract must be provided to fetch erc20 token balance."))
        let kryptikProvider = await this.getKryptikProviderForNetworkDb(params.networkDb);
        if(!kryptikProvider.nearProvider) throw(new Error(`Error: no provider specified for ${params.networkDb.fullName}`));
        let nearNetworkProvider:Near = kryptikProvider.nearProvider;
        // fetch price
        let priceUSD = await getPriceOfTicker(params.tokenDb.coingeckoId);
        // fetch balance
        console.log(`getting ${params.tokenDb.name} balance for ${params.accountAddress}`);
        let networkBalance:number;
        try{
            let nearAccount = await nearNetworkProvider.account(params.accountAddress);
            // call token contract balance method
            let response = await nearAccount.viewFunction(params.nep141Params.tokenAddress, "ft_balance_of", 
            {account_id:params.accountAddress});
            networkBalance = divByDecimals(Number(response), params.tokenDb.decimals).asNumber;
        }
        catch(e){
            networkBalance = 0;
        }
        // prettify token balance
        let networkBalanceAdjusted:Number = roundCryptoAmount(networkBalance);
        let networkBalanceString = networkBalanceAdjusted.toString();
        let amountUSD = roundUsdAmount((priceUSD * networkBalance));
        // create new object for balance data
        let newBalanceObj:IBalance = {fullName:params.tokenDb.name, ticker:params.tokenDb.symbol, iconPath:params.tokenDb.logoURI,
        iconPathSecondary: params.networkDb.iconPath, amountCrypto:networkBalanceString, amountUSD:amountUSD.toString(), 
        coinGeckoId:params.networkDb.coingeckoId, baseNetworkTicker:params.networkDb.ticker}
        return newBalanceObj;
    }

    async getBalanceSplToken(params:TokenBalanceParameters):Promise<IBalance>{
        if(!params.splParams) throw(new Error(`Error: spl balance parameters not provided.`));
        let kryptikProvider = await this.getKryptikProviderForNetworkDb(params.networkDb);
        if(!kryptikProvider.solProvider) throw(new Error(`Error: no provider specified for ${params.networkDb.fullName}`));
        // fetch price
        let priceUSD = await getPriceOfTicker(params.tokenDb.coingeckoId);
        // fetch balance
        // UPDATE TO SUPPORT ARRAY OF CHAIN DATA
        let tokenAccount = await createSolTokenAccount(params.accountAddress, params.splParams.tokenAddress);
        let tokenBalance:number;
        // if no token account exists, value should be 0
        try{
            let repsonse:RpcResponseAndContext<TokenAmount> = await kryptikProvider.solProvider.getTokenAccountBalance(tokenAccount);
            tokenBalance =  divByDecimals(Number(repsonse.value.amount), repsonse.value.decimals).asNumber; 
        }
        catch(e){
            tokenBalance = 0;
        }
        // prettify token balance
        let networkBalanceAdjusted:Number = roundCryptoAmount(tokenBalance);
        let networkBalanceString = networkBalanceAdjusted.toString();
        let amountUSD = roundUsdAmount((priceUSD * tokenBalance));
        // create new object for balance data
        let newBalanceObj:IBalance = {fullName:params.tokenDb.name, ticker:params.tokenDb.symbol, iconPath:params.tokenDb.logoURI,
        iconPathSecondary: params.networkDb.iconPath, amountCrypto:networkBalanceString, amountUSD:amountUSD.toString(), 
        coinGeckoId:params.networkDb.coingeckoId, baseNetworkTicker:params.networkDb.ticker}
        return newBalanceObj;
    }

    // get balances for all erc20 networks
    async getBalanceAllERC20Tokens(walletUser:IWallet, onFetch?:(balance:IBalance|null)=>void){
        let erc20balances:IBalance[] = [];
        for(const erc20Db of this.erc20Dbs){
            for(const chainInfo of erc20Db.chainData){
                // get ethereum network db
                let networkDb:NetworkDb|null = this.getNetworkDbByTicker(chainInfo.ticker);
                if(!networkDb){
                    if(onFetch){
                        onFetch(null);
                    }
                    continue;
                }
                // hdseedloop compatible network
                let erc20ContractParams:CreateEVMContractParameters= {
                    wallet: walletUser,
                    networkDb: networkDb,
                    erc20Db: erc20Db
                }
                let erc20Contract = await this.createERC20Contract(erc20ContractParams);
                if(!erc20Contract)
                {
                    if(onFetch){
                        onFetch(null);
                    }
                    continue;
                }
                let accountAddress = await this.getAddressForNetworkDb(walletUser, networkDb);
                let erc20Params:ERC20Params = {
                    erc20Contract: erc20Contract
                };
                // get balance for contract
                let tokenParams:TokenBalanceParameters = {
                    erc20Params: erc20Params,
                    tokenDb: erc20Db,
                    accountAddress: accountAddress,
                    networkDb: networkDb
                }
                let tokenBalance:IBalance = await this.getBalanceErc20Token(tokenParams)
                if(onFetch){
                    onFetch(tokenBalance);
                }
                // push balance data to balance array
                erc20balances.push(tokenBalance);
            }
        }
        return erc20balances;
    }

     // get balances for allNep141 tokens
     async getBalanceAllNep141Tokens(walletUser:IWallet, onFetch?:(balance:IBalance|null)=>void){
        console.log("getting nep141 balances");
        let nep141Balances:IBalance[] = [];
        for(const nep141Db of this.nep141Dbs){          
            for(const chainInfo of nep141Db.chainData){  
                console.log(`GETTING Nep141 balance FOR ${chainInfo.ticker}`);
                let networkDb:NetworkDb|null = this.getNetworkDbByTicker(chainInfo.ticker);
                if(!networkDb)
                {
                    if(onFetch){
                        onFetch(null);
                    }
                    continue;
                }
                let accountAddress = await this.getAddressForNetworkDb(walletUser, networkDb);
                // get balance for contract
                let nep141Params:Nep141Params = {tokenAddress:chainInfo.address};
                let tokenParams:TokenBalanceParameters = {
                    tokenDb: nep141Db,
                    nep141Params: nep141Params,
                    accountAddress: accountAddress,
                    networkDb: networkDb
                }
                try{
                    let tokenBalance:IBalance = await this.getBalanceNep141Token(tokenParams);
                    // push balance data to balance array
                    nep141Balances.push(tokenBalance);
                    if(onFetch){
                        onFetch(tokenBalance);
                    }
                }
                catch(e){
                    if(onFetch){
                        onFetch(null);
                    }
                    console.warn(`Unable to fetch balance for ${nep141Db.name} on ${networkDb.fullName}.`)
                }
            }
        }
        return nep141Balances;
    }

    // get balances for all spl tokens
    async getBalanceAllSplTokens(walletUser:IWallet, onFetch?:(balance:IBalance|null)=>void){
        let splBalances:IBalance[] = [];
        for(const splDb of this.splDbs){          
            for(const chainInfo of splDb.chainData){  
                console.log(`GETTING SPL balance FOR ${chainInfo.ticker}`);
                let networkDb:NetworkDb|null = this.getNetworkDbByTicker(chainInfo.ticker);
                if(!networkDb)
                {
                    if(onFetch){
                        onFetch(null);
                    }
                    continue;
                }
                let accountAddress = await this.getAddressForNetworkDb(walletUser, networkDb);
                // get balance for contract
                let splParams:SplParams = {tokenAddress:chainInfo.address};
                let tokenParams:TokenBalanceParameters = {
                    tokenDb: splDb,
                    splParams: splParams,
                    accountAddress: accountAddress,
                    networkDb: networkDb
                }
                try{
                    let tokenBalance:IBalance = await this.getBalanceSplToken(tokenParams);
                    // push balance data to balance array
                    splBalances.push(tokenBalance);
                    if(onFetch){
                        onFetch(tokenBalance);
                    }
                }
                catch(e){
                    console.warn(`Unable to fetch balance for ${splDb.name} on ${networkDb.fullName}.`)
                    if(onFetch){
                        onFetch(null);
                    }
                }
            }
        }
        return splBalances;
    }

    getTransactionFeeData = async(params:FeeDataParameters):Promise<TransactionFeeData|null> => {
        let network:Network =  networkFromNetworkDb(params.networkDb);
        let tokenPriceUsd:number = await getPriceOfTicker(params.networkDb.coingeckoId);
        switch(network.networkFamily){
            case (NetworkFamily.EVM): { 
                let transactionFeeData:TransactionFeeData = await this.getTransactionFeeData1559Compatible({network:params.networkDb, tokenPriceUsd: tokenPriceUsd, tokenData: params.tokenData, amountToken:params.amountToken});
                return transactionFeeData;
                break; 
             } 
             case(NetworkFamily.Solana):{
                if(!params.solTransaction) return null;
                let transactionFeeData:TransactionFeeData = await this.getTransactionFeeDataSolana({tokenPriceUsd:tokenPriceUsd, transaction:params.solTransaction, networkDb:params.networkDb});
                return transactionFeeData;
                break;
             }
             case(NetworkFamily.Near):{
                let transactionFeeData:TransactionFeeData = await this.getTransactionFeeDataNear({tokenPriceUsd:tokenPriceUsd, txType:params.txType, networkDb:params.networkDb});
                return transactionFeeData;
                break;
             }
             default: { 
                return null;
                break; 
             } 
        }
    }

    getTransactionFeeDataNear = async(params:FeeDataNearParameters)=>{
        let kryptikProvider:KryptikProvider;
        kryptikProvider = await this.getKryptikProviderForNetworkDb(params.networkDb);
        // validate provider
        if(!kryptikProvider.nearProvider){
            throw(new Error(`Error: No provider specified for ${kryptikProvider.network.fullName}`));
        }
        console.log(params);
        let nearProvider:Near = kryptikProvider.nearProvider;
        let block:BlockResult = await nearProvider.connection.provider.block({ finality: 'final' });
        // NEAR gas is calculated in TGAS
        // 1 TGAS = 10^12
        let gasUsed:number = multByDecimals(1, 12).asNumber
        // hardcoded gas amounts are based on protocol paramters
        // more info. on NEAR gas here: https://docs.near.org/docs/concepts/gas#thinking-in-gas
        switch(params.txType){
            case(TxType.TransferNative):{
                gasUsed = 1*gasUsed;
                break;
            }
            case(TxType.TransferToken):{
                gasUsed = 14*gasUsed;
                break;
            }
            default:{
                // UPDATE DEFAULT... should it be avg. gas required?
                gasUsed = 10*gasUsed;
                break;
            }
        }
        // fetch latest gas price
        let gasPrice:number = Number((await nearProvider.connection.provider.gasPrice(block.header.hash)).gas_price);
        console.log(gasPrice);
        // convert gas to near amount
        let feeInNear:number = divByDecimals((Number(gasPrice)*gasUsed), params.networkDb.decimals).asNumber; 
        let feeInUsd:number = params.tokenPriceUsd*feeInNear;
        let transactionFeeData:TransactionFeeData = {
            network: kryptikProvider.network,
            isFresh: true,
            lowerBoundCrypto: feeInNear,
            lowerBoundUSD: feeInUsd,
            upperBoundCrypto: feeInNear,
            upperBoundUSD: feeInUsd,
            EVMGas: defaultEVMGas
        };
        return transactionFeeData;
    }

    // fetch tx. fee on the solana blockchain
    getTransactionFeeDataSolana = async(params:FeeDataSolParameters):Promise<TransactionFeeData> =>{
        let kryptikProvider:KryptikProvider;
        kryptikProvider = await this.getKryptikProviderForNetworkDb(params.networkDb);
        // validate provider
        if(!kryptikProvider.solProvider){
            throw(new Error(`Error: No provider specified for ${kryptikProvider.network.fullName}`));
        }
        let solNetworkProvider:Connection = kryptikProvider.solProvider;
        const feeData = await solNetworkProvider.getFeeForMessage(
            params.transaction.compileMessage(),
            'confirmed',
        );
        let feeInSol:number = lamportsToSol(feeData.value);
        let feeInUsd:number = params.tokenPriceUsd*feeInSol;
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

    // estimate tx. fee for EIP 1559 compatible networks
    getTransactionFeeData1559Compatible = async(params:FeeDataEvmParameters):Promise<TransactionFeeData> =>{
        let kryptikProvider:KryptikProvider;
        kryptikProvider = await this.getKryptikProviderForNetworkDb(params.network);
        // validate provider
        if(!kryptikProvider.ethProvider){
            throw(new Error(`No provider specified for ${kryptikProvider.network.fullName}`));
        }
        let ethNetworkProvider:JsonRpcProvider = kryptikProvider.ethProvider;
        let feeData = await ethNetworkProvider.getFeeData();
        // FIX ASAP
        // ARTIFICIALLY INFLATING ARBITRUM BASE GAS LIMIT, BECAUSE OG VALUE IS TOO SMALL
        let gasLimit:number = isNetworkArbitrum(params.network)?500000:21000;
        if(params.tokenData && params.tokenData.tokenParamsEVM){
            let amount = roundToDecimals(Number(params.amountToken), params.tokenData.tokenDb.decimals);
            // get gaslimit for nonzero amount
            if(amount == 0) amount = 2;
            // get estimated gas limit for token transfer
            gasLimit = Number(await params.tokenData.tokenParamsEVM.tokenContractConnected.estimateGas.transfer(placeHolderEVMAddress, amount));
            console.log("Token gas limit:")
            console.log(gasLimit);
        }
        // validate fee data response
        if(!feeData.maxFeePerGas || !feeData.maxPriorityFeePerGas || !feeData.gasPrice){
            // arbitrum uses pre EIP-1559 fee structure
            if(isNetworkArbitrum(params.network)){
                let baseGas = await ethNetworkProvider.getGasPrice();
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
        let lowerBoundUSD:number = lowerBoundCrypto*params.tokenPriceUsd;
        let upperBoundCrypto:number = gasLimit*(maxFeePerGas+maxTipPerGas);
        let upperBoundUsd:number = upperBoundCrypto*params.tokenPriceUsd;
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
    

    // creates and returns a connected erc20 contract 
    createERC20Contract = async(params:CreateEVMContractParameters):Promise<Contract|null> =>{
        // hdseedloop compatible network
        let network = networkFromNetworkDb(params.networkDb);
        let provider = await this.getKryptikProviderForNetworkDb(params.networkDb);
        if(!provider.ethProvider) return null;
        let ethProvider:JsonRpcProvider = provider.ethProvider;
        let accountAddress:string = await this.getAddressForNetworkDb(params.wallet, params.networkDb);
        // connect provider and signer and attach to contract
        let walletKryptik:WalletKryptik|null = params.wallet.seedLoop.getWalletForAddress(network, accountAddress);
        if(!walletKryptik) return null;;
        let ProviderAndSigner = walletKryptik.connect(ethProvider)
        let erc20ChainData:ChainData|null = getChainDataForNetwork(params.networkDb, params.erc20Db);
        if(!erc20ChainData) return null;
        let erc20Contract = new Contract(erc20ChainData.address, erc20Abi);
        let contractConnected = erc20Contract.connect(ProviderAndSigner);
        return contractConnected;
    }

    // returns blockchain address for a given networkdb
    getAddressForNetworkDb = async(wallet:IWallet, networkDb:NetworkDb):Promise<string>=>{
        let network = networkFromNetworkDb(networkDb);
        // gets all addresses for network
        let allAddys:string[] = await wallet.seedLoop.getAddresses(network);
        // gets first address for network
        let firstAddy:string = allAddys[0];
        return firstAddy;
    }


    getTokenAndNetworkFromTickers(networkTicker:string, tokenTicker?:string):TokenAndNetwork{
        let tokenAndNetwork:TokenAndNetwork = defaultTokenAndNetwork;
        let networkDb:NetworkDb|null = this.getNetworkDbByTicker(networkTicker);
        // UPDATE TO THROW ERROR OR RETURN NULL?
        if(!networkDb) return tokenAndNetwork;
        tokenAndNetwork.baseNetworkDb = networkDb;
        // no token... just return obj with base network
        if(!tokenTicker) return tokenAndNetwork;
        let networkFamily = NetworkFamilyFromFamilyName(networkDb.networkFamilyName);
        let tokenDb:TokenDb|null = null;
        switch(networkFamily){
            case(NetworkFamily.EVM):{
                tokenDb = searchTokenListByTicker(this.erc20Dbs, tokenTicker);
                break;
            }
            case(NetworkFamily.Near):{
                tokenDb = searchTokenListByTicker(this.nep141Dbs, tokenTicker);
                break;
            }
            case(NetworkFamily.Solana):{
                tokenDb = searchTokenListByTicker(this.splDbs, tokenTicker);
                break;
            }
            default:{
                tokenDb = null;
            }
        }
        // set token data if it exists
        if(tokenDb){
            tokenAndNetwork.tokenData = {
                tokenDb: tokenDb
            }
        }
        return tokenAndNetwork;
    }
        
}


export default Web3Service;