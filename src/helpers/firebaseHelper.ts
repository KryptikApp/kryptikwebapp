import { initializeApp } from "firebase/app";
import { getAuth, updateCurrentUser } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { doc, DocumentData, DocumentSnapshot, getDoc, getFirestore, setDoc} from 'firebase/firestore';
// set your own firebase secrets to access db
import { firebaseConfig } from "../../secrets";
import { signInWithCustomToken, User, UserCredential } from "firebase/auth";
import { useEffect, useState } from "react";

import { UserDB } from "../models/user"


const firebaseApp = initializeApp(firebaseConfig);
const firebaseAuth = getAuth(firebaseApp);
const firestore = getFirestore(firebaseApp);

// Get a reference to the storage service, which is used to create references in your storage bucket
const storage = getStorage(firebaseApp);
export  {
    firebaseAuth, firestore, storage, firebaseApp as default
};


// user auth helper code

// interface for extra user data
export interface UserExtraData{
  isTwoFactorAuth: boolean,
  remoteShare: string
}

export const formatAuthUser = function(user:any):UserDB
{
    return {
        uid: user.uid,
        email: user.email,
        name: user.displayName,
        photoUrl: user.photoURL,
      };
};

export const formatUserExtraData = function(docIn:DocumentSnapshot<DocumentData>):UserExtraData{
    let formatted:UserExtraData;
    let dataIn = docIn.data();
    if(dataIn){
      formatted = {
        isTwoFactorAuth: dataIn.isTwoFactorAuth,
        remoteShare: dataIn.remoteShare
      }
    }
    else{
      formatted = {
        isTwoFactorAuth: false,
        remoteShare: ""
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
  let photoUrl:string = "/media/avatars/defaultAvatar1.png"
  return photoUrl;
}

export function useFirebaseAuth() {
    //create dummy user of type userDB
    let dummyUser:UserDB = {
        uid: "",
        email:"",
        name: "",
        photoUrl: ""

    }
    // init state 
    const [authUser, setAuthUser] = useState(dummyUser);
    const [loading, setLoading] = useState(true);

    // clear current auth state
    const clear = () => {
      setAuthUser(dummyUser);
      setLoading(true);
    };

    // routine to run when auth. state changes
    const authStateChanged = async (user:any) => {
        console.log("AUTH State changed!");
        console.log(user);
        if (!user) {
          setAuthUser(dummyUser)
          setLoading(false)
          return;
        }
    
        setLoading(true)
        var formattedUser = formatAuthUser(user);
        setAuthUser(formattedUser);    
        setLoading(false);
    };
    
    const updateCurrentUserKryptik = async(user:User)=>{
      await updateCurrentUser(firebaseAuth, user);
    }

    const signInWithToken = async(customToken:string, data:UserExtraData|null) =>
    {
        let signInCred:UserCredential = await signInWithCustomToken(firebaseAuth, customToken);
        let dbUser:UserDB = formatAuthUser(signInCred.user);
        let docRef = doc(firestore, "users", dbUser.uid);
        // write extra data to database if not yet set
        if(!(await getDoc(docRef)).exists() && data){
            try{
              await writeExtraUserData(dbUser, data)
            }
            catch(err){
              console.log(err);
            }
        }
    }
  
    const signOut = () =>
      firebaseAuth.signOut().then(clear);
  
    useEffect(() => {
      const unsubscribe = firebaseAuth.onAuthStateChanged(authStateChanged);
      return () => unsubscribe();
    }, []);
  
    return {
      authUser,
      loading,
      signInWithToken,
      updateCurrentUserKryptik,
      signOut
    };
  };










