import { NextPage } from "next";
import { useState } from "react";
import toast from "react-hot-toast";
import { updateVaultSeedloop } from "../../src/handlers/wallet/vaultHandler";
import { getRemoteShare } from "../../src/helpers/shares";
import { WalletStatus } from "../../src/models/KryptikWallet";
import { useKryptikAuthContext } from "../KryptikAuthProvider";

const UnlockWalletCard: NextPage = () => {
  const {
    kryptikWallet,
    authUser,
    loadingAuthUser,
    loadingWallet,
    walletStatus,
    updateWalletStatus,
  } = useKryptikAuthContext();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUnlockWallet = async function () {
    if (!authUser) {
      toast.error("You must be logged in to lock your wallet.");
      return;
    }
    setLoading(true);
    if (walletStatus == WalletStatus.Connected) {
      toast.success("Your wallet is already unlocked.");
      setLoading(false);
      return;
    }
    if (walletStatus == WalletStatus.OutOfSync) {
      toast.error("Your wallet is out of sync.");
      setLoading(false);
      return;
    }
    if (walletStatus == WalletStatus.Disconected) {
      toast.error("Your wallet is disconnected. Unable to unlock.");
      setLoading(false);
      return;
    }
    try {
      let unlocked = kryptikWallet.seedLoop.unlock(password);
      if (unlocked) {
        // update persistent wallet in vault
        let remoteShare: string | null = await getRemoteShare();
        if (remoteShare) {
          updateVaultSeedloop(authUser.uid, remoteShare, kryptikWallet);
        } else {
          toast.error(
            "Unable to persist changes. Your wallet will stil be locked for the remainder of your session."
          );
        }
        updateWalletStatus(WalletStatus.Connected);
        toast.success("Your wallet is unlocked!");
      } else {
        toast.error("Password incorrect.");
      }
    } catch (e) {
      console.warn(e);
      toast.error(
        "Error encountered while unlocking your wallet. Please contact support."
      );
    }
    setLoading(false);
  };
  return (
    <div className="flex flex-col my-6">
      <h1 className="font-semibold text-lg mb-2 text-slate-900 dark:text-slate-100">
        Unlock Wallet
      </h1>
      <input
        type="password"
        className="bg-gray-200 dark:bg-gray-700 appearance-none border border-gray-200 rounded w-full py-3 px-4 text-gray-800 dark:text-white leading-tight focus:outline-none focus:bg-white focus:border-sky-400 dark:focus:border-sky-500 text-xl"
        id="inline-full-name"
        placeholder="Enter your password"
        required
        onChange={(e) => setPassword(e.target.value)}
      />
      <div className="mt-4 text-right float-right">
        <button
          onClick={() => handleUnlockWallet()}
          className="bg-transparent hover:bg-green-500 text-green-500 font-semibold hover:text-white py-2 px-4 border border-green-500 hover:border-transparent rounded"
          disabled={loading}
        >
          {!loading ? (
            "Unlock"
          ) : (
            <svg
              role="status"
              className="inline w-4 h-4 ml-3 text-white animate-spin"
              viewBox="0 0 100 101"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                fill="#E5E7EB"
              />
              <path
                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                fill="currentColor"
              />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

export default UnlockWalletCard;
