import { PublicKey } from "@solana/web3.js";

import { isValidEVMAddress, Network, NetworkFamily } from "hdseedloop";
import { IWallet } from "../../models/KryptikWallet";
import { NetworkDb } from "../../services/models/network";
import { networkFromNetworkDb } from "./networkUtils";



// generate a public key from a given address, using the sol web3 library
export const createEd25519PubKey = function(address:string):PublicKey{
    let pubKey:PublicKey|null = new PublicKey(address);
    if(!pubKey){
        throw(new Error("Error: Unable to generate public key. Please make sure input address is correct"));
    }
    return pubKey;
}

export const createSolTokenAccount = async function(accountAddress:string, tokenAddress:string):Promise<PublicKey>{
    // smart contract ids defined by solana
    const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
    const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL');
    // user address
    const owner = new PublicKey(accountAddress);
    // token address
    const mint = new PublicKey(tokenAddress);
    const [pubKey] = await PublicKey.findProgramAddress(
        [owner.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
        ASSOCIATED_TOKEN_PROGRAM_ID
    );
    return pubKey;
}


export const isValidAddress = function(address:NamedCurve, networkDB:NetworkDb){
    let network = networkFromNetworkDb(networkDB);
    switch(network.networkFamily){
        case(NetworkFamily.EVM):{
            return isValidEVMAddress(address);
        }
        // for now just return true
        default:{
            return true;
        }
    }
}


// returns blockchain address for a given networkdb
export const getAddressForNetworkDb = async(wallet:IWallet, networkDb:NetworkDb):Promise<string>=>{
    let network = networkFromNetworkDb(networkDb);
    let addy = await getAddressForNetwork(wallet, network);
    return addy;
}

export const getAddressForNetwork = async(wallet:IWallet, network:Network):Promise<string>=>{
    // gets all addresses for network
    let allAddys:string[] = await wallet.seedLoop.getAddresses(network);
    // gets first address for network
    let firstAddy:string = allAddys[0];
    return firstAddy;
}




