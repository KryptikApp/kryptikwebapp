import { User } from 'firebase/auth';
import { createContext, useContext, Context } from 'react'
import { useFirebaseAuth } from '../src/helpers/firebaseHelper';


const authUserContext = createContext({
  // dummy var for auth user
  authUser: {uid:"not set", email: "not set"},
  loading: true,
  signInWithToken: async (token:string) => {},
  updateCurrentUserKryptik: async(user:User) => {}
});

export function AuthUserProvider(props:any) {
  const {value, children} = props
  const auth = useFirebaseAuth();
  return <authUserContext.Provider value={auth}>{children}</authUserContext.Provider>;
}
// custom hook to use the authUserContext and access authUser and loading
export const useAuthContext = () => useContext(authUserContext);