import {firestore} from "../helpers/firebaseHelper"
import { collection, getDocs, query } from "firebase/firestore";
import { ServiceState } from './types';
import BaseService from './BaseService';
import {defaultNetworkDb, defaultTokenAndNetwork, NetworkBalanceParameters, NetworkDb} from './models/network'
import {
    JsonRpcProvider,
    StaticJsonRpcProvider,
} from '@ethersproject/providers';
import { Contract, utils } from "ethers";
import { Connection, PublicKey, RpcResponseAndContext, TokenAmount } from "@solana/web3.js";
import { Near } from "near-api-js";
import { AccountBalance as NearAccountBalance } from "near-api-js/lib/account";

import {Network, NetworkFamily, NetworkFamilyFromFamilyName, WalletKryptik } from "hdseedloop";
import { CreateEVMContractParameters, ChainData, TokenDb, TokenAndNetwork, ERC20Params, Nep141Params, SplParams, TokenBalanceParameters, TokenParamsEVM } from "./models/token";
import {erc20Abi} from "../abis/erc20Abi";
import { KryptikProvider } from "./models/provider";
import { createEd25519PubKey, createSolTokenAccount, getAddressForNetworkDb } from "../helpers/utils/accountUtils";
import { networkFromNetworkDb, getChainDataForNetwork, formatTicker } from "../helpers/utils/networkUtils";
import { IWallet } from "../models/KryptikWallet";
import { searchTokenListByTicker } from "../handlers/search/token";
import { IWeb3Service } from "./models/IWeb3Service";
import { getPriceOfTicker } from "../helpers/coinGeckoHelper";
import { lamportsToSol, divByDecimals, roundCryptoAmount, roundUsdAmount } from "../helpers/utils/numberUtils";
import { buildEmptyBalance, IBalance } from "./models/IBalance";
import { KryptikBalanceHolder} from "./models/KryptikBalanceHolder";
import { covalentDataToBalance, covalentSupportedChainIds } from "../helpers/balances";
import { CovalentAddressBalanceResponseData, fetchServerBalances } from "../requests/covalent";
import { ETH_CONTRACT_ADDRESS } from "../constants/evmConstants";
import { NATIVE_SOL_MINT, SOL_COVALENT_CHAINID } from "../constants/solConstants";



const NetworkDbsRef = collection(firestore, "networks");
const ERC20DbRef = collection(firestore, "erc20tokens");
const SplDbRef = collection(firestore, "spltokens");
const Nep141Ref = collection(firestore, "nep141tokens")
const ALLTOKENSRef = collection(firestore, "tokens");



export interface IConnectWalletReturn{
    wallet:IWallet,
    remoteShare:string
}

class Web3Service extends BaseService implements IWeb3Service{
    getProviderForNetwork(nw: NetworkDb):KryptikProvider {
        return(this.networkProviders[nw.ticker]);
    }
    public NetworkDbs:NetworkDb[] = [];
    public TickerToNetworkDbs:{[ticker:string]:NetworkDb} = {}
    public tokenDbs:TokenDb[] = [];
    // NetworkDb is referenced by its BIP44 chain id
    public rpcEndpoints: { [ticker:string]: string } = {};
    public web3Provider: StaticJsonRpcProvider = (null as unknown) as StaticJsonRpcProvider;
    //providers for each network
    public networkProviders: { [ticker:string]: KryptikProvider } = {};
    // kryptik balances cache
    public kryptikBalances:KryptikBalanceHolder|null = null;
   
    constructor() {
        super();
    }



    async InternalStartService(){
        // fetch network data
        try{
            await this.populateNetworkDbsAsync();
        }
        catch{
            throw(Error("Error: Unable to populate NetworkDbs when starting web3 service."))
        }
        // fetch token data
        try{
            await this.populateTokenDbsAsync();
        }
        catch{
            throw(new Error("Error: Unable to populate TokenDb array from database when starting web3 service."));
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
        // TODO: ADD NON-BREAKING ERROR HANDLER
        if(!networkDb) throw(new Error("Error: Unable to find service networkdb by ticker."))
        let newKryptikProvider = new KryptikProvider(rpcEndpoint, networkDb);
        this.networkProviders[ticker] = newKryptikProvider;
        return newKryptikProvider;
    }

    private async populateTokenDbsAsync():Promise<TokenDb[]>{
        console.log("Populating erc20 data from db");
        const q = query(ALLTOKENSRef);
        const querySnapshot = await getDocs(q);
        let tokenDbsResult:TokenDb[] = [];
        querySnapshot.forEach((doc) => {
            let docData = doc.data();
            let tokenDbToAdd:TokenDb = {
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
            tokenDbsResult.push(tokenDbToAdd);
        });
        this.tokenDbs = tokenDbsResult;
        return this.tokenDbs;
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
                    hexColor: docData.hexColor,
                    decimals: docData.decimals?docData.decimals:6,
                    evmData: docData.evmData?docData.evmData:undefined,
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
                this.TickerToNetworkDbs[NetworkDbToAdd.ticker] = NetworkDbToAdd;
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
        let networkDbRes:NetworkDb = this.TickerToNetworkDbs[ticker];
        if(networkDbRes) return networkDbRes;
        return null;
    }


    // creates and returns a connected erc20 contract 
    createERC20Contract = async(params:CreateEVMContractParameters):Promise<Contract|null> =>{
        // hdseedloop compatible network
        let network = networkFromNetworkDb(params.networkDb);
        let provider = await this.getKryptikProviderForNetworkDb(params.networkDb);
        if(!provider.ethProvider) return null;
        let ethProvider:JsonRpcProvider = provider.ethProvider;
        let accountAddress:string = await getAddressForNetworkDb(params.wallet, params.networkDb);
        // connect provider and signer and attach to contract
        let walletKryptik:WalletKryptik|null = params.wallet.seedLoop.getWalletForAddress(network, accountAddress);
        if(!walletKryptik) return null;;
        let ProviderAndSigner = walletKryptik.connect(ethProvider)
        let erc20ChainData:ChainData|null = getChainDataForNetwork(params.networkDb, params.erc20Db);
        if(!erc20ChainData) return null;
        console.log("contract chain data:");
        console.log(erc20ChainData);
        let erc20Contract = new Contract(erc20ChainData.address, erc20Abi);
        let contractConnected = erc20Contract.connect(ProviderAndSigner);
        return contractConnected;
    }

    // TODO: UPDATE TO FILTER ON FAMILY
    getTokenAndNetworkFromTickers(networkTicker:string, tokenTicker?:string):TokenAndNetwork{
        let networkDb:NetworkDb|null = this.getNetworkDbByTicker(networkTicker);
        // UPDATE TO THROW ERROR OR RETURN NULL?
        if(!networkDb) return defaultTokenAndNetwork;
        // no token... just return obj with base network
        if(!tokenTicker) return {baseNetworkDb:networkDb};
        let networkFamily = NetworkFamilyFromFamilyName(networkDb.networkFamilyName);
        let tokenDb:TokenDb|null = null;
        switch(networkFamily){
            case(NetworkFamily.EVM):{
                tokenDb = searchTokenListByTicker(this.tokenDbs, tokenTicker);
                break;
            }
            case(NetworkFamily.Near):{
                tokenDb = searchTokenListByTicker(this.tokenDbs, tokenTicker);
                break;
            }
            case(NetworkFamily.Solana):{
                tokenDb = searchTokenListByTicker(this.tokenDbs, tokenTicker);
                break;
            }
            default:{
                tokenDb = null;
            }
        }
        // set token data if it exists
        if(tokenDb){
            return {baseNetworkDb:networkDb, tokenData:{tokenDb:tokenDb}}
        }
        return {baseNetworkDb:networkDb};
    }


    // GET BALANCE FOR A SINGLE NETWORK
    async getBalanceNetwork(params:NetworkBalanceParameters):Promise<TokenAndNetwork|null>{
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
        let networkBalanceString = balanceNetwork.toString();
        let amountUSD = priceUSD * balanceNetwork;
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
            amountUSD:amountUSD.toString(), baseNetworkTicker:network.ticker};

        return {baseNetworkDb:params.networkDb, networkBalance:newBalanceObj}
    }

    // gets balances for all supported networks and tokens
    async getAllBalances(params:{walletUser:IWallet, isAdvanced?:boolean, onFetch?:(balance:IBalance|null)=>void, tryCached?:boolean, useCovalent?:boolean}):Promise<KryptikBalanceHolder>{
        const{walletUser, isAdvanced, onFetch, tryCached, useCovalent} = {...params};
        // default try cached value is true
        const getCached = tryCached?tryCached:true;
        // default use covalent is true
        const getCovalentBals = useCovalent?useCovalent:true;
        // use cached balances if fresh
        if(this.kryptikBalances){
            console.log("kryptik balance holder id:");
            console.log(this.kryptikBalances.id)
            console.log("is fresh:");
            console.log(this.kryptikBalances.isFresh());
            console.log(this.kryptikBalances.getLastUpdateTimestamp());
        }
        if(getCached && this.kryptikBalances && this.kryptikBalances.isFresh()){
            return this.kryptikBalances;
        }
        let masterBalances:TokenAndNetwork[] = [];
        // get indexed balances... currently fetching from covalent
        let indexedNetworksList:NetworkDb[] = []
        if(getCovalentBals){
            console.log("getting indexed blockchain data START");
            let indexedData = await this.getAllIndexedBalances(walletUser);
            indexedNetworksList = indexedData.indexedNetworks;
            masterBalances = masterBalances.concat(indexedData.tokensAndBals);
        }
        // get remaining balances manually via rpc provider
        let tickerToNetworkBalance:{ [ticker: string]: IBalance } = {};
        // fetch balances by sector
        let networkBalances = await this.getBalanceAllNetworks({walletUser:walletUser, indexedNetworks:indexedNetworksList, isAdvanced:isAdvanced?isAdvanced:false, onFetch:onFetch});
        // create dictionary of network balances 
        for(const tokenAndNetwork of networkBalances){
            if(tokenAndNetwork.networkBalance){
                tickerToNetworkBalance[tokenAndNetwork.baseNetworkDb.ticker] = tokenAndNetwork.networkBalance;
            }
        }
        let erc20Balances = await this.getBalanceAllERC20Tokens({walletUser:walletUser, indexedNetworks:indexedNetworksList, onFetch:onFetch});
        let nep141Balances = await this.getBalanceAllNep141Tokens({walletUser:walletUser, indexedNetworks:indexedNetworksList, onFetch:onFetch});
        let splBalances = await this.getBalanceAllSplTokens({walletUser:walletUser, indexedNetworks:indexedNetworksList, onFetch:onFetch});
        // add base network balance to token and network objects... in place
        // TODO: update, so we don't take a second pass over balances
        this.addBaseBalance(tickerToNetworkBalance, erc20Balances);
        this.addBaseBalance(tickerToNetworkBalance, erc20Balances);
        this.addBaseBalance(tickerToNetworkBalance, erc20Balances);
        // add to master balance list
        masterBalances = masterBalances.concat(networkBalances);
        masterBalances = masterBalances.concat(erc20Balances);
        masterBalances = masterBalances.concat(nep141Balances);
        masterBalances = masterBalances.concat(splBalances);
        // return kryptik balances holder
        if(this.kryptikBalances){
            this.kryptikBalances.updateBalances(masterBalances);
            return this.kryptikBalances;
        }
        else{
            // init new kryptik balance holder
            let newBalanceHolder:KryptikBalanceHolder = new KryptikBalanceHolder({tokenAndBalances:masterBalances});
            // add new balance holder to service state
            this.kryptikBalances = newBalanceHolder;
            return newBalanceHolder;
        }
    }

    // TODO: ADD ROUTER IF WE HAVE DIFFERENT INDEXER METHODS FOR DIFFERENT NETWORKS
    // gets assets for all indexed chains
    private getAllIndexedBalances = async(walletUser:IWallet):Promise<{indexedNetworks:NetworkDb[], tokensAndBals:TokenAndNetwork[]}>=>{
        const ethNetwork = this.getNetworkDbByTicker("eth");
        const solNetwork = this.getNetworkDbByTicker("sol");
        const avaxcNetwork = this.getNetworkDbByTicker("avaxc");
        const arbitrumNetwork = this.getNetworkDbByTicker("eth(arbitrum)");
        let indexedNetworks:NetworkDb[] = []
        const addyToNetworks:{[address:string]:NetworkDb[]} = {};
        if(ethNetwork && solNetwork && arbitrumNetwork && avaxcNetwork){
            indexedNetworks = [ethNetwork, solNetwork, arbitrumNetwork, avaxcNetwork];
            let solAddress = await getAddressForNetworkDb(walletUser, solNetwork);
            let ethAddress = await getAddressForNetworkDb(walletUser, ethNetwork);
            addyToNetworks[ethAddress] = [ethNetwork, arbitrumNetwork, avaxcNetwork];
            addyToNetworks[solAddress] = [solNetwork];
        }
        // init covalent balance data
        let covalentBalances:CovalentAddressBalanceResponseData|null = null;
        let balancesToReturn:TokenAndNetwork[] = [];
        // request and format covalent balances for each chain
        // TODO: REDUCE THE COMPLEXITY (performance and readability) OF THE CODE BELOW
        for(const addy in addyToNetworks){
            let networkDbs:NetworkDb[] = addyToNetworks[addy];
            // nested for loop with the ASSUMPTION THAT INNERLOOP WILL HAVE <10 ITERATIONS
            // get indexed balances for each network
            for(const networkDb of networkDbs){

                let networkChainId:number = networkDb.evmData?networkDb.evmData.chainId:networkDb.chainId;
                // solana covalent chain id is different
                if(NetworkFamilyFromFamilyName(networkDb.networkFamilyName) == NetworkFamily.Solana){
                    networkChainId = SOL_COVALENT_CHAINID
                }
                
                if(!covalentSupportedChainIds.includes(networkChainId)) continue;
                // try to get indexed balances for network
                    try{
                        covalentBalances = await fetchServerBalances(networkChainId, addy, "usd");
                        if(covalentBalances){
                            let baseNetworkAndBalance:TokenAndNetwork = {baseNetworkDb:networkDb}
                            let tempTokenAndBalances:TokenAndNetwork[] = [];
                            for(const cBal of covalentBalances.items){
                                const newBal:IBalance = covalentDataToBalance(networkDb, cBal);
                                // check if balance corresponds to base network
                                if(!baseNetworkAndBalance && formatTicker(cBal.contract_ticker_symbol) == formatTicker(networkDb.ticker) || (cBal.contract_address == ETH_CONTRACT_ADDRESS) || (cBal.contract_address == NATIVE_SOL_MINT)){
                                    baseNetworkAndBalance = {baseNetworkDb:networkDb, networkBalance:newBal}
                                    tempTokenAndBalances.push(baseNetworkAndBalance);
                                }
                                // else... we have a regular token
                                else{
                                    // get kryptik token data, create token+bal object
                                    let tokenDb:TokenDb|null  = searchTokenListByTicker(this.tokenDbs, newBal.ticker);
                                    if(tokenDb){
                                        let newTokenAndBal:TokenAndNetwork = {baseNetworkDb:networkDb, tokenData:{tokenDb:tokenDb, tokenBalance:newBal}}
                                        tempTokenAndBalances.push(newTokenAndBal);
                                    }
                                }
                            }
                            // add base network balance to each token + balance
                            if(!baseNetworkAndBalance.networkBalance){
                                baseNetworkAndBalance.networkBalance = buildEmptyBalance(networkDb);
                                balancesToReturn.push(baseNetworkAndBalance)
                            }
                            for(const tokenAndBal of tempTokenAndBalances){
                                if(!baseNetworkAndBalance.networkBalance) break;
                                tokenAndBal.networkBalance = baseNetworkAndBalance.networkBalance;
                            }
                            balancesToReturn = balancesToReturn.concat(tempTokenAndBalances)
                        };
                    }
                    catch(e){
                        console.warn(`Error: Unable to get indexed balances for ${networkDb.fullName}`);
                    }
                    
               
                }
        }
        return {indexedNetworks:indexedNetworks, tokensAndBals:balancesToReturn};
    }

    // add base network balance
    addBaseBalance(tickerNetworkDict:{ [ticker: string]: IBalance }, bals:TokenAndNetwork[]){
        for(const tokenAndNetwork of bals){
            if(!tokenAndNetwork.networkBalance){
                let networkBalalance = tickerNetworkDict[tokenAndNetwork.baseNetworkDb.ticker];
                if(networkBalalance){
                    tokenAndNetwork.networkBalance = networkBalalance;
                }
            }
        }
    }


    // TODO: Update to support tx. based networks
    async getBalanceAllNetworks(params:{walletUser:IWallet, onFetch?:(balance:IBalance|null)=>void, isAdvanced:boolean, indexedNetworks:NetworkDb[]}):Promise<TokenAndNetwork[]>{
        const {walletUser, isAdvanced, indexedNetworks, onFetch} = {...params}
        let networksFromDb = this.getSupportedNetworkDbs();
        // initialize return array
        let balanceAndNetworks:TokenAndNetwork[] = [];
        for(const nw of networksFromDb){
            // only show testnets to advanced users
            if(nw.isTestnet && !isAdvanced){
                if(onFetch){
                    onFetch(null);
                }
                continue;
            }
            if(indexedNetworks.includes(nw)){
                continue;
            }
            // gets all addresses for network
            let accountAddress:string = await getAddressForNetworkDb(walletUser, nw);
            let NetworkBalanceParams:NetworkBalanceParameters = {
                accountAddress: accountAddress,
                networkDb: nw
            }
            try{
                let networkBalance:TokenAndNetwork|null = await this.getBalanceNetwork(NetworkBalanceParams);
                // push balance obj to balance data array
                if(networkBalance) balanceAndNetworks.push(networkBalance);
                if(onFetch){
                    onFetch(networkBalance?.networkBalance?networkBalance.networkBalance:null);
                }
            }
            catch(e){
                if(onFetch){
                    onFetch(null);
                }
                console.warn(`Unable to fetch network balance for ${nw.fullName}`);
            }
            
        }
        return balanceAndNetworks;
    }

    // gets balance for a single erc20 token
    async getBalanceErc20Token(params:TokenBalanceParameters):Promise<TokenAndNetwork>{
        if(!params.erc20Params) throw(new Error("Error: Contract must be provided to fetch erc20 token balance."))
        let evmParams:TokenParamsEVM = {
            contractAddress: params.erc20Params.erc20Contract.address
        }
        // fetch price
        let priceUSD = await getPriceOfTicker(params.tokenDb.coingeckoId);
        // fetch balance
        console.log(`getting ${params.tokenDb.name} ERC20 balance for ${params.accountAddress}`);
        let networkBalance:number = Number(utils.formatEther(await params.erc20Params.erc20Contract.balanceOf(params.accountAddress)));
        // prettify token balance
        let networkBalanceString = networkBalance.toString();
        let amountUSD = (priceUSD * networkBalance);
        // create new object for balance data
        let newBalanceObj:IBalance = {fullName:params.tokenDb.name, ticker:params.tokenDb.symbol, iconPath:params.tokenDb.logoURI,
        iconPathSecondary: params.networkDb.iconPath, amountCrypto:networkBalanceString, amountUSD:amountUSD.toString(), baseNetworkTicker:params.networkDb.ticker}
        let tokenAndNetwork:TokenAndNetwork = {baseNetworkDb:params.networkDb, tokenData:{tokenDb:params.tokenDb, tokenParamsEVM:evmParams, tokenBalance:newBalanceObj}};
        tokenAndNetwork;
        return tokenAndNetwork;
    }

    async getBalanceNep141Token(params:TokenBalanceParameters):Promise<TokenAndNetwork>{
        if(!params.nep141Params) throw(new Error("Error: Contract must be provided to fetch nep141 token balance."))
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
        let networkBalanceString = networkBalance.toString();
        let amountUSD = roundUsdAmount((priceUSD * networkBalance));
        // create new object for balance data
        let newBalanceObj:IBalance = {fullName:params.tokenDb.name, ticker:params.tokenDb.symbol, iconPath:params.tokenDb.logoURI,
        iconPathSecondary: params.networkDb.iconPath, amountCrypto:networkBalanceString, amountUSD:amountUSD.toString(), 
        baseNetworkTicker:params.networkDb.ticker}
        let tokenAndNetwork:TokenAndNetwork = {baseNetworkDb:params.networkDb, tokenData:{tokenDb:params.tokenDb, tokenBalance:newBalanceObj}};
        return tokenAndNetwork;
    }

        async getBalanceSplToken(params:TokenBalanceParameters):Promise<TokenAndNetwork>{
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
        let networkBalanceString = tokenBalance.toString();
        let amountUSD = (priceUSD * tokenBalance);
        // create new object for balance data
        let newBalanceObj:IBalance = {fullName:params.tokenDb.name, ticker:params.tokenDb.symbol, iconPath:params.tokenDb.logoURI,
        iconPathSecondary: params.networkDb.iconPath, amountCrypto:networkBalanceString, amountUSD:amountUSD.toString(), 
        baseNetworkTicker:params.networkDb.ticker}
        let tokenAndNetwork:TokenAndNetwork = {baseNetworkDb:params.networkDb, tokenData:{tokenDb:params.tokenDb, tokenBalance:newBalanceObj}};
        return tokenAndNetwork;
    }

    // TODO: UPDATE TOKEN BALANCE FUNCS TO FILTER ON FAMILY
    // get balances for all erc20 networks
    async getBalanceAllERC20Tokens(params:{walletUser:IWallet, onFetch?:(balance:IBalance|null)=>void, indexedNetworks:NetworkDb[]}):Promise<TokenAndNetwork[]>{
        const {walletUser, indexedNetworks, onFetch} = {...params}
        let erc20balances:TokenAndNetwork[] = [];
        for(const erc20Db of this.tokenDbs){
            for(const chainInfo of erc20Db.chainData){
                // get ethereum network db
                let networkDb:NetworkDb|null = this.getNetworkDbByTicker(chainInfo.ticker);
                if(!networkDb || NetworkFamilyFromFamilyName(networkDb?.networkFamilyName) != NetworkFamily.EVM){
                    if(onFetch){
                        onFetch(null);
                    }
                    continue;
                }
                if(indexedNetworks.includes(networkDb)) continue;
                console.log(`GETTING ERC20 balance FOR ${chainInfo.ticker}`);
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
                let accountAddress = await getAddressForNetworkDb(walletUser, networkDb);
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
                let tokenBalance:TokenAndNetwork = await this.getBalanceErc20Token(tokenParams)
                if(onFetch){
                    onFetch(tokenBalance.tokenData?.tokenBalance?tokenBalance.tokenData.tokenBalance:null);
                }
                // push balance data to balance array
                erc20balances.push(tokenBalance);
            }
        }
        return erc20balances;
    }

    // get balances for allNep141 tokens
    async getBalanceAllNep141Tokens(params:{walletUser:IWallet, onFetch?:(balance:IBalance|null)=>void, indexedNetworks:NetworkDb[]}):Promise<TokenAndNetwork[]>{
        console.log("getting nep141 balances");
        const {walletUser, indexedNetworks, onFetch} = {...params}
        let nep141Balances:TokenAndNetwork[] = [];
        for(const nep141Db of this.tokenDbs){      
            for(const chainInfo of nep141Db.chainData){  
                let networkDb:NetworkDb|null = this.getNetworkDbByTicker(chainInfo.ticker);
                if(!networkDb || NetworkFamilyFromFamilyName(networkDb?.networkFamilyName) != NetworkFamily.Near)
                {
                    if(onFetch){
                        onFetch(null);
                    }
                    continue;
                }
                console.log(`GETTING Nep141 balance FOR ${chainInfo.ticker}`);
                let accountAddress = await getAddressForNetworkDb(walletUser, networkDb);
                // get balance for contract
                let nep141Params:Nep141Params = {tokenAddress:chainInfo.address};
                let tokenParams:TokenBalanceParameters = {
                    tokenDb: nep141Db,
                    nep141Params: nep141Params,
                    accountAddress: accountAddress,
                    networkDb: networkDb
                }
                try{
                    let tokenBalance:TokenAndNetwork = await this.getBalanceNep141Token(tokenParams);
                    // push balance data to balance array
                    nep141Balances.push(tokenBalance);
                    if(onFetch){
                        onFetch(tokenBalance.tokenData?.tokenBalance?tokenBalance.tokenData.tokenBalance:null);
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
    async getBalanceAllSplTokens(params:{walletUser:IWallet, onFetch?:(balance:IBalance|null)=>void, indexedNetworks:NetworkDb[]}):Promise<TokenAndNetwork[]>{
            let splBalances:TokenAndNetwork[] = [];
            const {walletUser, indexedNetworks, onFetch} = {...params}
            for(const splDb of this.tokenDbs){          
                for(const chainInfo of splDb.chainData){  
                    let networkDb:NetworkDb|null = this.getNetworkDbByTicker(chainInfo.ticker);
                    if(!networkDb  || NetworkFamilyFromFamilyName(networkDb?.networkFamilyName) != NetworkFamily.Solana)
                    {
                        if(onFetch){
                            onFetch(null);
                        }
                        continue;
                    }
                    if(indexedNetworks.includes(networkDb)) continue;
                    console.log(`GETTING SPL balance FOR ${chainInfo.ticker}`);
                    let accountAddress = await getAddressForNetworkDb(walletUser, networkDb);
                    // get balance for contract
                    let splParams:SplParams = {tokenAddress:chainInfo.address};
                    let tokenParams:TokenBalanceParameters = {
                        tokenDb: splDb,
                        splParams: splParams,
                        accountAddress: accountAddress,
                        networkDb: networkDb
                    }
                    try{
                        let tokenBalance:TokenAndNetwork = await this.getBalanceSplToken(tokenParams);
                        // push balance data to balance array
                        splBalances.push(tokenBalance);
                        if(onFetch){
                            onFetch(tokenBalance.tokenData?.tokenBalance?tokenBalance.tokenData.tokenBalance:null);
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
        
}


export default Web3Service;