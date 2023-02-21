// helps with integrating web3service into app. context
import { useCallback, useEffect, useRef, useState } from "react";
import SignClient from "@walletconnect/sign-client";
import { SignClientTypes } from "@walletconnect/types/dist/types/sign-client";

import { defaultWallet } from "../models/defaultWallet";
import { UserDB } from "../models/user";
import Web3Service from "../services/Web3Service";
import { IWallet, WalletStatus } from "../models/KryptikWallet";
import { ConnectWalletLocalandRemote } from "./wallet";
import { NetworkDb } from "../services/models/network";
import { createSignClient } from "../handlers/connect/walletConnect";
import ModalStore from "../handlers/store/ModalStore";
import { signingMethods } from "../handlers/connect/types";
import { getActiveUser, updateProfile } from "./user";
import { handleApprove, logout } from "./auth";
import { updateVaultName } from "../handlers/wallet/vaultHandler";
import { getAddressForNetworkDb } from "./utils/accountUtils";
import { IFetchAllBalancesParams } from "./balances";
import HDSeedLoop, { NetworkFromTicker } from "hdseedloop";

export function useKryptikAuth() {
  //create service
  let initServiceState: Web3Service = new Web3Service();
  // init state
  const [kryptikService, setKryptikService] = useState(initServiceState);
  const [kryptikWallet, setKryptikWallet] = useState(defaultWallet);
  const [walletStatus, setWalletStatus] = useState(defaultWallet.status);
  const [authUser, setAuthUser] = useState<UserDB | null>(null);
  const [loadingAuthUser, setLoadingAuthUser] = useState<boolean>(false);
  const [loadingWallet, setLoadingWallet] = useState<boolean>(false);
  const [signClient, setSignClient] = useState<SignClient | null>(null);
  const [walletConnectInitialized, setWalletConnectInitialized] =
    useState(false);
  const authWorker = useRef<Worker>();

  // update standard firestore user's profile
  async function updateCurrentUserKryptik(user: UserDB) {
    console.log("Updatiing user profile...");
    try {
      await updateProfile(user);
    } catch (e) {
      console.warn("Unable to update profile");
    }
  }

  const updateWalletStatus = function (newWalletStatus: WalletStatus) {
    kryptikWallet.status = newWalletStatus;
    setWalletStatus(newWalletStatus);
  };

  // sign in with external auth token
  // TODO: UPDATE TO REMOVE DEPENDANCY ON EMAIL
  async function signInWithToken(
    token: string,
    email: string,
    seed?: string
  ): Promise<boolean> {
    const approved = await handleApprove(email, token);
    if (!approved) return false;
    setLoadingAuthUser(true);
    const user: UserDB | null = await getActiveUser();
    setAuthUser(user);
    if (!user) {
      console.log("No user available. Running clear...");
      clear();
      return false;
    }
    // begin update, but don't wait...
    updateAuthContext(user, seed);
    return true;
  }

  async function refreshUserAndWallet() {
    const user: UserDB | null = await getActiveUser();
    if (!user) {
      console.log("No user available.");
      return;
    } else {
      updateAuthContext(user);
    }
  }

  const updateAuthContext = async (user: UserDB, seed?: string) => {
    // update loading state
    setLoadingAuthUser(true);
    setLoadingWallet(true);
    const formattedUser: UserDB = user;
    // start web3 kryptik service
    const ks = await kryptikService.StartSevice();
    setKryptikService(ks);
    let newWalletKryptik: IWallet;
    // get networks to add to seedloop
    const networksToAdd: NetworkDb[] = ks.getAllNetworkDbs(true);
    const uid: string = formattedUser.uid;
    // migrate legacy vault versions
    updateVaultName(formattedUser);
    // connect with provided seed
    if (seed && seed != "") {
      const connectionObject = await ConnectWalletLocalandRemote({
        uid: uid,
        seed: seed,
        networksToAdd: networksToAdd,
      });
      newWalletKryptik = connectionObject.wallet;
    }
    // otherwise new seed will be generated
    else {
      const connectionObject = await ConnectWalletLocalandRemote({
        uid: uid,
        networksToAdd: networksToAdd,
      });
      newWalletKryptik = connectionObject.wallet;
    }
    refreshBalances(newWalletKryptik);
    // set data
    setKryptikWallet(newWalletKryptik);
    setWalletStatus(newWalletKryptik.status);
    setAuthUser(formattedUser);
    setLoadingAuthUser(false);
    setLoadingWallet(false);
  };

  function refreshBalances(wallet?: IWallet) {
    const walletToCheck: IWallet = wallet ? wallet : kryptikWallet;
    console.log("Running refresh balances....");
    // initialize balances
    const algoNw: NetworkDb | null =
      kryptikService.getNetworkDbByTicker("algo");
    const ethNw: NetworkDb | null = kryptikService.getNetworkDbByTicker("eth");
    const nearNw: NetworkDb | null =
      kryptikService.getNetworkDbByTicker("near");
    const solNw: NetworkDb | null = kryptikService.getNetworkDbByTicker("sol");
    if (algoNw && ethNw && nearNw && solNw && kryptikService.kryptikPrices) {
      // set balance fetch routine
      const balParams: IFetchAllBalancesParams = {
        addresses: {
          eth: getAddressForNetworkDb(walletToCheck, ethNw),
          sol: getAddressForNetworkDb(walletToCheck, solNw),
          near: getAddressForNetworkDb(walletToCheck, nearNw),
          algo: getAddressForNetworkDb(walletToCheck, algoNw),
        },
        isAdvanced: false,
        prices: kryptikService.kryptikPrices,
        networks: kryptikService.NetworkDbs,
        tokens: kryptikService.tokenDbs,
        providers: kryptikService.networkProviders,
      };
      kryptikService.kryptikBalances.refresh(balParams);
    }
  }

  function updateWallet(seedloop: HDSeedLoop) {
    if (!authUser) return;
    // get primary ethereum addreses for kryptik wallet
    let ethNetwork = NetworkFromTicker("eth");
    let etheAddysAll = seedloop.getAddresses(ethNetwork);
    let ethAddyFirst = etheAddysAll[0];

    let newWalletStatus: WalletStatus = seedloop.getIsLocked()
      ? WalletStatus.Locked
      : WalletStatus.Connected;

    // set values for new wallet
    let newKryptikWallet: IWallet = new IWallet({
      ...defaultWallet,
      walletProviderName: "kryptik",
      status: newWalletStatus,
      seedLoop: seedloop,
      resolvedEthAccount: { address: ethAddyFirst, isResolved: false },
      uid: authUser.uid,
    });
    setKryptikWallet(newKryptikWallet);
    refreshBalances(newKryptikWallet);
  }

  function signOut() {
    logout().then(() => {
      clear();
    });
  }

  // clear current kryptik web 3 service state
  const clear = () => {
    setAuthUser(null);
    setKryptikWallet(defaultWallet);
    setKryptikService(new Web3Service());
    setWalletStatus(defaultWallet.status);
    setLoadingAuthUser(false);
    setLoadingWallet(false);
  };

  /******************************************************************************
   * WC: Open request handling modal based on method that was used
   *****************************************************************************/
  const onSessionRequest = useCallback(
    async (requestEvent: SignClientTypes.EventArguments["session_request"]) => {
      console.log("session_request", requestEvent);
      const { topic, params } = requestEvent;
      const { request } = params;
      // ensure sign client is defined
      if (!signClient) return;
      const requestSession = signClient.session.get(topic);
      switch (request.method) {
        case signingMethods.ETH_SIGN:
        case signingMethods.PERSONAL_SIGN:
          return ModalStore.open("SessionSignModal", {
            requestEvent,
            requestSession,
          });

        case signingMethods.ETH_SIGN_TYPED_DATA:
        case signingMethods.ETH_SIGN_TYPED_DATA_V3:
        case signingMethods.ETH_SIGN_TYPED_DATA_V4:
          return ModalStore.open("SessionSignTypedDataModal", {
            requestEvent,
            requestSession,
          });

        case signingMethods.ETH_SEND_TRANSACTION:
        case signingMethods.ETH_SIGN_TRANSACTION:
          return ModalStore.open("SessionSendTransactionModal", {
            requestEvent,
            requestSession,
          });

        case signingMethods.SOLANA_SIGN_MESSAGE:
        case signingMethods.SOLANA_SIGN_TRANSACTION:
          return ModalStore.open("SessionSignModal", {
            requestEvent,
            requestSession,
          });

        case signingMethods.NEAR_SIGN_IN:
        case signingMethods.NEAR_SIGN_OUT:
        case signingMethods.NEAR_SIGN_TRANSACTION:
        case signingMethods.NEAR_SIGN_AND_SEND_TRANSACTION:
        case signingMethods.NEAR_SIGN_TRANSACTIONS:
        case signingMethods.NEAR_SIGN_AND_SEND_TRANSACTIONS:
        case signingMethods.NEAR_VERIFY_OWNER:
          return ModalStore.open("SessionSignModal", {
            requestEvent,
            requestSession,
          });

        default:
          return ModalStore.open("SessionUnsuportedMethodModal", {
            requestEvent,
            requestSession,
          });
      }
    },
    []
  );
  /******************************************************************************
   * WC: Open session proposal modal for confirmation / rejection
   *****************************************************************************/
  const onSessionProposal = useCallback(
    (proposal: SignClientTypes.EventArguments["session_proposal"]) => {
      console.log("PROPOSAL REQUESTED");
      ModalStore.open("SessionProposalModal", { proposal });
    },
    []
  );

  async function initializeSignClient() {
    const newSignClient: SignClient = await createSignClient();
    // set up event listners
    if (newSignClient) {
      console.log("Attaching wc event listners.");
      newSignClient.on("session_proposal", onSessionProposal);
      newSignClient.on("session_request", onSessionRequest);
      // TODOs
      newSignClient.on("session_ping", (data: any) =>
        console.log("ping", data)
      );
      newSignClient.on("session_event", (data: any) =>
        console.log("event", data)
      );
      newSignClient.on("session_update", (data: any) =>
        console.log("update", data)
      );
      newSignClient.on("session_delete", (data: any) =>
        console.log("delete", data)
      );
    }
    setSignClient(newSignClient);
  }

  useEffect(() => {
    // add auth web worker
    authWorker.current = new Worker(new URL("/authWorker.ts", import.meta.url));

    // should fire once upon refresh
    authWorker.current.onmessage = (event: MessageEvent<boolean>) => {
      if (event.data) {
        refreshUserAndWallet();
      }
    };
    // run balance refresh every 5 minutes
    setInterval(refreshBalances, 300000);
  }, []);

  return {
    authUser,
    loadingAuthUser,
    loadingWallet,
    refreshUserAndWallet,
    refreshBalances,
    signInWithToken,
    updateCurrentUserKryptik,
    signOut,
    kryptikService,
    kryptikWallet,
    walletStatus,
    updateWalletStatus,
    updateWallet,
    signClient,
    clear,
  };
}
