import { createContext, useContext } from "react";

import { defaultWallet } from "../src/models/defaultWallet";
import { UserDB } from "../src/models/user";
import { useKryptikAuth } from "../src/helpers/kryptikAuthHelper";
import Web3Service from "../src/services/Web3Service";
import { IWallet, WalletStatus } from "../src/models/KryptikWallet";

interface IAuthContext {
  kryptikService: Web3Service;
  kryptikWallet: IWallet;
  setKryptikWallet: (newWallet: IWallet) => void;
  // auth db funcs and vals
  authUser: UserDB | null;
  loadingAuthUser: boolean;
  loadingWallet: boolean;
  signInWithToken: (token: string, seed?: string, isRefresh?: boolean) => void;
  updateCurrentUserKryptik: (user: UserDB) => void;
  getUserPhotoPath: (user: UserDB) => string;
  walletStatus: WalletStatus;
  updateWalletStatus: (newStatus: WalletStatus) => void;
  signOut: () => void;
}

const kryptikAuthContext = createContext<IAuthContext>({
  kryptikService: new Web3Service(),
  kryptikWallet: defaultWallet,
  setKryptikWallet: (newWallet: IWallet) => {},
  // auth db funcs and vals
  authUser: null,
  loadingAuthUser: false,
  loadingWallet: false,
  signInWithToken: async (
    token: string,
    seed?: string,
    isRefresh?: boolean
  ) => {},
  updateCurrentUserKryptik: async (user: UserDB) => {},
  getUserPhotoPath: (user: UserDB): string => {
    return "";
  },
  signOut: () => {},
  walletStatus: defaultWallet.status,
  updateWalletStatus: (newStatus: WalletStatus) => {},
});

export function KryptikAuthProvider(props: any) {
  const { value, children } = props;
  const auth = useKryptikAuth();
  return (
    <kryptikAuthContext.Provider value={auth}>
      {children}
    </kryptikAuthContext.Provider>
  );
}
// custom hook to use the authUserContext and access authUser and loading
export const useKryptikAuthContext = () => useContext(kryptikAuthContext);
