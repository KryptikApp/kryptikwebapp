import type { NextPage } from "next";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  AiOutlineEye,
  AiOutlineEyeInvisible,
  AiFillCheckCircle,
  AiOutlineCopy,
} from "react-icons/ai";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";

import { useKryptikAuthContext } from "../../components/KryptikAuthProvider";
import Divider from "../../components/Divider";
import NavProfile from "../../components/navbars/NavProfile";
import { WalletStatus } from "../../src/models/KryptikWallet";
import { getSeedPhrase } from "../../src/helpers/wallet";
import LockWalletModal from "../../components/wallet/LockWalletModal";

const Security: NextPage = () => {
  const { authUser, loadingAuthUser, kryptikWallet, walletStatus } =
    useKryptikAuthContext();
  const router = useRouter();
  // ROUTE PROTECTOR: Listen for changes on loadingAuthUser and authUser, redirect if needed
  useEffect(() => {
    if (!loadingAuthUser && (!authUser || !authUser.isLoggedIn))
      router.push("/");
  }, [authUser, loadingAuthUser]);

  const [isVisible, setIsVisible] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleIsVisibleToggle = function () {
    setIsVisible(!isVisible);
  };

  const handleIsCopiedToggle = function () {
    // copy seedphrase to clipboard
    const seedPhrase = getSeedPhrase(kryptikWallet);
    if (!seedPhrase) {
      toast.error(
        "Your seed phrase is not available. Make sure your wallet is connected."
      );
      return;
    }
    navigator.clipboard.writeText(seedPhrase);
    if (!isCopied) {
      // update copy state
      setIsCopied(true);
    }
  };

  return (
    <div>
      <div className="h-[2rem]">
        {/* padding div for space between top and main elements */}
      </div>
      <Toaster />

      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold sans mb-5 dark:text-white">
          Security
        </h1>
        <Divider />
        {walletStatus == WalletStatus.Connected && (
          <div>
            <h2 className="text-xl text-red-600 font-bold sans mb-2">
              Your Recovery Phrase
              {isVisible ? (
                <AiOutlineEye
                  className="inline ml-3 hover:cursor-pointer"
                  size="22"
                  onClick={() => handleIsVisibleToggle()}
                />
              ) : (
                <AiOutlineEyeInvisible
                  className="inline ml-3 hover:cursor-pointer"
                  size="22"
                  onClick={() => handleIsVisibleToggle()}
                />
              )}
            </h2>
            <p className="text-slate-500 text-sm mb-5 dark:text-slate-300">
              Save these 12 words in a safe place. Do not share them with
              anyone, even Kryptik. Anyone with your recovery phrase can steal
              your funds.
            </p>
            <textarea
              disabled
              className={`${
                !isVisible && "blur-sm"
              } mb-4 bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-4 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-400`}
              value={getSeedPhrase(kryptikWallet) || ""}
            ></textarea>
            {isCopied ? (
              <p
                className="font-bold text-green-600 hover:cursor-pointer"
                onClick={() => handleIsCopiedToggle()}
              >
                <AiFillCheckCircle className="inline mr-3" />
                Copied to Clipboard
              </p>
            ) : (
              <p
                className="dark:text-white hover:cursor-pointer"
                onClick={() => handleIsCopiedToggle()}
              >
                <AiOutlineCopy className="inline mr-3" />
                Copy to clipboard
              </p>
            )}
            <LockWalletModal />
          </div>
        )}

        {walletStatus == WalletStatus.OutOfSync && (
          <div className="text-slate-500 text-sm mb-5 dark:text-slate-300">
            <p>
              Please{" "}
              <span className="text-sky-500 dark:text-sky-400 font-semibold">
                sync
              </span>{" "}
              your wallet to view your seed phrase.
            </p>
          </div>
        )}

        {walletStatus == WalletStatus.Locked && (
          <div className="text-slate-500 mb-5 dark:text-slate-300 text-xl">
            <p>
              Your wallet is locked. To unlock your wallet, go{" "}
              <span className="text-green-500">
                <Link href="/">here</Link>
              </span>
              .
            </p>
          </div>
        )}
      </div>

      <div className="h-[7rem]">
        {/* padding div for space between top and main elements */}
      </div>
      <NavProfile />
    </div>
  );
};

export default Security;
