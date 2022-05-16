import { User } from 'firebase/auth';
import { createContext, useContext, Context } from 'react'
import { defaultWallet } from '../src/models/defaultWallet';
import { IWallet } from '../src/models/IWallet';
import { defaultUser, UserDB } from '../src/models/user';
import { useKryptikAuth } from '../src/helpers/kryptikAuthHelper';
import Web3Service from '../src/services/Web3Service';


const kryptikAuthContext = createContext({
  kryptikService: new Web3Service(),
	kryptikWallet: defaultWallet,
	setKryptikWallet: (newWallet:IWallet) => {},
  // auth db funcs and vals
  authUser: defaultUser,
  loading: true,
  signInWithToken: async (token:string) => {},
  updateCurrentUserKryptik: async(user:UserDB) => {},
  getUserPhotoPath: (user:UserDB):string => {return ""},
  signOut: ()=>{}
});

export function KryptikAuthProvider(props:any) {
  const {value, children} = props
  const auth = useKryptikAuth();
  return <kryptikAuthContext.Provider value={auth}>{children}</kryptikAuthContext.Provider>;
}
// custom hook to use the authUserContext and access authUser and loading
export const useKryptikAuthContext = () => useContext(kryptikAuthContext);