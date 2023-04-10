import type { NextPage } from "next";

import { useRouter } from "next/router";
import { useKryptikAuthContext } from "../components/KryptikAuthProvider";
import { defaultUser } from "../src/models/user";
import BrandLandingPage from "./landings/BrandLandingPage";
import WalletHome from "./wallet/WalletHome";

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
          <WalletHome />
        ) : (
          <div>
            <div className="h-[10vh]">
              {/* padding div for space between top and main elements */}
            </div>
            <BrandLandingPage />
          </div>
        )}
      </div>
      <div className="h-[10rem]">
        {/* padding div for space between top and main elements */}
      </div>
    </div>
  );
};

export default LandingPage;
