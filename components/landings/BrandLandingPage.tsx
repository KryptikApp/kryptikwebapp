import type { NextPage } from "next";

import { useRouter } from "next/router";
import { useKryptikThemeContext } from "../ThemeProvider";
import Image from "next/image";
import { AiOutlineLeftCircle, AiOutlineRightCircle } from "react-icons/ai";
import { useEffect, useState } from "react";
import ListFeatures from "../lists/ListFeatures";

// main landing page for those who don't yet have a wallet or are logged out
const BrandLandingPage: NextPage = () => {
  const router = useRouter();
  const { isDark, themeLoading } = useKryptikThemeContext();

  const handleGetStarted = async () => {
    router.push("/wallet/create");
  };

  return (
    <div className="w-full pb-20">
      <div className="min-h-[10vh]" />
      <div className="flex flex-col place-items-center">
        <div className="mx-auto text-center content-center pt-10 max-w-2xl">
          <div className="p-2 bg-green-100/10 dark:bg-green-900/10 rounded-xl">
            <h1 className="p-2 text-5xl font-semibold sans text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-800 to-gray-700 dark:from-white dark:to-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors transition duration-300 ease-in-out hover:scale-105 background-animate">
              Kryptik is a powerful digital wallet.
            </h1>
          </div>

          <h1 className="text-xl text-center mt-4 dark:text-gray-300 dark:hover:text-gray-200 transition-colors duration-500">
            Save, send, and collect with ease.
          </h1>
          <div className="lg:px-5 py-5 lg:m-2 rounded mb-0 ">
            <button
              className="bg-transparent grow hover:bg-green-500 font-semibold hover:text-white py-2 border border-green-500 rounded-md text-2xl px-10 transition-colors duration-300"
              onClick={() => handleGetStarted()}
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
      <ListFeatures />
      <div className="max-w-5xl mx-auto mt-10">
        <div className="">
          <h1 className="text-3xl text-left font-bold sans mb-4">
            Kryptik Supporters
          </h1>
          <p className="ltext-xl text-justify dark:text-gray-400">
            Kryptik has been made possible by the generous support of the
            following organizations.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 bg-gray-300/20 rounded-xl mt-4 hover:bg-gray-300/30 transition-colors duration-300">
            <Image
              src="/supporters/cmu.webp"
              alt="ECMU"
              className="mx-auto object-contain grayscale my-auto"
              width={200}
              height={200}
            />
            <Image
              src="/supporters/near.webp"
              alt="NEAR Foundation"
              className="mx-auto object-contain grayscale my-auto"
              width={200}
              height={200}
            />
            <Image
              src="/supporters/solanaFoundation.webp"
              alt="Solana Foundation"
              className="mx-auto object-contain grayscal my-auto"
              width={200}
              height={200}
            />
            <Image
              src="/supporters/web3Foundation.webp"
              alt="Web3 Foundation"
              className="mx-auto object-contain grayscale my-auto"
              width={200}
              height={200}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandLandingPage;
