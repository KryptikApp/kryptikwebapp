import { Magic } from "magic-sdk";
import { useKryptikAuthContext } from "../../../components/KryptikAuthProvider";


export interface ILoginUserParams{
    email:string, 
    signInWithTokenFunc:(token:string, seed?:string, isRefresh?:boolean) => void, 
    seed?:string, 
    progressFunc?:(msg:string, progress?:number)=>void, 
    isRefresh?:boolean
}

export const loginUser = async (params:ILoginUserParams) => {
    const {email, signInWithTokenFunc, seed, progressFunc, isRefresh} = {...params}
    /* Step 4.1: Generate a DID token with Magic */
    let magicKey:string = process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY? process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY : "";
    const magic = new Magic(magicKey)
    if(progressFunc){
        progressFunc("Fetching authentication token.")
    }
    const didToken = await magic.auth.loginWithMagicLink({ email });
    if(progressFunc){
        progressFunc("Authenticating with server.")
    }

    // hitting login API
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${didToken}`
      },
      body: JSON.stringify({ email })
    })
  
    if (res.status === 200) {
      if(progressFunc){
        progressFunc("Connecting wallet on device.")
      }
      let resDecoded = await res.json();
      let customTokenDB:string = resDecoded.dbToken;
      await signInWithTokenFunc(customTokenDB, seed, isRefresh);
      // If we reach this line, it means our
      // authentication succeeded, so we'll
      // redirect to the home page!
    } 
    else {
      throw(new Error(await res.text()))
    }
}