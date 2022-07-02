import {Magic} from '@magic-sdk/admin'
import { NextApiRequest, NextApiResponse } from 'next';
import * as jose from "jose"
import * as crypto from "crypto"

type Data = {
  done:boolean,
  dbToken?:string
}

// basic login routine
export default async( req: NextApiRequest, res: NextApiResponse<Data> )=>
{
    console.log("Login hit!");
    if (req.method !== 'POST') return res.status(405).end()
    // make sure we have access to a magic secret key
    let  magicSecretKey:string = process.env.MAGIC_SECRET_KEY? process.env.MAGIC_SECRET_KEY: "not set";
    if(magicSecretKey == "not set"){
      res.status(401).send({ done: true });
    }
    // ensure the did token was passed along
    let authHeader:string = req.headers.authorization? req.headers.authorization: "not set";
    if(authHeader == "not set"){
      res.status(401).send({ done: true });
    }
    const magic = new Magic(magicSecretKey);
    // retrieve did token from auth. header
    const didToken = magic.utils.parseAuthorizationHeader(authHeader);
    // ensure token is correct
    magic.token.validate(didToken);
    // get user metadata from didtoken
    const { email, issuer } = await magic.users.getMetadataByToken(didToken);
    // ensure the auid was passed along 
    let uid:string = email?email:"not set";
    if(issuer == "not set"){
      res.status(401).send({ done: true });
    }
    // create custom token
    let customToken = await createCustomFirebaseToken(uid);
    // return success status
    res.status(200).json({ done: true,  dbToken: customToken})
  }

// creates custom token for firebase auth 
const createCustomFirebaseToken = async(uid:string):Promise<string> => {
  console.log("Creating custom firebase token....");
  // let arrayKey:Uint8Array = pemToArray(firebaseserviceKey.private_key);
  if(!process.env.FIREBASE_PRIVATE_KEY) throw(new Error("Error: Firebase private key not provided. Unable to create custom database token."));
  if(!process.env.FIREBASE_CLIENT_EMAIL) throw(new Error("Error: Firebase client email not provided. Unable to create custom database token."));
  let keyObj = crypto.createPrivateKey(process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'));
  // create jwt
  const jwt = await new jose.SignJWT({ 'uid': uid })
  .setProtectedHeader({ alg: 'RS256' })
  .setIssuedAt()
  .setSubject(process.env.FIREBASE_CLIENT_EMAIL)
  .setIssuer(process.env.FIREBASE_CLIENT_EMAIL)
  .setAudience('https://identitytoolkit.googleapis.com/google.identity.identitytoolkit.v1.IdentityToolkit')
  .setExpirationTime('1h')
  .sign(keyObj);
  return jwt;
}
