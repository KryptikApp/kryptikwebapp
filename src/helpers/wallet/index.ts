import HDSeedLoop, { Network, NetworkFromTicker, Options } from "hdseedloop";
import { unlockVault, VaultAndShares, createVault } from "../../handlers/wallet/vaultHandler";
import { defaultWallet } from "../../models/defaultWallet";
import { IWallet } from "../../models/KryptikWallet";
import { NetworkDb } from "../../services/models/network";
import { IConnectWalletReturn } from "../../services/Web3Service";
import { networkFromNetworkDb } from "../utils/networkUtils";

export const createSeedloop = function(networkDbsToAdd:NetworkDb[], seed?:string):HDSeedLoop{
    let seedloopKryptik:HDSeedLoop;
    let networksFormatted:Network[] = [];
    // create list of seedloop conforming networks
    for(const nw of networkDbsToAdd){
        const network:Network = networkFromNetworkDb(nw);
        networksFormatted.push(network)
    }
    let seedloopOptions:Options = {}
    if(seed){
        // create new seedloop from imported seed
        seedloopOptions.mnemonic = seed;
        seedloopKryptik = new HDSeedLoop(seedloopOptions, networksFormatted)
    }
    else{
        seedloopKryptik = new HDSeedLoop(seedloopOptions, networksFormatted);
    }
    return seedloopKryptik;
}

// UPDATE TO RETURN REMOTE SHARE
export const connectKryptikWallet = async(uid:string, networkDbsToAdd:NetworkDb[], remoteShare?:string, seed?:string): Promise<IConnectWalletReturn> => {   
    let seedloopKryptik:HDSeedLoop;
    let remoteShareReturn:string;
    if(remoteShare){
      remoteShareReturn = remoteShare;
      // access existing wallet from local storage vault
      console.log("Unlocking vault...")
      let vaultSeedloop:HDSeedLoop|null = unlockVault(uid, remoteShare);
      console.log("vault unlocked!");
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
        seedloopKryptik = createSeedloop(networkDbsToAdd, seed);
        let newVaultandShare:VaultAndShares = createVault(seedloopKryptik, uid);
        remoteShareReturn = newVaultandShare.remoteShare;
    }

    let ethNetwork = NetworkFromTicker("eth");
    // get primary ethereum addreses for kryptik wallet
    let etheAddysAll = await seedloopKryptik.getAddresses(ethNetwork);
    let ethAddyFirst = etheAddysAll[0];
    // reolve eth
    
    // set values for new wallet
    let newKryptikWallet:IWallet = new IWallet({
        ...defaultWallet,
        walletProviderName: "kryptik",
        connected: true,
        seedLoop: seedloopKryptik,
        resolvedEthAccount: {address:ethAddyFirst, isResolved:false},
        uid: uid
    });

    // set return values
    let connectionReturnObject:IConnectWalletReturn = {
        wallet:newKryptikWallet,
        remoteShare: remoteShareReturn
    }
    return connectionReturnObject;
};