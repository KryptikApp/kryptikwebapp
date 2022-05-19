import { initializeApp } from "firebase/app";
import { getAuth, updateCurrentUser } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { doc, DocumentData, DocumentSnapshot, getDoc, getFirestore, setDoc} from 'firebase/firestore';
// set your own firebase secrets to access db
import { firebaseConfig } from "../../secrets";
import { signInWithCustomToken, User, UserCredential } from "firebase/auth";
import { useEffect, useState } from "react";

import { defaultUser, UserDB, UserExtraData } from "../models/user"


const firebaseApp = initializeApp(firebaseConfig);
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

// TODO: ADD SUPPORT FOR RANDOM AVATAR
export const getUserPhotoPath = function(user:UserDB):string{
  // if user has a proper photo url, return it
  if(user.photoUrl!=null && user.photoUrl!=""){
    return user.photoUrl;
  }
  // if not... return a default avatar icon
  let photoUrl:string = "/media/avatars/defaultAvatar1.jpg"
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










