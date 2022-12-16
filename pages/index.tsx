import type { NextPage } from "next";
import toast, { Toaster } from "react-hot-toast";

import { useKryptikAuthContext } from "../components/KryptikAuthProvider";
import Link from "next/link";
import LaunchPage from "../components/LaunchPage";
import LandingPage from "../components/LandingPage";

const Home: NextPage = () => {
  const { kryptikWallet, authUser } = useKryptikAuthContext();
  const appMode = process.env.NEXT_PUBLIC_APP_MODE;

  const handleGetStarted = async () => {
    console.log("Handle get started!");
    toast("Handle get started");
  };

  return <div>{appMode == "prelaunch" ? <LaunchPage /> : <LandingPage />}</div>;
};

export default Home;
