import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import { useKryptikAuthContext } from "../../components/KryptikAuthProvider";
import { WalletStatus } from "../../src/models/KryptikWallet";
import Divider from "../../components/Divider";
import { TokenAndNetwork } from "../../src/services/models/token";

export default function Earn() {
  const { walletStatus, authUser, kryptikService } = useKryptikAuthContext();
  const [isValidAccount, setIsValidAccount] = useState(false);
  const [errorMsg, setErrorMsg] = useState(
    "Unable to proceed with earn feature."
  );
  const nonZeroBalances: TokenAndNetwork[] =
    kryptikService.kryptikBalances.getNonzeroBalances();
  useEffect(() => {
    if (nonZeroBalances.length == 0) {
      setIsValidAccount(false);
      setErrorMsg("You don't have any tokens to ear interest on.");
    } else {
      setIsValidAccount(true);
    }
  }, [nonZeroBalances]);
  // ROUTE PROTECTOR: Listen for changes on loadingAuthUser and authUser, redirect if needed
  const router = useRouter();
  useEffect(() => {
    if (walletStatus != WalletStatus.Connected) router.push("/");
  }, []);

  return (
    <div>
      <div className="h-[2rem]">
        {/* padding div for space between top and main elements */}
      </div>

      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold sans mb-5 dark:text-white">Earn</h1>
        <Divider />
        <p className="mb-2 text-justify text-green-500 dark:text-green-600">
          Get up to 5% APY on your tokens.
        </p>
        {!isValidAccount && (
          <div className="text-red-500 font-semibold text-center my-4">
            {errorMsg}
          </div>
        )}
      </div>
    </div>
  );
}
