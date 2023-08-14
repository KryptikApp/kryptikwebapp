import type { NextPage } from "next";
import { useEffect } from "react";
import { useRouter } from "next/router";

import { useKryptikAuthContext } from "../../components/KryptikAuthProvider";
import { WalletStatus } from "../../src/models/KryptikWallet";
import WalletHome from "../../components/wallet/WalletHome";
import { defaultUser } from "../../src/models/user";
import AccountsCard from "../../components/wallet/AccountsCard";

const Wallet: NextPage = () => {
  const { walletStatus, authUser } = useKryptikAuthContext();
  // ROUTE PROTECTOR: Listen for changes on loadingAuthUser and authUser, redirect if needed
  const router = useRouter();
  useEffect(() => {
    if (walletStatus != WalletStatus.Connected) router.push("/");
  }, []);

  return (
    <div>
      <AccountsCard />
    </div>
  );
};

export default Wallet;
