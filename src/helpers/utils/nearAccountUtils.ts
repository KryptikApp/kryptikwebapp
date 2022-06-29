import BN from "bn.js";
import { baseEncode } from "borsh";
import { Network } from "hdseedloop";
import { AccessKeyView, BlockResult } from "near-api-js/lib/providers/provider";
import { Action, addKey, createAccount, createTransaction, fullAccessKey, functionCall, Transaction, transfer } from "near-api-js/lib/transaction";
import { serialize } from "near-api-js/lib/utils";
import { parseNearAmount } from "near-api-js/lib/utils/format";
import { KeyPairEd25519, PublicKey } from "near-api-js/lib/utils/key_pair";
import { IWallet } from "../../models/IWallet";
import { NetworkDb } from "../../services/models/network";
import { KryptikProvider } from "../../services/models/provider";
import Web3Service from "../../services/Web3Service";
import { numberToBN } from "../utils";
import { networkFromNetworkDb } from "./networkUtils";
import {ISignAndSendNearParameters, signAndSendNEARTransaction} from "../../handlers/wallet/transactions/NearTransactions"
import { IErrorHandler, TransactionPublishedData } from "../../services/models/transaction";
import { DEFAULT_NEAR_FUNCTION_CALL_GAS } from "../../handlers/wallet/transactions/constants";

const ACCOUNT_ID_REGEX = /^(([a-z\d]+[-_])*[a-z\d]+\.)*([a-z\d]+[-_])*[a-z\d]+$/;

export const isLegitNEARAccountId = function(accountId:string) {
    return ACCOUNT_ID_REGEX.test(accountId);
}


export interface INEARAccountAvailableParams{
    accountId:string,
    accountIdCurrent:string,
    kryptikProvider:KryptikProvider,
    updateMessageHandler?:(msg:string, isError:boolean)=>void
}
export const checkNEARAccountAvailable = async(params:INEARAccountAvailableParams)=>{
    const {accountId, accountIdCurrent, kryptikProvider, updateMessageHandler} = {...params};
    console.log("Checking near account availability for..");
    console.log(accountId);
    const hasMultipleDots = /(\..*){2,}/.test(accountId);
    if (!isLegitNEARAccountId(accountId) || !accountId.includes(".near") || hasMultipleDots) {
        if(updateMessageHandler){
            updateMessageHandler("Invalid username.", true);
        }
        return false;
    }
    // get near provider
    if(!kryptikProvider.nearProvider){
        if(updateMessageHandler){
            updateMessageHandler("No NEAR provider available. Unable to check account.", true);
        }
        return false;
    }
    let nearProvider = kryptikProvider.nearProvider;
    if (accountId !==accountIdCurrent) {
        let account = await nearProvider.account(accountId);
        try{
            // if we reach here, the name is taken
            let accountState = await account.state();
            if(updateMessageHandler){
                updateMessageHandler("This account is taken. Please try another name.", true);
            }
            return false;
        }
        catch(e){
            if(updateMessageHandler){
                updateMessageHandler(`${accountId} is available!`, true);
            }
            return true;
        }
        
    } else {
        if(updateMessageHandler){
            updateMessageHandler(`You are logged into account ${accountId}.`, true);
        }
        return false;
    }
}

export interface INearReservationParams{
    wallet:IWallet,
    fromAddress:string,
    newAccountId:string,
    kryptikService: Web3Service,
    errorHandler:IErrorHandler
}

export interface INearNameTxParams{
    kryptikProvider:KryptikProvider, 
    newAccountPublicKeyBase58:string, 
    newAccountId:string,
    amount: BN, 
    sendAccount:string, 
    sendAccountPubKey:PublicKey, 
    toAccount:string,
}

export const reserveNearAccountName = async function(params:INearReservationParams):Promise<TransactionPublishedData|null>{
    console.log("Running reserve name method....");
    const{kryptikService, newAccountId, wallet, fromAddress, errorHandler} = {...params};
    let nearNetworkDb:NetworkDb|null = kryptikService.getNetworkDbByTicker("near");
    if(!nearNetworkDb){
        throw(new Error("Error: Unable to retrieve near network from web3service"));
    }
    let nearNetwork:Network = networkFromNetworkDb(nearNetworkDb);
    let tokenWallet = wallet.seedLoop.getWalletForAddress(nearNetwork, fromAddress);
    if(!tokenWallet) throw(new Error("Error: Unable to retrieve neartoken wallet from seedloop"));
    let kryptikProvider:KryptikProvider = await kryptikService.getKryptikProviderForNetworkDb(nearNetworkDb);
    let keyPair:nacl.SignKeyPair = tokenWallet.createKeyPair();
    let nearKey:KeyPairEd25519 = new KeyPairEd25519(baseEncode(keyPair.secretKey));
    // get amount in BN 
    let amountYocto:string|null = parseNearAmount("0.1");
    if(!amountYocto) throw(new Error("Error: Unable to parse near amount"));
    // basic transfer type
    console.log(amountYocto);
    let bnAmount = numberToBN(amountYocto);
    // for now we'll just hardcode to account to be the from account
    let createTxParams:INearNameTxParams = {
        kryptikProvider: kryptikProvider,
        newAccountPublicKeyBase58: baseEncode(keyPair.publicKey),
        newAccountId: newAccountId,
        amount: bnAmount,
        sendAccount: fromAddress,
        toAccount: fromAddress,
        sendAccountPubKey: nearKey.publicKey
    }
    console.log("Building near name tx.")
    let nearNameTx:Transaction = await createNearReservationTx(createTxParams);
    console.log("Built near name tx.")
    let sendParams:ISignAndSendNearParameters = {
        txNear: nearNameTx,
        wallet: wallet,
        networkDb: nearNetworkDb,
        kryptikProvider: kryptikProvider,
        sendAccount: fromAddress
    }
    let txDoneData:TransactionPublishedData;
    console.log("Publishing name reservation tx.....");
    try{
        let publishResponse = await signAndSendNEARTransaction(sendParams);
        txDoneData = publishResponse;
      }
      catch(e:any){
        errorHandler(e.message, true)
        return null;
    }
    return txDoneData;
}


// creates a near transaction to reserve an account name
export const createNearReservationTx = async function(params:INearNameTxParams){
    const{amount, kryptikProvider, newAccountPublicKeyBase58, sendAccount, sendAccountPubKey, newAccountId} = {...params};
    console.log("New pub key address:");
    console.log(newAccountPublicKeyBase58);
    if(!kryptikProvider.nearProvider) throw(new Error(`No provider set for Near. Unable to create transaction.`));
    let nearProvider = kryptikProvider.nearProvider;
    const accessKeyResponse = await nearProvider.connection.provider.query<AccessKeyView>({
        request_type: 'view_access_key',
        account_id: sendAccount,
        public_key: sendAccountPubKey.toString(),
        finality: 'optimistic'
    });
    console.log("Access key response");
    console.log(accessKeyResponse);
    let block:BlockResult = await nearProvider.connection.provider.block({ finality: 'final' });
    let recentBlockhash:Buffer = serialize.base_decode(block.header.hash); 
    // create function call action
    const callArgs = {new_account_id: newAccountId, new_public_key: newAccountPublicKeyBase58};
    const actions:Action[] = [functionCall("create_account", callArgs, DEFAULT_NEAR_FUNCTION_CALL_GAS, amount)];
    let nearTX:Transaction = createTransaction(
        sendAccount,
        sendAccountPubKey,
        "near",
        accessKeyResponse.nonce+1,
        actions,
        recentBlockhash
    );
    return nearTX;
}