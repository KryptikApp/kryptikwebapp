// helps with integrating web3service into app. context
import { signInWithCustomToken, updateCurrentUser, updateProfile, User, UserCredential } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { defaultWallet } from "../models/defaultWallet";
import { IWallet } from "../models/IWallet";
import { defaultUser, UserDB, UserExtraData } from "../models/user";
import Web3Service, { IConnectWalletReturn } from "../services/Web3Service";
import { firebaseAuth, firestore, formatAuthUser, readExtraUserData, getUserPhotoPath } from "./firebaseHelper";



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
    const authStateChanged = async (user:any) => {
        console.log("Running auth. state changed!");
        if (!user) {
          setAuthUser(defaultUser)
          setLoading(false)
          return;
        }
        setLoading(true)
        let formattedUser:UserDB = formatAuthUser(user);
        // read extra user data from db
        let userExtraData = await readExtraUserData(formattedUser);
        formattedUser.bio = userExtraData.bio;
        // start web3 kryptik service
        let ks = await initServiceState.StartSevice();
        setKryptikService(ks);
        ks.onWalletChanged = walletStateChanged;
        let walletKryptik:IWallet = await ConnectWalletLocalandRemote(ks, formattedUser);
        // set data
        setKryptikWallet(walletKryptik)
        setAuthUser(formattedUser);    
        setLoading(false);
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
        bio: user.bio, isTwoFactorAuth:extraUserData.isTwoFactorAuth};
      await writeExtraUserData(user, extraUserDataUpdated);
      await updateProfile(userFirebase, {displayName:user.name, photoURL:user.photoUrl});
    }

    // sign in with external auth token
    const signInWithToken = async(customToken:string, seed?:string) =>
    { 
        console.log("Signing in with token.");
        await signInWithCustomToken(firebaseAuth, customToken);
        // note: auth state changed will run after the line above
    }

    const writeExtraUserData = async function(user:UserDB, data:UserExtraData) {
      await setDoc(doc(firestore, "users", user.uid), data);
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
      signOut,
      kryptikService,
      setKryptikWallet,
      kryptikWallet,
      clear
    };
  };