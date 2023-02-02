import { NextPage } from "next";
import { useState } from "react";
import toast from "react-hot-toast";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { updateVaultSeedloop } from "../../src/handlers/wallet/vaultHandler";
import { getRemoteShare } from "../../src/helpers/shares";
import { WalletStatus } from "../../src/models/KryptikWallet";
import { UserExtraData } from "../../src/models/user";
import { useKryptikAuthContext } from "../KryptikAuthProvider";

const LockWalletCard: NextPage = () => {
  const { authUser, kryptikWallet, updateWalletStatus } =
    useKryptikAuthContext();
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLockWallet = async function () {
    if (kryptikWallet.status != WalletStatus.Connected) return;
    if (!authUser) {
      toast.error("You must be logged in to lock your wallet.");
      return;
    }
    // make sure password has length
    if (password.length < 4) {
      toast.error("Please enter a longer password.");
      return;
    }
    setLoading(true);
    try {
      kryptikWallet.seedLoop.addPassword(password);
      kryptikWallet.seedLoop.lock();
      let isWalletLocked = kryptikWallet.seedLoop.getIsLocked();
      // lock successful...update state
      if (isWalletLocked) {
        // update persistent wallet in vault
        let remoteShare: string | null = await getRemoteShare();
        if (remoteShare) {
          updateVaultSeedloop(authUser.uid, remoteShare, kryptikWallet);
        } else {
          toast.error(
            "Unable to persist changes. Your wallet will stil be locked for the remainder of your session."
          );
        }
        updateWalletStatus(WalletStatus.Locked);
        toast.success("Your wallet is locked!");
      }
    } catch (e) {
      toast.error("Unable to lock your wallet. Please contact support.");
      console.warn(e);
    }
    setLoading(false);
  };

  return (
    <div
      id="lockWalletCard"
      className="mx-2 border bg-white dark:bg-black rounded px-2 py-2 max-w-xl border-gray-400 dark:border-gray-500 hover:border-gray-600 hover:dark:border-gray-300"
    >
      <div className="flex-col">
        <h2 className="text-2xl font-bold sans text-gray-900 dark:text-gray-100">
          Lock Wallet
        </h2>
      </div>
      {/* lock details */}

      <div className="flex flex-col">
        <div className="mb-4">
          <p className="text-md mb-1 text-justify text-gray-600 dark:text-gray-300">
            Lock your wallet with a password. You will need this password to
            unlock your wallet the next time you make a transaction.
          </p>
        </div>
        <div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className="bg-gray-200 dark:bg-gray-700 appearance-none border border-gray-200 dark:border-gray-800 rounded w-full py-3 px-4 text-gray-800 dark:text-white leading-tight focus:outline-none focus:bg-white focus:border-sky-400 dark:focus:border-sky-500 text-xl"
              id="inline-full-name"
              placeholder="Enter your password"
              required
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5">
              {showPassword ? (
                <AiOutlineEyeInvisible
                  size={30}
                  className="text-blue-400 hover:cursor-pointer"
                  onClick={() => setShowPassword(false)}
                />
              ) : (
                <AiOutlineEye
                  size={30}
                  className="text-blue-400 hover:cursor-pointer"
                  onClick={() => setShowPassword(true)}
                />
              )}
            </div>
          </div>

          <p className="text-md text-justify text-gray-400 dark:text-gray-500">
            Kryptik does not store your password, so it is up to you to store
            your password properly.
          </p>
          <div className="my-4 text-right float-right">
            <button
              onClick={() => handleLockWallet()}
              className="bg-transparent hover:bg-green-500 text-green-500 text-xl font-semibold hover:text-white py-2 px-8 border border-green-500 hover:border-transparent rounded"
              disabled={loading}
            >
              {!loading ? (
                "Lock Wallet"
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
      </div>
    </div>
  );
};

export default LockWalletCard;
