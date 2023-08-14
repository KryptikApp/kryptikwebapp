import { NextPage } from "next";
import { useEffect, useState } from "react";
import { WalletStatus } from "../../src/models/KryptikWallet";
import { NetworkDb } from "../../src/services/models/network";
import Divider from "../Divider";
import { useKryptikAuthContext } from "../KryptikAuthProvider";
import NetworkAddress from "../networks/NetworkAddress";
import NetworkAddressLoader from "../networks/NetworkAddressLoader";
import Link from "next/link";
import AccountActions from "./AcountActions";
import ListItemBalance from "../lists/ListItemBalance";
import ListBalance from "../lists/ListBalance";
import LoadingSpinner from "../loadingSpinner";
import router from "next/router";
import { ColorEnum } from "../../src/helpers/utils";
import Button from "../buttons/Button";
import UnlockWalletCard from "./UnlockWalletCard";
import { ServiceState } from "../../src/services/types";

export enum AccountView {
  Addresses = "Addresses",
  Balances = "Balances",
}
const AccountsCard: NextPage = () => {
  const { kryptikService, loadingWallet, walletStatus } =
    useKryptikAuthContext();
  const [networksToShow, setNetworksToShow] = useState<NetworkDb[]>([]);
  const [accountView, setAccountView] = useState<AccountView>(
    AccountView.Addresses
  );
  useEffect(() => {
    let newNetworks: NetworkDb[] = kryptikService.getAllNetworkDbs();
    setNetworksToShow(newNetworks);
  }, [loadingWallet]);

  function handleViewChange(view: AccountView) {
    setAccountView(view);
  }
  return (
    <div className="max-w-lg max-h-screen ring-1 ring-gray-500/10 hover:ring-sky-400/50 dark:text-white border border-gray-400 dark:border-gray-500 pt-10 pb-8 mx-auto px-4 my-auto rounded rounded-xl bg-gradient-to-r from-green-400/10 to-gray-500/10 background-animate transition duration-500">
      <div>
        {accountView == AccountView.Addresses && <AddressView />}
        {accountView == AccountView.Balances && <BalanceView />}
        {!loadingWallet && walletStatus == WalletStatus.Connected && (
          <div className="mt-6">
            <AccountActions
              accountView={accountView}
              handleViewSwitch={handleViewChange}
            />
          </div>
        )}
        {loadingWallet && (
          <div className="mt-6 animate-pulse bg-slate-400 w-[304px] h-[62px] rounded-full mx-auto"></div>
        )}
        {!loadingWallet && walletStatus == WalletStatus.OutOfSync && (
          <Link href="../sync">
            <div className="mt-6 border border-slate-400 hover:border-blue-400 bg-blue-400 hover:bg-blue-500 text-white w-[304px] h-[62px] rounded-full mx-auto text-center">
              <p className="mt-[14px] text-xl font-semibold">Sync</p>
            </div>
          </Link>
        )}
        {!loadingWallet && walletStatus == WalletStatus.Locked && (
          <Link href="../sync">
            <div className="mt-6 border border-slate-400 hover:border-blue-400 bg-blue-400 hover:bg-blue-500 text-white w-[304px] h-[62px] rounded-full mx-auto text-center">
              <p className="mt-[14px] text-xl font-semibold">Unlock</p>
            </div>
          </Link>
        )}
      </div>
    </div>
  );
};

export default AccountsCard;

function AddressView() {
  const { kryptikService, loadingWallet, walletStatus } =
    useKryptikAuthContext();
  const [networksToShow, setNetworksToShow] = useState<NetworkDb[]>([]);
  useEffect(() => {
    let newNetworks: NetworkDb[] = kryptikService.getAllNetworkDbs();
    setNetworksToShow(newNetworks);
  }, [loadingWallet]);
  return (
    <div>
      <p className="text-2xl font-semibold text-left">Accounts</p>
      <p className="text-lg text-gray-500 text-left">
        The network addresses associated with your wallet.
      </p>
      <Divider />
      <div
        className={`relative overflow-y-auto max-h-[45vh] h-[45vh] no-scrollbar bg-gradient-to-b from-gray-100 dark:to-sky-500/40 dark:from-gray-900 dark:to-gray-400/40 mx-2 rounded-lg py-1`}
      >
        {!loadingWallet && walletStatus == WalletStatus.Connected && (
          <div className="flex flex-col space-y-2 mx-auto">
            {networksToShow.map((n) => (
              <NetworkAddress networkDb={n} key={n.fullName} />
            ))}
          </div>
        )}
        {loadingWallet && (
          <div className="flex flex-col space-y-2 mx-auto">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <NetworkAddressLoader key={n} />
            ))}
          </div>
        )}
        {!loadingWallet && walletStatus == WalletStatus.OutOfSync && (
          <div className="text-center mt-[20vh] px-2">
            <p>Sync wallet to begin.</p>
            <p className="text-gray-500 text-md">
              Connect to your primary device in under 60 seconds.
            </p>
          </div>
        )}
        {!loadingWallet && walletStatus == WalletStatus.Locked && (
          <div className="text-center mt-[20vh] px-2">
            <p>Unlock wallet to begin.</p>
            <p className="text-gray-500 text-md">
              Your password is required to unencrypt your secure vault.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function BalanceView() {
  const { kryptikService, loadingWallet, walletStatus } =
    useKryptikAuthContext();

  const [progressionValid, setProgressionValid] = useState(false);

  useEffect(() => {
    if (
      walletStatus == WalletStatus.Connected &&
      kryptikService.serviceState == ServiceState.started
    ) {
      setProgressionValid(true);
    } else {
      setProgressionValid(false);
    }
  }, [walletStatus]);
  return (
    <div>
      <p className="text-2xl font-semibold text-left">Net Worth</p>
      <p className="text-lg text-gray-500 text-left">
        Your token balances aggregated across networks.
      </p>
      <Divider />
      <div className="">
        <div
          className={`relative overflow-y-auto max-h-[45vh] min-h-45vh h-[45vh] no-scrollbar bg-gradient-to-b from-gray-100 dark:to-sky-500/40 dark:from-gray-900 dark:to-gray-400/40 mx-2 rounded-lg`}
        >
          {progressionValid && <ListBalance fullHeight={true} />}
          {loadingWallet && (
            <div className="flex flex-row space-x-2 text-slate-900 dark:text-slate-100 font-semibold text-xl">
              <p>Unlocking Wallet</p>
              <LoadingSpinner />
            </div>
          )}
          {walletStatus == WalletStatus.Locked && <UnlockWalletCard />}
          {walletStatus == WalletStatus.OutOfSync && (
            <div className="flex flex-col space-y-1 text-black dark:text-white">
              <h1 className="font-semibold text-left text-xl text-slate-900 dark:text-slate-100">
                Sync Your Wallet
              </h1>
              <p className="text-lg">
                Approve your new device. This will take less than 60 seconds.
              </p>
              <Button
                text={"Sync"}
                expand={false}
                color={ColorEnum.blue}
                clickHandler={() => {
                  router.push("../sync");
                }}
              />
            </div>
          )}
          {progressionValid && walletStatus == WalletStatus.Disconected && (
            <div>
              <h1 className="font-semibold text-left text-xl text-red-500">
                Connection Failure
              </h1>
              <p className="text-lg">
                We failed to recover your wallet. Please contact support.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
