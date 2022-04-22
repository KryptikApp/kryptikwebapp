import { signInWithCustomToken } from 'firebase/auth';
import {Magic} from '@magic-sdk/admin'
import { NextApiRequest, NextApiResponse } from 'next';
import { firebaseAuth } from '../../src/helpers/firebaseHelper';
import { createCustomFirebaseToken } from '../../src/helpers/utils';

type Data = {
  done:boolean
}

// basic login routine
export default async( req: NextApiRequest, res: NextApiResponse<Data> )=>
{
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
    // use token to sign in with firebase
    let signInCred = await signInWithCustomToken(firebaseAuth, customToken);
    let dbUser = signInCred.user;
    // return success status
    res.status(200).json({ done: true })
  }
