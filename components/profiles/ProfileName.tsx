import { truncateAddress } from "hdseedloop";
import { NextPage } from "next";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  defaultResolvedAccount,
  IResolvedAccount,
  IAccountResolverParams,
} from "../../src/helpers/resolvers/accountResolver";
import { resolveEVMAccount } from "../../src/helpers/resolvers/evmResolver";
import { networkFromNetworkDb } from "../../src/helpers/utils/networkUtils";
import { WalletStatus } from "../../src/models/KryptikWallet";
import { defaultNetworkDb } from "../../src/services/models/network";
import { KryptikProvider } from "../../src/services/models/provider";
import { ServiceState } from "../../src/services/types";
import { useKryptikAuthContext } from "../KryptikAuthProvider";
import { isClientUserValid } from "../../src/helpers/auth";

interface Props {
  account?: string;
}

const ProfileName: NextPage<Props> = (props) => {
  const accountPassedIn = props.account;
  const {
    kryptikWallet,
    kryptikService,
    loadingWallet,
    loadingAuthUser,
    walletStatus,
    authUser,
  } = useKryptikAuthContext();
  const [loadingResolvedAccount, setLoadingResolvedAccount] = useState(true);
  const [resolvedAccount, setResolvedAccount] = useState(
    defaultResolvedAccount
  );
  const [nameToDisplay, setNameToDisplay] = useState("");

  const fetchAccountName = async function () {
    setLoadingResolvedAccount(true);
    let provider: KryptikProvider =
      await kryptikService.getKryptikProviderForNetworkDb(defaultNetworkDb);
    console.log(`account name with: ${accountPassedIn}`);
    // note default networkdb should be eth
    let newResolvedAccount: IResolvedAccount | null = null;
    if (accountPassedIn) {
      let resolverParams: IAccountResolverParams = {
        account: accountPassedIn,
        kryptikProvider: provider,
        networkDB: defaultNetworkDb,
      };
      newResolvedAccount = await resolveEVMAccount(resolverParams);
    } else {
      newResolvedAccount = await kryptikWallet.getResolvedAccount(provider);
      // update shared name state
      kryptikWallet.resolvedEthAccount = newResolvedAccount;
    }

    if (!newResolvedAccount) {
      newResolvedAccount = defaultResolvedAccount;
    }
    // if (
    //   authUser &&
    //   authUser.name &&
    //   !newResolvedAccount.names &&
    //   !accountPassedIn
    // ) {
    //   setNameToDisplay(authUser.name);
    // } else {
    //   setNameToDisplay(
    //     newResolvedAccount.names
    //       ? newResolvedAccount.names[0]
    //       : truncateAddress(
    //           newResolvedAccount.address,
    //           networkFromNetworkDb(defaultNetworkDb)
    //         )
    //   );
    // }
    setNameToDisplay(
      newResolvedAccount.names
        ? newResolvedAccount.names[0]
        : truncateAddress(
            newResolvedAccount.address,
            networkFromNetworkDb(defaultNetworkDb)
          )
    );
    setResolvedAccount(newResolvedAccount);
    setLoadingResolvedAccount(false);
  };

  function handleClickAddy() {
    if (
      loadingWallet ||
      loadingAuthUser ||
      walletStatus != WalletStatus.Connected
    )
      return;
    navigator.clipboard.writeText(kryptikWallet.resolvedEthAccount.address);
    toast.success("Ethereum Address Copied");
  }

  useEffect(() => {
    if (kryptikService.serviceState != ServiceState.started) return;
    if (kryptikService.NetworkDbs.length == 0) return;
    if (loadingAuthUser || !isClientUserValid(authUser)) return;
    fetchAccountName();
  }, [loadingAuthUser, authUser]);
  return (
    <div>
      <div>
        {/* uncomment below for skeleton loader in name position */}

        {!loadingResolvedAccount && (
          <h1
            className="font-semibold dark:text-gray-100 text-gray-900 inline hover:cursor-pointer hover:text-sky-500 dark:hover:text-sky-500"
            onClick={handleClickAddy}
          >
            {nameToDisplay}
          </h1>
        )}
        {loadingResolvedAccount && (
          <div className="w-20 h-4 bg-gray-400 animate-pulse rounded mx-auto"></div>
        )}
      </div>
    </div>
  );
};

export default ProfileName;
