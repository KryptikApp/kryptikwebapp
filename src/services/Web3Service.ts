import {firestore} from "../helpers/firebaseHelper"
import { collection, getDocs, query, where } from "firebase/firestore";
import { ServiceState } from './types';
import BaseService from './BaseService';
import {defaultNetworkDb, NetworkBalanceParameters, NetworkDb, placeHolderEVMAddress} from './models/network'
import {
    JsonRpcProvider,
    StaticJsonRpcProvider,
} from '@ethersproject/providers';
import {
    Connection,
    Keypair,
    PublicKey,
    RpcResponseAndContext,
    TokenAmount,
  } from '@solana/web3.js';

import HDSeedLoop, {Network, NetworkFamily, NetworkFromTicker, WalletKryptik } from "hdseedloop";
import { IWallet } from "../models/IWallet";
import { defaultWallet } from "../models/defaultWallet";
import { createVault, unlockVault, VaultAndShares } from "../handlers/wallet/vaultHandler";
import { BigNumber, Contract, utils } from "ethers";
import { getPriceOfTicker } from "../helpers/coinGeckoHelper";
import TransactionFeeData, {defaultEVMGas, FeeDataEvmParameters, FeeDataParameters, FeeDataSolParameters} from "./models/transaction";
import { createEd25519PubKey, createSolTokenAccount, divByDecimals, isNetworkArbitrum, lamportsToSol, networkFromNetworkDb, roundCryptoAmount, roundToDecimals, roundUsdAmount } from "../helpers/wallet/utils";
import { UserDB } from "../models/user";
import {getChainDataForNetwork } from "../handlers/wallet/transactionHandler";
import { CreateEVMContractParameters, TokenBalanceParameters, ChainData, TokenDb, ERC20Params, SplParams, TokenData } from "./models/token";
import {erc20Abi} from "../abis/erc20Abi";
import * as splToken from "@solana/spl-token"
import { responseSymbol } from "next/dist/server/web/spec-compliant/fetch-event";

const NetworkDbsRef = collection(firestore, "networks");
const ERC20DbRef = collection(firestore, "erc20tokens");
const SplDbRef = collection(firestore, "spltokens");


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
    iconPathSecondary?:string,
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
    public NetworkDbs:NetworkDb[] = [];
    public erc20Dbs:TokenDb[] = [];
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
                if(!kryptikProvider.solProvider) throw(new Error("No solana provider is set up."))
                let solNetworkProvider:Connection = kryptikProvider.solProvider;
                balanceNetwork = lamportsToSol(await solNetworkProvider.getBalance(solPubKey));
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
           amountUSD:amountUSD.toString(), networkCoinGecko:params.networkDb.coingeckoId};

        return newBalanceObj;
    }


    // TODO: Update to support tx. based networks
    getBalanceAllNetworks = async(walletUser:IWallet, user?:UserDB):Promise<IBalance[]> =>{
        let networksFromDb = this.getSupportedNetworkDbs();
        // initialize return array
        let balances:IBalance[] = [];
        for(const nw of networksFromDb){
            // only show testnets to advanced users
            if(nw.isTestnet && user && !user.isAdvanced) continue;
            // gets all addresses for network
            let accountAddress:string = await this.getAddressForNetworkDb(walletUser, nw);
            let NetworkBalanceParams:NetworkBalanceParameters = {
                accountAddress: accountAddress,
                networkDb: nw
            }
            let networkBalance:IBalance|null = await this.getBalanceNetwork(NetworkBalanceParams);
            // push balance obj to balance data array
            if(networkBalance) balances.push(networkBalance);
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
        networkCoinGecko:params.networkDb.coingeckoId}
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
            tokenBalance =  divByDecimals(Number(repsonse.value.amount), repsonse.value.decimals); 
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
        networkCoinGecko:params.networkDb.coingeckoId}
        return newBalanceObj;
    }

    // get balances for all erc20 networks
    async getBalanceAllERC20Tokens(walletUser:IWallet){
        let erc20balances:IBalance[] = [];
        for(const erc20Db of this.erc20Dbs){
            for(const chainInfo of erc20Db.chainData){
                // get ethereum network db
                let networkDb:NetworkDb|null = this.getNetworkDbByTicker(chainInfo.ticker);
                if(!networkDb) continue;
                // hdseedloop compatible network
                let erc20ContractParams:CreateEVMContractParameters= {
                    wallet: walletUser,
                    networkDb: networkDb,
                    erc20Db: erc20Db
                }
                let erc20Contract = await this.createERC20Contract(erc20ContractParams);
                if(!erc20Contract) continue;
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
                // push balance data to balance array
                erc20balances.push(tokenBalance);
            }
        }
        return erc20balances;
    }

    // get balances for all spl tokens
    async getBalanceAllSplTokens(walletUser:IWallet){
        let splBalances:IBalance[] = [];
        for(const splDb of this.splDbs){          
            for(const chainInfo of splDb.chainData){  
                console.log(`GETTING SPL balance FOR ${chainInfo.ticker}`);
                let networkDb:NetworkDb|null = this.getNetworkDbByTicker(chainInfo.ticker);
                if(!networkDb) continue;
                console.log("hit 1");
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
                }
                catch(e){
                    console.warn(`Unable to fetch balance for ${splDb.name} on ${networkDb.fullName}.`)
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
             }
             default: { 
                return null;
                break; 
             } 
        }
    }

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
        
}


export default Web3Service;