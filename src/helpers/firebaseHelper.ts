import { FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
import { deleteUser, getAuth, updateCurrentUser } from "firebase/auth";
import { getStorage, ref } from "firebase/storage";
import { deleteDoc, doc, DocumentData, DocumentSnapshot, getDoc, getFirestore, setDoc} from 'firebase/firestore';
// set your own firebase secrets to access db
import { User } from "firebase/auth";
import { useState } from "react";

import { defaultUser, UserDB, UserExtraData } from "../models/user"
import { deleteVault } from "../handlers/wallet/vaultHandler";
import { EMAIL_TO_ACCOUNT_DB_LOCATION} from "./resolvers/kryptikResolver";

const firebaseCredentials = {apiKey: process.env.NEXT_PUBLIC_FIREBASE_PUBLIC_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID};


let firebaseApp:FirebaseApp;

if(!getApps().length){
  firebaseApp = initializeApp(firebaseCredentials);
}
else{
  firebaseApp = getApp();
}


const firebaseAuth = getAuth(firebaseApp);
const firestore = getFirestore(firebaseApp);

// Get a reference to the storage service, which is used to create references in your storage bucket
const storage = getStorage(firebaseApp);
export  {
    firebaseAuth, firestore, storage, firebaseApp as default
};


// user auth helper code


export const formatAuthUser = function(user:any):UserDB
{
    return {
        uid: user.uid,
        email: user.email,
        name: user.displayName,
        bio: user.bio,
        photoUrl: user.photoURL,
        isAdvanced: user.isAdvanced,
        isLoggedIn: true
      };
};

export const formatUserExtraData = function(docIn:DocumentSnapshot<DocumentData>):UserExtraData{
    let formatted:UserExtraData;
    let dataIn = docIn.data();
    if(dataIn){
      formatted = {
        isTwoFactorAuth: dataIn.isTwoFactorAuth,
        remoteShare: dataIn.remoteShare,
        bio: dataIn.bio
      }
    }
    else{
      formatted = {
        isTwoFactorAuth: false,
        remoteShare: "",
        bio: ""
      }
    }
    return formatted;
}

const formatPhoto = function(docIn:DocumentSnapshot<DocumentData>):string{
  let dataIn = docIn.data();
  let formatted:string;
  if(dataIn){
    formatted = dataIn.iconPath;
  }
  else{
    formatted = ""
  }
  return formatted;
}

export const generateStoragePath = function(fileName:string, user:UserDB){
  return `avatars/${user.uid}/${fileName}`;
}

export const readExtraUserData = async function(user:UserDB):Promise<UserExtraData>{
  let extraDataDoc:DocumentSnapshot<DocumentData> = await getDoc(doc(firestore, "users", user.uid));
  let userExtraData:UserExtraData = formatUserExtraData(extraDataDoc);
  return userExtraData;
}

export const writeExtraUserData = async function(user:UserDB, data:UserExtraData) {
  await setDoc(doc(firestore, "users", user.uid), data);
}

export const removeUserAndWallet = async function(){
  let firebaseUser = firebaseAuth.currentUser;
  if(!firebaseUser){
    throw(new Error("Error: User is not assigned. Unable to delete."))
  }
  // delete local wallet
  deleteVault(firebaseUser.uid);
  // TODO: delete avatar folder
  // delete address store
  await deleteDoc(doc(firestore, EMAIL_TO_ACCOUNT_DB_LOCATION, firebaseUser.uid));
  // delete extra user data
  await deleteDoc(doc(firestore, "users", firebaseUser.uid));
  // delete firebase user
  await deleteUser(firebaseUser);
}

export const addUserBlockchainAccountsDB = async function(blockchainAccounts:any){
  // push blockchain account data to firestore db
  let firebaseUser = firebaseAuth.currentUser;
  if(!firebaseUser){
    throw(new Error("Error: User is not assigned. Unable to delete."))
  }
  await setDoc(doc(firestore, EMAIL_TO_ACCOUNT_DB_LOCATION,firebaseUser.uid), blockchainAccounts)
}

export const deleteUserBlockchainAccountsDB = async function(){
  let firebaseUser = firebaseAuth.currentUser;
  if(!firebaseUser){
    throw(new Error("Error: User is not assigned. Unable to delete."))
  }
  // delete blockchain accounts db doc
  await deleteDoc(doc(firestore, EMAIL_TO_ACCOUNT_DB_LOCATION, firebaseUser.uid));
}

const avatarPathList = ["/media/avatars/defaultAvatar1.jpg", "/media/avatars/defaultAvatar2.jpg", "/media/avatars/defaultAvatar3.jpg", "/media/avatars/defaultAvatar4.jpg"]
/**
 * Returns a random number between min (inclusive) and max (exclusive)
 */
 function getRandomIntArbitrary(min:number, max:number):number{
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// TODO: ADD SUPPORT FOR RANDOM AVATAR
export const getUserPhotoPath = function(user:UserDB):string{
  // if user has a proper photo url, return it
  if(user.photoUrl!=null && user.photoUrl!=""){
    return user.photoUrl;
  }
  // if not... return a default avatar icon
  let randomIndex:number = getRandomIntArbitrary(0, avatarPathList.length-1);
  let photoUrl:string = avatarPathList[randomIndex];
  // update shared user state
  user.photoUrl = photoUrl;
  return photoUrl;
}

export function useFirebaseAuth() {
    // init state 
    const [authUser, setAuthUser] = useState(defaultUser);
    const [loading, setLoading] = useState(true);

    // clear current auth state
    const clear = () => {
      setAuthUser(defaultUser);
      setLoading(true);
    };
    
    const updateCurrentUserKryptik = async(user:User)=>{
      await updateCurrentUser(firebaseAuth, user);
    }

  
    const signOut = () =>
      firebaseAuth.signOut().then(clear);
  
    return {
      authUser,
      loading,
      updateCurrentUserKryptik,
      signOut
    };
  };










