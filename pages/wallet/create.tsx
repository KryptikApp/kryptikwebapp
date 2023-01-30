import type { NextPage } from "next";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/router";
import toast, { Toaster } from "react-hot-toast";

// kryptik imports
import { useKryptikAuthContext } from "../../components/KryptikAuthProvider";
import {
  ILoginUserParams,
  loginUser,
} from "../../src/handlers/profile/loginHandler";
import { isValidEmailAddress } from "../../src/helpers/resolvers/kryptikResolver";
import {
  addEmailToWaitlist,
  isOnAlphaTestList,
} from "../../src/helpers/waitlist";
import LoginCard from "../../components/auth/LoginCard";

const CreateWallet: NextPage = () => {
  // const { signInWithToken } = useKryptikAuthContext();
  // const [email, setEmail] = useState("");
  // const [isLoading, setisLoading] = useState(false);
  // const [loadingMessage, setLoadingMessage] = useState("");
  // const router = useRouter();

  // const waitListErrorHandler = function (msg: string) {
  //   console.warn(msg);
  // };

  // const handleLoginUser = async function () {
  //   if (!isValidEmailAddress(email)) {
  //     toast.error("Please enter a valid email");
  //     return;
  //   }
  //   setisLoading(true);
  //   const isOnTestList = await isOnAlphaTestList(email);
  //   if (!isOnTestList) {
  //     const newPosition = await addEmailToWaitlist(email, waitListErrorHandler);
  //     router.push("../support/testing");
  //     setisLoading(false);
  //     return;
  //   }
  //   try {
  //     // login user with undefined seed
  //     // seed will be created when wallet is created
  //     const loginParams: ILoginUserParams = {
  //       email: email,
  //       signInWithTokenFunc: signInWithToken,
  //       progressFunc: handleStatusUpdate,
  //     };
  //     await loginUser(loginParams);
  //     toast.success("Kryptik Wallet connected.");
  //     // If we reach this line, it means our
  //     // authentication succeeded, so we'll
  //     // redirect to the home page!
  //     setisLoading(false);
  //     router.push("/");
  //     setisLoading(false);
  //   } catch (e) {
  //     toast.error("Unable to connect Kryptik wallet. Please contact support.");
  //     setisLoading(false);
  //   }
  // };

  // const handleStatusUpdate = function (msg: string, progress?: number) {
  //   setLoadingMessage(msg);
  // };

  return (
    <div>
      <Toaster />
      <div className="h-[15vh]">
        {/* padding div for space between top and main elements */}
      </div>
      <div className="max-w-2xl mx-auto">
        <LoginCard />
      </div>
    </div>
  );
};

export default CreateWallet;
