import { randomBytes } from "crypto"
import * as crypt from "crypto-js"
import HDSeedLoop, { SerializedSeedLoop } from "hdseedloop"
import { IWallet } from "../../models/IWallet"
import { combineShares, createShares } from "./shareHandler"


export interface VaultContents{
    seedloopSerlializedCipher:string,
    vaultVersion:number,
    localShare:string,
    lastUnlockTime:number,
    createdTime: number
    uid:string,
    check:string
}

export interface VaultAndShares{
    vault:VaultContents,
    remoteShare: string
}

export const createVault = function(seedloop:HDSeedLoop, uid:string):VaultAndShares{
    let seedloopSerialized:SerializedSeedLoop = seedloop.serializeSync();
    // genrate random encryption key
    let newPassword = randomBytes(256).toString('hex');
    let seedloopString = JSON.stringify(seedloopSerialized);
    let seedloopEncrypted:string = crypt.AES.encrypt(seedloopString, newPassword).toString();
    // generate shares from encryption key
    let shares:Buffer[] = createShares(newPassword);
    // create string rep.'s of secret shares
    let remoteShare = shares[0].toString('hex');
    let localShare = shares[1].toString('hex');
    let newVault:VaultContents = {
        seedloopSerlializedCipher:seedloopEncrypted,
        vaultVersion: 0,
        localShare: localShare,
        createdTime: Date.now(),
        lastUnlockTime: 0,
        uid: uid,
        check: "valid"
    };
    // string that represents vault with encrypted seedloop
    let vaultString:string = JSON.stringify(newVault);
    // key to access vault in local storage
    let vaultName:string = createVaultName(uid);
    localStorage.setItem(vaultName, vaultString);
    return {vault:newVault, remoteShare: remoteShare};
}

// check if vault for a given uid exists in local storage
export const vaultExists = function(uid:string):boolean{
    let vaultName:string = createVaultName(uid);
    let vaultString:string|null = localStorage.getItem(vaultName);
    if(vaultString == null){
        return false;
    }
    return true;
}

export const unlockVault = function(uid:string, remoteShare:string, seedloopUpdated?:HDSeedLoop):HDSeedLoop|null{
    let vaultName:string = createVaultName(uid);
    let vaultString:string|null = localStorage.getItem(vaultName);
    if(vaultString == null){
        console.log("There is no vault to unlock with the given id.");
        return null;
    }
    let vaultRecovered:VaultContents = JSON.parse(vaultString);
    // update last unlock time
    vaultRecovered.lastUnlockTime = Date.now();
    // array of shamir secret shares
    let shareArray:string[] = [remoteShare, vaultRecovered.localShare]
    let passwordRecovered:string = combineShares(shareArray).toString();
    let seedloopDeciphered = crypt.AES.decrypt(vaultRecovered.seedloopSerlializedCipher, passwordRecovered).toString(crypt.enc.Utf8);
    let seedloopSerialized:SerializedSeedLoop = JSON.parse(seedloopDeciphered);
    console.log("deserializing seedloop");
    let seedloopRecovered = HDSeedLoop.deserialize(seedloopSerialized)
    console.log("done!");
    // update vault seedloop if updated seedloop is provided
    if(seedloopUpdated){
        let seedloopSerialized:SerializedSeedLoop = seedloopUpdated.serializeSync();
        // genrate random encryption key
        let seedloopString = JSON.stringify(seedloopSerialized);
        let seedloopEncrypted:string = crypt.AES.encrypt(seedloopString, passwordRecovered).toString();
        vaultRecovered.seedloopSerlializedCipher = seedloopEncrypted;
    }
    // update local storage vault 
    // string that represents vault with encrypted seedloop
    let vaultStringUpdated:string = JSON.stringify(vaultRecovered);
    localStorage.setItem(vaultName, vaultStringUpdated);
    return seedloopRecovered;
}


// ensure vault was decoded correctly
const isValidVaultDecode = function(vault:VaultContents):boolean{
    return vault.check == "valid"
}

// creates standard vault name given uid
const createVaultName = function(uid:string){
    return "wallet|"+uid;
}

export const updateVaultSeedloop = function(uid:string, remoteShare:string, wallet:IWallet){
    unlockVault(uid, remoteShare, wallet.seedLoop);
}

export const deleteVault = function(uid:string){
    let vaultName = createVaultName(uid);
    console.log("removing vault with name:");
    console.log(vaultName);
    localStorage.removeItem(vaultName);
}