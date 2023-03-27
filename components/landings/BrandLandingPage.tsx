import type { NextPage } from "next";

import { useRouter } from "next/router";
import { useKryptikThemeContext } from "../ThemeProvider";

// main landing page for those who don't yet have a wallet or are logged out
const BrandLandingPage: NextPage = () => {
  const router = useRouter();
  const { isDark, themeLoading } = useKryptikThemeContext();

  const handleGetStarted = async () => {
    router.push("/wallet/create");
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mx-auto flex flex-col lg:flex-row">
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
          <div className="lg:px-5 py-5 lg:m-2 rounded mb-0 ">
            <button
              className="bg-transparent grow hover:bg-green-500 font-semibold hover:text-white py-2 border border-green-500 rounded-md text-2xl px-10"
              onClick={() => handleGetStarted()}
            >
              Get Started
            </button>
          </div>
        </div>
        {/* kryptik display */}
        <div className="flex-grow graphPaper md:mx-0">
          <div
            className={`overflow-hidden ${
              isDark || themeLoading
                ? "colorFadeGreenBlackCenter"
                : "colorFadeGreenWhiteCenter"
            }`}
          >
            <img
              src="/kryptikBrand/kryptik balance screen.svg"
              alt="Kryptik sample screen"
              className="mx-auto pl-[15%] md:pl-[6%] max-w-[100%] md:max-w-[320px] lg:min-w-[300px]"
            ></img>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandLandingPage;
