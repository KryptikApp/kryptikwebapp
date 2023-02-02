import type { NextPage } from "next";
import { Toaster } from "react-hot-toast";

import Link from "next/link";
import { useState } from "react";
import { WaitlistProgress } from "../src/services/types";
import { addEmailToWaitlist } from "../src/helpers/waitlist";
import { isValidEmailAddress } from "../src/helpers/resolvers/kryptikResolver";
import { useKryptikThemeContext } from "./ThemeProvider";

const LaunchPage: NextPage = () => {
  const [email, setEmail] = useState("");
  const [waitlistPosition, setWaitlistPosition] = useState(0);
  const [failureMsg, setFailureMsg] = useState("");
  const [progress, setProgress] = useState(WaitlistProgress.Begin);
  const [isLoading, setIsLoading] = useState(false);
  const { isDark, themeLoading } = useKryptikThemeContext();

  const errorhandler = function (msg: string) {
    setFailureMsg(msg);
    setProgress(WaitlistProgress.Failure);
  };

  const handleUpdateEmail = function (newEmail: string) {
    setEmail(newEmail);
  };

  const handleAddEmailToWaitlist = async function () {
    setIsLoading(true);
    if (!isValidEmailAddress(email)) {
      setIsLoading(false);
      return;
    }
    let newPosition: number | null = await addEmailToWaitlist(
      email,
      errorhandler
    );
    // if waitlist add failed callback error handler will trigger... just return here
    if (!newPosition) {
      setIsLoading(false);
      return;
    }
    // update local state w/ waitlist position of added email
    setWaitlistPosition(newPosition);
    setProgress(WaitlistProgress.Complete);
    setIsLoading(false);
  };

  const handleRestart = async function () {
    setWaitlistPosition(0);
    setProgress(WaitlistProgress.Begin);
    setEmail("");
    setIsLoading(false);
  };

  return (
    <div className="">
      {
        <div className="h-[6vh] md:h-[20vh]">
          {/* padding div for space between top and main elements */}
        </div>
      }

      {/* begin launch screen */}
      {progress == WaitlistProgress.Begin && (
        <div className="md:max-w-[1000px] mx-auto">
          <div className="flex flex-col lg:flex-row">
            <div className="text-center content-center pt-10 lg:pt-20">
              <h1 className="text-7xl font-bold sans dark:text-white transition ease-in-out hover:scale-110">
                Crypto Made{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-br from-sky-400 via-emerald-600 to-green-500 background-animate">
                  Easy
                </span>
              </h1>
              <h1 className="text-xl text-center mt-4 dark:text-gray-300 dark:hover:text-gray-200 transition-colors duration-500">
                Save, send, and collect with ease.
              </h1>
              {/* email input */}
              <div className="lg:px-5 py-5 lg:m-2 rounded mb-0 ">
                <div className="flex md:w-[70%]  border border-green-600 mx-auto rounded">
                  <input
                    maxLength={40}
                    className="w-[70%] bg-gray-200 appearance-none rounded py-4 px-4 text-gray-700 text-xl focus:outline-none focus:bg-white focus:border-sky-400 dark:bg-[#141414] dark:text-white"
                    placeholder="joinwaitlist@gmail.com"
                    value={email}
                    onChange={(e) => handleUpdateEmail(e.target.value)}
                  />
                  <button
                    className="hover:bg-transparent grow bg-green-500 font-semibold bg:text-green-500 hover:text-white py-2 border border-green-500 rounded-sm"
                    onClick={() => handleAddEmailToWaitlist()}
                  >
                    {!isLoading ? (
                      "Get Started"
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
                </div>
              </div>
            </div>
            {/* kryptik display */}
            <div className="graphPaper -mx-4 md:mx-0 flex-grow">
              <div
                className={`${
                  isDark || themeLoading
                    ? "colorFadeGreenBlackCenter"
                    : "colorFadeGreenWhiteCenter"
                }`}
              >
                <div className="">
                  <img
                    src="/kryptikBrand/kryptik balance screen.svg"
                    alt="Kryptik Eyes"
                    className="ml-[15%] max-w-[100%] md:max-w-[280px] lg:ml-[20%] md:mx-auto"
                  ></img>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* complete screen */}
      {progress == WaitlistProgress.Complete && (
        <div>
          <div className="flex flex-col lg:flex-row">
            <div className="min-w-[50%] max-h-[400px] graphPaper -mx-4">
              <div
                className={`min-w-[40%] max-h-[800px] ${
                  isDark || themeLoading
                    ? "colorFadeGreenBlackCenter"
                    : "colorFadeGreenWhiteCenter"
                }`}
              >
                <div className="place-items-center max-w-[400px] mx-auto pt-48 lg:pt-40">
                  <img
                    className="max-w-[90%] mx-auto"
                    src="kryptikBrand/journey begins.png"
                  />
                </div>
              </div>
            </div>

            <div className="mx-auto">
              <div className="h-[400px] md:h-[200px]">
                {/* padding div for space between top and main elements */}
              </div>
              <p className="dark:text-white text-6xl mb-2">
                You&apos;re #{waitlistPosition} on the list.
              </p>
              <p className="text-slate-500 dark:text-slate-400 text-xl ">
                A Web3 Wallet full of{" "}
                <span className="text-transparent font-semibold bg-clip-text bg-gradient-to-br from-green-200 to-sky-500 background-animate">
                  magical
                </span>{" "}
                powers. Coming soon.
              </p>
              <Link href="/explore">
                <p className="text-md dark:text-white hover:cursor-pointer dark:hover:text-sky-500 transition-colors duration-1500 mt-4">
                  Keep exploring?
                </p>
              </Link>
            </div>
          </div>
        </div>
      )}
      {/* failure screen */}
      {progress == WaitlistProgress.Failure && (
        <div className="mx-auto">
          <h1 className="text-3xl text-red-400">
            Error Adding {email} to Waitlist.
          </h1>
        </div>
      )}

      <div className="h-[18vh] md:h-[20vh]">
        {/* padding div for space between top and main elements */}
      </div>
    </div>
  );
};

export default LaunchPage;
