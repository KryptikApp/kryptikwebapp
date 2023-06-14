import type { NextPage } from "next";

import { useRouter } from "next/router";
import { useKryptikThemeContext } from "../ThemeProvider";
import Image from "next/image";
import { AiOutlineLeftCircle, AiOutlineRightCircle } from "react-icons/ai";

// main landing page for those who don't yet have a wallet or are logged out
const BrandLandingPage: NextPage = () => {
  const router = useRouter();
  const { isDark, themeLoading } = useKryptikThemeContext();

  const handleGetStarted = async () => {
    router.push("/wallet/create");
  };
  

  function handleScroll(direction:"left"|"right"){
    const container = document.getElementById("featureContainer")
    if(!container) return;
    // scroll horizontal with smooth behavior
    container.scrollBy({
      left: direction === "left" ? -container.offsetWidth/2 : container.offsetWidth/2,
      behavior: "smooth"
    })
  }

  return (
    <div className="w-full">
      <div className="min-h-[10vh]" />
      <div className="flex flex-col place-items-center">
        <div className="mx-auto text-center content-center pt-10 max-w-2xl">
          <h1 className="p-2 text-5xl font-bold sans text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-800 to-gray-700 dark:from-white dark:to-gray-100 hover:text-gray-800 dark:hover:text-gray-100 transition-colors transition duration-300 ease-in-out hover:scale-105">
            Kryptik is a powerful digital wallet.
          </h1>
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
      {/* kryptik display */}
      <div className="graphPaper rounded-xl max-w-5xl mx-auto ">
        <div className="bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-green-300/50 to-white dark:from-green-900/50 dark:to-[#0c0c0c] background-animate rounded-xl">
          <div>
            <div className="w-full bg-sky-400/10 rounded-t-xl px-2 relative">
              <h1 className="text-green-500/60 dark:text-white text-4xl font-bold pt-2 pb-4">
                Powerful and easy to use.
              </h1>
              <AiOutlineLeftCircle size={35} className="invisible md:visible absolute top-80 -left-8 text-green-400/50 hover:cursor-pointer hover:text-green-400" onClick={()=>handleScroll("left")}/>
              <AiOutlineRightCircle size={35} className="invisible md:visible absolute top-80 -right-8 text-green-400/50  hover:cursor-pointer hover:text-green-400" onClick={()=>handleScroll("right")}/>
            </div>
            <div id="featureContainer" className="relative flex flex-row min-h-[100px] py-4 space-x-2 overflow-x-auto snap-x px-2 no-scrollbar">
              <div className="flex flex-col  min-w-[380px] max-w-xl h-[500px] bg-gray-50/90 dark:bg-gray-900/40 border border-green-400 rounded-xl snap-center px-2 py-4">
                <h4 className="text-3xl font-semibold mb-2">
                  Multichain Magic
                </h4>
                <p className="text-xl text-gray-700 dark:text-gray-200">
                  {" "}
                  With Kryptik you can access a world of possibilities across
                  <span className="font-semibold"> 10+ blockchains</span> from a
                  single app.
                </p>
                <Image
                  src="/icons/chainLogos.gif"
                  alt="Wavy chain logos"
                  className="mx-auto object-contain snap-center"
                  width={300}
                  height={300}
                />
                <div className="flex flex-row space-x-2 mt-2">
                  <div className="rounded-xl border px-2 py-1 bg-gray-900/10">
                    <p>WalletConnect</p>
                  </div>
                  <div className="rounded-xl border px-2 py-1 bg-gray-900/10">
                    <p>10+ Networks</p>
                  </div>
                </div>
              </div>
              <Image
                src="/kryptikBrand/kryptik balance screen.webp"
                alt="Kryptik sample screen"
                className="mx-auto object-contain snap-center"
                width={300}
                height={300}
              />
              <div className="flex flex-col  min-w-[380px] h-[500px] bg-gray-50/90 dark:bg-gray-900/40 border border-sky-400 rounded-xl snap-center px-2 py-4">
                <h4 className="text-3xl font-semibold mb-2">
                  Lockdown Security
                </h4>
                <p className="text-xl text-gray-700 dark:text-gray-200">
                  Kyptik uses threshold cryptography to secure your funds. Your
                  secrets never leave your device.
                </p>
                <Image
                  src="/icons/keyWave.gif"
                  alt="Wavy key"
                  className="mx-auto object-contain snap-center"
                  width={300}
                  height={300}
                />
                <div className="flex flex-row space-x-2 mt-2">
                  <div className="rounded-xl border px-2 py-1 bg-gray-900/10">
                    <p>WebAuthn</p>
                  </div>
                  <div className="rounded-xl border px-2 py-1 bg-gray-900/10">
                    <p>Threshold Crypto</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col  min-w-[380px] h-[500px] bg-gray-50/90 dark:bg-gray-900/40 border border-green-400 rounded-xl snap-center px-2 py-4">
                <h4 className="text-3xl font-semibold mb-2">Open Source</h4>
                <p className="text-xl text-gray-700 dark:text-gray-200">
                  All of Kryptik's code is public and open source. We believe in
                  100% transparency.
                </p>
                <a
                  className="text-green-400 font-semibold mt-32 text-2xl text-center rounded-xl px-6 py-1 bg-green-400/10 w-fit mx-auto hover:cursor-pointer hover:border border-green-400"
                  href={`https://github.com/KryptikApp/kryptikwebapp`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Code
                </a>
              </div>
              <div className="flex flex-col  min-w-[380px] h-[500px] bg-gray-50/90 dark:bg-gray-900/40 border border-sky-400 rounded-xl snap-center px-2 py-4">
                <h4 className="text-3xl font-semibold mb-2">
                  Delightful Design
                </h4>
                <p className="text-xl text-gray-700 dark:text-gray-200">
                  Kryptik is designed with lots of care and a dash of{" "}
                  <span className="text-sky-300">magic</span>. Every pixel is
                  engineered with unforgiving precision.
                </p>
                <Image
                  src="/icons/tvSignal.gif"
                  alt="TV signal"
                  className="mx-auto object-contain snap-center"
                  width={300}
                  height={300}
                />
                <div className="flex flex-row space-x-2 mt-2">
                  <div className="rounded-xl border px-2 py-1 bg-gray-900/10">
                    <p>Simple</p>
                  </div>
                  <div className="rounded-xl border px-2 py-1 bg-gray-900/10">
                    <p>Precise</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-5xl mx-auto my-10">
        <div className="mb-10">
          <h1 className="text-3xl text-left font-bold sans mb-4">
            Kryptik Supporters
          </h1>
          <p className="ltext-xl text-justify dark:text-gray-400">
            Kryptik has been made possible by the generous support of the
            following organizations.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 bg-gray-300/20 rounded-xl my-4">
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
