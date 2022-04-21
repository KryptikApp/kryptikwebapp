import { BigNumber, ethers } from "ethers"; 
import * as jose from "jose"
import { Web3Provider } from "@ethersproject/providers";
import HDSeedLoop, { HDKeyring, Network, NetworkFamily} from "hdseedloop"
import Web3Service from "./../services/Web3Service";
import { firebaseConfig, firebaseserviceKey } from "../../secrets";
import { arrayify } from "ethers/lib/utils";




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
  const jwt = await new jose.SignJWT({ 'uid': uid })
  .setProtectedHeader({ alg: 'RS256' })
  .setIssuedAt()
  .setSubject('kryptikapp@gmail.com')
  .setIssuer('kryptikapp@gmail.com')
  .setAudience('https://identitytoolkit.googleapis.com/google.identity.identitytoolkit.v1.IdentityToolkit')
  .setExpirationTime('1h')
  .sign(arrayify(firebaseserviceKey.private_key));
  return jwt;
}


