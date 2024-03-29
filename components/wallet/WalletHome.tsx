import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { useKryptikAuthContext } from "../../components/KryptikAuthProvider";
import ListBalance from "../../components/lists/ListBalance";
import { ColorEnum } from "../../src/helpers/utils";
import { WalletStatus } from "../../src/models/KryptikWallet";
import { ServiceState } from "../../src/services/types";
import LoadingSpinner from "../loadingSpinner";
import Button from "../buttons/Button";
import ActionBar from "./ActionBar";
import UnlockWalletCard from "./UnlockWalletCard";
import HeaderProfile from "../profiles/HeaderProfile";

const WalletHome: NextPage = () => {
  const { walletStatus, kryptikService, loadingWallet } =
    useKryptikAuthContext();
  const [progressionValid, setProgressionValid] = useState(false);
  // ROUTE PROTECTOR: Listen for changes on loadingAuthUser and authUser, redirect if needed
  const router = useRouter();
  useEffect(() => {
    // if (walletStatus != WalletStatus.Connected) router.push("/");
  }, []);

  const handleStartAddName = function () {
    router.push("../wallet/createName");
  };

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
    <div className="max-w-2xl mx-auto">
      <div className="h-[2rem]">
        {/* padding div for space between top and main elements */}
      </div>
      <div className="text-center w-full content-center mt-8 md:mt-0">
        <HeaderProfile showBio={false} center={true} />
        <ActionBar active={progressionValid} />
      </div>

      <div className="w-full">
        {progressionValid && <ListBalance />}
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

      <div className="min-h-[10vh]">
        {/* spacefiller between content and bottom of the screen */}
      </div>
    </div>
  );
};

export default WalletHome;
