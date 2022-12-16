import type { NextPage } from "next";
import toast from "react-hot-toast";

import { useKryptikAuthContext } from "../components/KryptikAuthProvider";
import LaunchPage from "../components/LaunchPage";

const Waitlist: NextPage = () => {
  const { kryptikWallet, authUser } = useKryptikAuthContext();
  const appMode = process.env.NEXT_PUBLIC_APP_MODE;

  const handleGetStarted = async () => {
    console.log("Handle get started!");
    toast("Handle get started");
  };

  return (
    <div>
      <LaunchPage />
    </div>
  );
};

export default Waitlist;
