import type { NextPage } from "next";
import { useEffect } from "react";
import { useRouter } from "next/router";

import { useKryptikAuthContext } from "../../components/KryptikAuthProvider";
import { WalletStatus } from "../../src/models/KryptikWallet";
import WalletHome from "../../components/wallet/WalletHome";
import { defaultUser } from "../../src/models/user";

const Wallet: NextPage = () => {
  const { walletStatus, authUser } = useKryptikAuthContext();
  // ROUTE PROTECTOR: Listen for changes on loadingAuthUser and authUser, redirect if needed
  const router = useRouter();
  useEffect(() => {
    if (walletStatus != WalletStatus.Connected) router.push("/");
  }, []);

  const handleStartAddName = function () {
    router.push("../wallet/createName");
  };

  return (
    <div>
      {authUser && authUser != defaultUser ? (
        <WalletHome />
      ) : (
        <p className="dark:text-white">Waiting for wallet to load...</p>
      )}
    </div>
  );
};

export default Wallet;
