import { initializeApp } from "firebase/app";
import { getAuth, updateCurrentUser } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore} from 'firebase/firestore';
// set your own firebase secrets to access db
import { firebaseConfig } from "../../secrets";
import { Magic } from "@magic-sdk/admin";
import { signInWithCustomToken, User, UserCredential } from "firebase/auth";
import { useEffect, useState } from "react";

import { createCustomFirebaseToken } from "./utils";


const firebaseApp = initializeApp(firebaseConfig);
const firebaseAuth = getAuth(firebaseApp);
const firestore = getFirestore(firebaseApp);

// Get a reference to the storage service, which is used to create references in your storage bucket
const storage = getStorage(firebaseApp);
export  {
    firebaseAuth, firestore, storage, firebaseApp as default
};


// user auth helper code
export interface UserDB {
    uid: string,
    email: string
}

const formatAuthUser = function(user:any)
{
    return {
        uid: user.uid,
        email: user.email,
        name: user.displayName,
        photoUrl: user.photoURL,
      };
};

export function useFirebaseAuth() {
    //create dummy user of type userDB
    let dummyUser:UserDB = {
        uid: "not set",
        email:"not set"
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
    const signInWithToken = async(customToken:string) =>
    {
        let signInCred:UserCredential = await signInWithCustomToken(firebaseAuth, customToken);
        let dbUser = signInCred.user;
        // await firebaseAuth.updateCurrentUser(dbUser);
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










