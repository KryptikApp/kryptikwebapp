import type { NextPage } from "next";
import toast, { Toaster } from "react-hot-toast";

import { useKryptikAuthContext } from "../components/KryptikAuthProvider";
import Link from "next/link";
import LaunchPage from "../components/LaunchPage";
import LandingPage from "../components/LandingPage";

const Home: NextPage = () => {
  const appMode = process.env.NEXT_PUBLIC_APP_MODE;

  return <div>{appMode == "prelaunch" ? <LaunchPage /> : <LandingPage />}</div>;
};

export default Home;
