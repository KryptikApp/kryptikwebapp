import type { NextPage } from "next";

import { useRouter } from "next/router";
import { useKryptikAuthContext } from "../components/KryptikAuthProvider";
import { defaultUser } from "../src/models/user";
import BrandLandingPage from "./landings/BrandLandingPage";
import AccountsCard from "./wallet/AccountsCard";

const LandingPage: NextPage = () => {
  const router = useRouter();
  const { authUser, loadingAuthUser, loadingWallet } = useKryptikAuthContext();

  // useEffect(()=>{
  //   if(!loading && kryptikWallet.connected){
  //     router.push("/wallet")
  //   }
  // }, [loading])

  return (
    <div>
      <div className="dark:text-white">
        {loadingAuthUser ||
        loadingWallet ||
        (authUser && authUser != defaultUser) ? (
          <AccountsCard />
        ) : (
          <div>
            <BrandLandingPage />
          </div>
        )}
      </div>
    </div>
  );
};

export default LandingPage;
