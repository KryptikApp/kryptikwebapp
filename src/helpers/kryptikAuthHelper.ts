// helps with integrating web3service into app. context
import { signInWithCustomToken, updateCurrentUser, updateProfile, User, UserCredential } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { updateVaultSeedloop } from "../handlers/wallet/vaultHandler";
import { defaultWallet } from "../models/defaultWallet";
import { IWallet } from "../models/IWallet";
import { defaultUser, UserDB, UserExtraData } from "../models/user";
import Web3Service, { IConnectWalletReturn } from "../services/Web3Service";
import { firebaseAuth, firestore, formatAuthUser, readExtraUserData, getUserPhotoPath } from "./firebaseHelper";
import { networkFromNetworkDb } from "./wallet/utils";



export function useKryptikAuth() {
    //create service
    let initServiceState:Web3Service = new Web3Service();
    // init state
    const [kryptikService, setKryptikService] = useState(initServiceState);
    const [kryptikWallet, setKryptikWallet] = useState(defaultWallet);
    const [authUser, setAuthUser] = useState(defaultUser);
    const [loading, setLoading] = useState(true);
    
    // wallet state change event handler
    const walletStateChanged = function(wallet:IWallet){
      console.log("Wallet event handler fired!");
      setKryptikWallet(wallet);
    }


    // routine to run when auth. state changes
    const authStateChanged = async (user:any, seed?:string) => {
        console.log("Running auth. state changed!");
        if (!user) {
          setAuthUser(defaultUser)
          setLoading(false)
          return;
        }
        await updateAuthContext(user);
    };

    // connects wallet with local service and updates remote share on server if necessary
    const ConnectWalletLocalandRemote = async function(ks:Web3Service, user:UserDB, seed?:string):Promise<IWallet>{
      let UserExtraData:UserExtraData = await readExtraUserData(user)
      let kryptikConnectionObject:IConnectWalletReturn = await ks.connectKryptikWallet(user.uid, UserExtraData.remoteShare, seed);
        // update remote share on db if value generated on local computer is different
        if(!UserExtraData.remoteShare || kryptikConnectionObject.remoteShare!=UserExtraData.remoteShare){
          console.log("UPDATING REMOTE SHARE ON DB");
          // update extra user data to reflect updated remote share
          let updatedUserExtraData:UserExtraData = {
            remoteShare: kryptikConnectionObject.remoteShare,
            isTwoFactorAuth: UserExtraData.isTwoFactorAuth,
            isAdvanced: UserExtraData.isAdvanced,
            bio: UserExtraData.bio
          }

          try{
            // write updated extra user data to DB
            await writeExtraUserData(user, updatedUserExtraData);
          }
          catch(err){
            throw new Error("Error writing extra user data to database. Check firestore connection.");
          }

        }
        return kryptikConnectionObject.wallet;
    }
    
    // update standard firestore user's profile
    const updateCurrentUserKryptik = async(user:UserDB)=>{
      let userFirebase:User|null = firebaseAuth.currentUser;
      if(userFirebase == null) throw(new Error("No user is signed in."));
      // get current extra user data
      let extraUserData:UserExtraData = await readExtraUserData(user);
      let extraUserDataUpdated:UserExtraData = {remoteShare: extraUserData.remoteShare, 
        bio: user.bio, isTwoFactorAuth:extraUserData.isTwoFactorAuth, isAdvanced:user.isAdvanced};
      await writeExtraUserData(user, extraUserDataUpdated);
      await updateProfile(userFirebase, {displayName:user.name, photoURL:user.photoUrl});
    }

    // sign in with external auth token
    const signInWithToken = async(customToken:string, seed?:string) =>
    {   
        // this value is used to prevent auth state changed from updating auth context...
        // when signing in with custom seed
        sessionStorage.setItem("isSigniningInWithToken", "true");
        let userCred:UserCredential = await signInWithCustomToken(firebaseAuth, customToken);
        sessionStorage.removeItem("isSigniningInWithToken")
        //now we are updating the context and connecting the wallet
        updateAuthContext(userCred.user, seed, "sign in with token function call");
        // note: auth state changed will run after the line above
    }

    const updateAuthContext = async(user:User, seed?:string, id?:string)=>
    {
        let isSigningInWithToken = sessionStorage.getItem("isSigniningInWithToken")
        if(isSigningInWithToken){
          // log for developing... remove in production
          console.log("SIGNING IN WITH TOKEN ESCAPE ROUTE HIT!!!!")
          return;
        }
        setLoading(true)
        let formattedUser:UserDB = formatAuthUser(user);
        // read extra user data from db
        let userExtraData = await readExtraUserData(formattedUser);
        formattedUser.bio = userExtraData.bio;
        formattedUser.isAdvanced = userExtraData.isAdvanced;
        // start web3 kryptik service
        let ks = await initServiceState.StartSevice();
        setKryptikService(ks);
        ks.onWalletChanged = walletStateChanged;
        let walletKryptik:IWallet;
        if (seed != "") {
            walletKryptik = await ConnectWalletLocalandRemote(ks, formattedUser, seed);
        }
        else {
            walletKryptik = await ConnectWalletLocalandRemote(ks, formattedUser);
        }
        try{
          console.log("Updating wallet networks;");
          await updateWalletNetworks(walletKryptik, kryptikService, formattedUser, userExtraData);
          console.log("wallet up to date");
        }
        catch(e){
          throw(new Error("Error: unable to synchronize remote networks."))
        }
        // set data
        setKryptikWallet(walletKryptik)
        setAuthUser(formattedUser);    
        setLoading(false);
    }

    // update wallets on local seedloop to match networks supported by app.
    const updateWalletNetworks = async function(wallet:IWallet, ks:Web3Service, user:UserDB, extraUserData:UserExtraData){
      // flag for if networks are added to seedloop
      let isUpdated:boolean = false;
      for(const networkDb of ks.getSupportedNetworkDbs()){
        let network = networkFromNetworkDb(networkDb);
        if(!wallet.seedLoop.networkOnSeedloop(network)){
          isUpdated = true;
          console.log(`Adding ${network.fullName} to wallet.`);
          wallet.seedLoop.addKeyRingByNetwork(network);;
        }
      }
      // save updated seedloop in local vault
      if(isUpdated){
        try{
          console.log(`Updating kryptik vault with id: ${user.uid}`);
          updateVaultSeedloop(user.uid, extraUserData.remoteShare, wallet);
          console.log("Vault updated");
        }
        catch(e){
          throw(new Error("Error: Unable to update vault with network synchronized seedloop"));
        }
      }
    }

    const writeExtraUserData = async function(user:UserDB, data:UserExtraData) {
      await setDoc(doc(firestore, "users", user.uid), data);
    }

    const getSeedPhrase = function():string{
      let seedPhrase:string|null = kryptikWallet.seedLoop.getSeedPhrase();
      if(!seedPhrase) throw(new Error("Error: HDSeedloop seedphrase is undefined"))
      return seedPhrase;
    }

  
    const signOut = () =>
      firebaseAuth.signOut().then(clear);
  
    useEffect(() => {
      const unsubscribe = firebaseAuth.onAuthStateChanged(authStateChanged);
      return () => unsubscribe();
    }, []);

    
    // clear current kryptik web 3 service state
    const clear = () => {
      console.log("Clearing!");
      setAuthUser(defaultUser);
      setKryptikWallet(defaultWallet);
      setKryptikService(new Web3Service());
      setLoading(true);
    };
  
    return {
      authUser,
      loading,
      signInWithToken,
      updateCurrentUserKryptik,
      getUserPhotoPath,
      getSeedPhrase,
      signOut,
      kryptikService,
      setKryptikWallet,
      kryptikWallet,
      clear
    };
  };