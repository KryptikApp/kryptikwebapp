import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

// Set the configuration for your app
// TODO: Replace with your app's config object
const firebaseConfig = {
    apiKey: "AIzaSyDteiaEmGr_mvfCfK8JC1tg36pLAajx_IA",
    authDomain: "devshop-6912a.firebaseapp.com",
    projectId: "devshop-6912a",
    storageBucket: "devshop-6912a.appspot.com",
    messagingSenderId: "838099119197",
    appId: "1:838099119197:web:d6738cb67784393c3531b4",
    measurementId: "G-0H039MGES6"
};
const firebaseApp = initializeApp(firebaseConfig);

// Get a reference to the storage service, which is used to create references in your storage bucket
const storage = getStorage(firebaseApp);
  
  export  {
    storage, firebaseApp as default
  }
