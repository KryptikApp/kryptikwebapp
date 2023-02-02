import {
  FirebaseApp,
  FirebaseOptions,
  getApp,
  getApps,
  initializeApp,
} from "firebase/app";
import { getStorage } from "firebase/storage";
import {
  DocumentData,
  DocumentSnapshot,
  getFirestore,
} from "firebase/firestore";
// set your own firebase secrets to access db

import { UserDB, UserExtraData } from "../models/user";

const firebaseCredentials: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_PUBLIC_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGEBUCKET,
};

let firebaseApp: FirebaseApp;

if (!getApps().length) {
  firebaseApp = initializeApp(firebaseCredentials);
} else {
  firebaseApp = getApp();
}

const firestore = getFirestore(firebaseApp);

// Get a reference to the storage service, which is used to create references in your storage bucket
const storage = getStorage(firebaseApp);
export { firestore, storage, firebaseApp as default };

// user auth helper code

export const formatAuthUser = function (user: any): UserDB {
  return {
    uid: user.uid,
    email: user.email,
    name: user.displayName,
    bio: user.bio,
    photoUrl: user.photoURL,
    isAdvanced: user.isAdvanced,
  };
};

export const formatUserExtraData = function (
  docIn: DocumentSnapshot<DocumentData>
): UserExtraData {
  let formatted: UserExtraData;
  let dataIn = docIn.data();
  if (dataIn) {
    formatted = {
      isTwoFactorAuth: dataIn.isTwoFactorAuth,
      remoteShare: dataIn.remoteShare,
      bio: dataIn.bio,
    };
  } else {
    formatted = {
      isTwoFactorAuth: false,
      remoteShare: "",
      bio: "",
    };
  }
  return formatted;
};

const formatPhoto = function (docIn: DocumentSnapshot<DocumentData>): string {
  let dataIn = docIn.data();
  let formatted: string;
  if (dataIn) {
    formatted = dataIn.iconPath;
  } else {
    formatted = "";
  }
  return formatted;
};

export const generateStoragePath = function (fileName: string, user: UserDB) {
  return `avatars/${user.uid}/${fileName}`;
};
