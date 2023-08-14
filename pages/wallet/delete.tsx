import type { NextPage } from "next";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { useKryptikAuthContext } from "../../components/KryptikAuthProvider";
import Divider from "../../components/Divider";
import { removeUserAndWallet } from "../../src/helpers/auth";
import toast from "react-hot-toast";

const DeleteWallet: NextPage = () => {
  const { authUser, loadingAuthUser, signInWithToken, signOut } =
    useKryptikAuthContext();
  const router = useRouter();
  // ROUTE PROTECTOR: Listen for changes on loading and authUser, redirect if needed
  useEffect(() => {
    if (!loadingAuthUser && !authUser) router.push("/");
  }, [authUser, loadingAuthUser]);

  const handleDeleteWallet = async function () {
    try {
      // delete user and local wallet
      await removeUserAndWallet();
      signOut();
      // set wallet to default

      toast.success("Wallet deleted.");
      router.push("/");
    } catch (e) {
      toast.error(
        "Error: Unable to delete wallet. Please contact the Kryptik team."
      );
    }
  };

  return (
    <div>
      <div className="h-[2rem]">
        {/* padding div for space between top and main elements */}
      </div>

      <div className="lg:px-[30%]">
        <h1 className="text-4xl font-bold sans mb-5 dark:text-white">
          Delete Wallet
        </h1>
        <Divider />
        <p className="mb-2 text-red-600">
          <span className="font-semibold">Warning:</span> Once you delete your
          wallet there will be no way for Kryptik to recover your funds. Please
          make sure you have your secret key stored in a safe place.
        </p>
        <div>
          <Divider />
          <p className="text-slate-500 text-sm">
            Note: You may be asked to login again.
          </p>
          <button
            onClick={() => handleDeleteWallet()}
            className="bg-red-500 hover:bg-red-700 text-white font-semibold py-2 px-4 border border-red-500 hover:border-transparent rounded my-5"
          >
            Delete Wallet
          </button>
        </div>
      </div>

      <div className="h-[7rem]">
        {/* padding div for space between top and main elements */}
      </div>
    </div>
  );
};

export default DeleteWallet;
