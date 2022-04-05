import { initializeFirestore } from "firebase/firestore";
import HDSeedLoop, { SerializedSeedLoop } from "hdseedloop"
import { NetworkFromTicker } from "hdseedloop";
import { defaultWallet } from "../../models/defaultWallet";
import { IWallet } from "../../models/IWallet";

export const connectKryptikWallet = async (seed?:string): Promise<IWallet> => {
    
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
      let ethKeyring = await seedloopKryptik.getKeyRing(ethNetwork);
      // get all ethereum addreses for wallet
      let etheAddysAll = await seedloopKryptik.addAddresses(ethNetwork, 1);
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
      // save seed loop in local storage
      window.localStorage.setItem("kryptikWallet", JSON.stringify(hdseedloopSerialized));
      // returns new kryptik wallet that adheres to wallet interface
      return newKryptikWallet;
    
  };