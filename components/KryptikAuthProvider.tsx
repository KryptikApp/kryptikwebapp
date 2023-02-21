import { createContext, useContext } from "react";
import SignClient from "@walletconnect/sign-client";

import { defaultWallet } from "../src/models/defaultWallet";
import { UserDB } from "../src/models/user";
import { useKryptikAuth } from "../src/helpers/kryptikAuthHelper";
import Web3Service from "../src/services/Web3Service";
import { IWallet, WalletStatus } from "../src/models/KryptikWallet";
import HDSeedLoop from "hdseedloop";

interface IAuthContext {
  kryptikService: Web3Service;
  kryptikWallet: IWallet;
  // auth db funcs and vals
  authUser: UserDB | null;
  loadingAuthUser: boolean;
  loadingWallet: boolean;
  signInWithToken: (
    token: string,
    email: string,
    seed?: string,
    isRefresh?: boolean
  ) => Promise<boolean>;
  updateCurrentUserKryptik: (user: UserDB) => void;
  walletStatus: WalletStatus;
  updateWalletStatus: (newStatus: WalletStatus) => void;
  updateWallet: (seedloop: HDSeedLoop) => void;
  refreshUserAndWallet: () => void;
  refreshBalances: (wallet?: IWallet) => void;
  signOut: () => void;
  signClient: SignClient | null;
}

const kryptikAuthContext = createContext<IAuthContext>({
  kryptikService: new Web3Service(),
  kryptikWallet: defaultWallet,
  // auth db funcs and vals
  authUser: null,
  loadingAuthUser: false,
  loadingWallet: false,
  signInWithToken: async (
    token: string,
    email: string,
    seed?: string,
    isRefresh?: boolean
  ) => true,
  updateCurrentUserKryptik: async (user: UserDB) => {},
  signClient: null,
  signOut: () => {},
  refreshUserAndWallet: () => {},
  refreshBalances: (wallet?: IWallet) => {},
  walletStatus: defaultWallet.status,
  updateWalletStatus: (newStatus: WalletStatus) => {},
  updateWallet: (seedloop: HDSeedLoop) => {},
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
