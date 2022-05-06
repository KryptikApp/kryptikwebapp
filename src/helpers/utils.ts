import { ethers } from "ethers"; 
import * as jose from "jose"
import { firebaseserviceKey } from "../../secrets";
import * as crypto from "crypto"




export const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));


export const hexToInt = (s: string) => {
    const bn = ethers.BigNumber.from(s);
    return parseInt(bn.toString());
  };

// reloads app window
export const reloadApp = () => {
  window.location.reload();
};


// creates custom token for firebase auth 
export const createCustomFirebaseToken = async(uid:string):Promise<string> => {
  // let arrayKey:Uint8Array = pemToArray(firebaseserviceKey.private_key);
  let keyObj = crypto.createPrivateKey(firebaseserviceKey.private_key);
  // create jwt
  const jwt = await new jose.SignJWT({ 'uid': uid })
  .setProtectedHeader({ alg: 'RS256' })
  .setIssuedAt()
  .setSubject('firebase-adminsdk-m4jam@kryptikapp-50542.iam.gserviceaccount.com')
  .setIssuer('firebase-adminsdk-m4jam@kryptikapp-50542.iam.gserviceaccount.com')
  .setAudience('https://identitytoolkit.googleapis.com/google.identity.identitytoolkit.v1.IdentityToolkit')
  .setExpirationTime('1h')
  .sign(keyObj);
  return jwt;
}

// helper function that removes line breaks in string
function removeLines(str:string) {
  return str.replace("\n", "");
}

// transforms key in pem form to a uint8array
function pemToArray(pem:string):Uint8Array{
  pem = removeLines(pem);
  pem = pem.replace('-----BEGIN PRIVATE KEY-----', '');
  pem = pem.replace('-----END PRIVATE KEY-----', '');
  let arrayKey:Buffer = Buffer.from(pem, "base64");
  return Uint8Array.from(arrayKey);
}


