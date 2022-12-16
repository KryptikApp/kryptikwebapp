import type { NextPage } from "next";
import Link from "next/link";
import { useState } from "react";
import { Magic } from "magic-sdk";
import router, { useRouter } from "next/router";
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

const CreateWallet: NextPage = () => {
  const { signInWithToken } = useKryptikAuthContext();
  const [email, setEmail] = useState("");
  const [isLoading, setisLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const router = useRouter();

  const waitListErrorHandler = function (msg: string) {
    console.warn(msg);
  };

  const handleLoginUser = async function () {
    if (!isValidEmailAddress(email)) {
      toast.error("Please enter a valid email");
      return;
    }
    setisLoading(true);
    const isOnTestList = await isOnAlphaTestList(email);
    if (!isOnTestList) {
      const newPosition = await addEmailToWaitlist(email, waitListErrorHandler);
      router.push("../support/testing");
      setisLoading(false);
      return;
    }
    try {
      // login user with undefined seed
      // seed will be created when wallet is created
      const loginParams: ILoginUserParams = {
        email: email,
        signInWithTokenFunc: signInWithToken,
        progressFunc: handleStatusUpdate,
      };
      await loginUser(loginParams);
      toast.success("Kryptik Wallet connected.");
      // If we reach this line, it means our
      // authentication succeeded, so we'll
      // redirect to the home page!
      setisLoading(false);
      router.push("/");
      setisLoading(false);
    } catch (e) {
      toast.error("Unable to connect Kryptik wallet. Please contact support.");
      setisLoading(false);
    }
  };

  const handleStatusUpdate = function (msg: string, progress?: number) {
    setLoadingMessage(msg);
  };

  return (
    <div>
      <Toaster />
      <div className="h-[15vh]">
        {/* padding div for space between top and main elements */}
      </div>

      <div className="text-center mx-auto content-center">
        <div className="bg-[#FBFDFD] dark:bg-gradient-to-br dark:from-[#0d0d0d] dark:to-[#0A0A0A] max-w-md mx-auto rounded-lg border border-solid dark:border-gray-800 hover:dark:border-green-400 border-gray-100 drop-shadow dark:text-white pt-2 px-2 pb-10">
          <div className="mt-2">
            <div className="flex flex-row mt-1">
              <div className="w-10 my-auto">
                <img
                  src="/kryptikBrand/kryptikEyez.png"
                  className="rounded-full"
                />
              </div>
              <h2 className="font-bold text-md ml-2 mb-1 text-transparent bg-clip-text bg-gradient-to-br from-blue-500 to-green-500">
                Kryptik
              </h2>
            </div>
            <div className="flex-grow">
              <h1 className="text-3xl font-bold">Welcome</h1>
            </div>
            <div className="flex flex-col mt-2">
              <p className="text-gray-700 dark:text-gray-400 text-lg font-semibold">
                Create your secure, Web3 wallet in one click.
              </p>

              <div className="flex flex-col px-8 mt-4 mb-4">
                <input
                  type="email"
                  className="bg-gray-200 dark:bg-gray-700 appearance-none border border-gray-200 rounded w-full py-3 px-4 text-gray-800 dark:text-white leading-tight focus:outline-none focus:bg-white focus:border-sky-400 dark:focus:border-sky-500 text-2xl"
                  id="inline-full-name"
                  placeholder="Enter your email"
                  required
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button
                  onClick={() => handleLoginUser()}
                  className={`bg-transparent hover:bg-green-500 text-green-500 text-2xl font-semibold hover:text-white py-2 px-4 ${
                    isLoading ? "hover:cursor-not-allowed" : ""
                  } border border-green-500 hover:border-transparent rounded-lg mt-5 mb-2`}
                  disabled={isLoading}
                >
                  Create Wallet
                  {!isLoading ? (
                    ""
                  ) : (
                    <svg
                      role="status"
                      className="inline w-4 h-4 ml-3 text-white animate-spin"
                      viewBox="0 0 100 101"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                        fill="#E5E7EB"
                      />
                      <path
                        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                        fill="currentColor"
                      />
                    </svg>
                  )}
                </button>
                <p className="text-gray-400 dark:text-gray-500 text-sm">
                  If you already have an account, you will be logged in.
                </p>
              </div>
              <div className="text-center max-w-2xl mx-auto content-center">
                <Link href="../wallet/import">
                  <span className="text-sky-300 dark:text-sky-600 hover:cursor-pointer hover:text-blue transition-colors duration-300">
                    or import existing seed
                  </span>
                </Link>
                {isLoading && (
                  <p className="text-slate-500 text-sm">{loadingMessage}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateWallet;
