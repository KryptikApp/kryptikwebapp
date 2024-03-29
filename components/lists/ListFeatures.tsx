import { NextComponentType } from "next";
import Image from "next/image";
import { AiOutlineLeftCircle, AiOutlineRightCircle } from "react-icons/ai";
import { useEffect, useState } from "react";

const ListFeatures: NextComponentType = () => {
  // max steps in either direction on large screens
  // TODO: update if ad/remove feature slides
  const maxStepsRight = 1;
  const maxStepsLeft = -1;
  // container width
  const [featureWidth, setFeatureWidth] = useState(380);
  const [loading, setLoading] = useState(true);
  const [canGoLeft, setCanGoLeft] = useState(false);
  const [canGoRight, setCanGoRight] = useState(true);
  const [stepCount, setStepCount] = useState(0);
  function handleScroll(direction: "left" | "right") {
    const container = document.getElementById("featureContainer");
    if (!container) return;
    const isLeft = direction === "left";
    // scroll horizontal with smooth behavior
    container.scrollBy({
      left: isLeft ? -400 : 400,
      behavior: "smooth",
    });
    let newCount = 0;
    if (isLeft && stepCount != maxStepsLeft) {
      newCount = stepCount - 1;
      setStepCount(newCount);
    }
    if (!isLeft && stepCount != maxStepsRight) {
      newCount = stepCount + 1;
      setStepCount(newCount);
    }
    if (newCount > maxStepsLeft) {
      setCanGoLeft(true);
    } else {
      setCanGoLeft(false);
    }
    if (newCount < maxStepsRight) {
      setCanGoRight(true);
    } else {
      setCanGoRight(false);
    }
  }
  // update feature width when window resizes
  useEffect(() => {
    // Add event listener
    function updateSize() {
      const container = document.getElementById("featureContainer");
      if (!container) return;
      setLoading(false);
      if (window.innerWidth < 800) {
        setFeatureWidth(container.offsetWidth);
      } else if (window.innerWidth < 900) {
        setFeatureWidth(container.offsetWidth / 2.08);
      } else {
        setFeatureWidth(container.offsetWidth / 3.08);
      }
    }

    window.addEventListener("resize", updateSize);
    updateSize();
  }, []);

  return (
    <div className="graphPaper rounded-xl max-w-5xl mx-auto">
      <div className="bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-green-300/50 to-white dark:from-green-900/50 dark:to-[#0c0c0c] background-animate rounded-xl">
        <div>
          <div className="w-full bg-sky-200/30 dark:bg-sky-400/10 rounded-t-xl px-2 relative">
            <h1 className="text-green-500/60 dark:text-white text-3xl font-bold pt-2 pb-4">
              Powerful and easy to use.
            </h1>
            <AiOutlineLeftCircle
              size={40}
              className={`invisible lg:visible absolute top-80 left-0 lg:-left-8 text-green-400/50  ${
                canGoLeft
                  ? "hover:cursor-pointer hover:text-green-400"
                  : "grayscale"
              }`}
              onClick={() => handleScroll("left")}
            />
            <AiOutlineRightCircle
              size={40}
              className={`invisible lg:visible absolute top-80 right-0 lg:-right-8 text-green-400/50 ${
                canGoRight
                  ? "hover:cursor-pointer hover:text-green-400"
                  : "grayscale"
              }`}
              onClick={() => handleScroll("right")}
            />
          </div>
          <div
            id="featureContainer"
            className="relative flex flex-row min-h-[100px] py-4 space-x-2 overflow-x-auto snap-x px-2 no-scrollbar"
          >
            <MultiChain featureWidth={featureWidth} loading={loading} />
            <Design featureWidth={featureWidth} loading={loading} />
            <Secure featureWidth={featureWidth} loading={loading} />
            <OpenSource featureWidth={featureWidth} loading={loading} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListFeatures;

function MultiChain(props: { featureWidth: number; loading: boolean }) {
  const { featureWidth, loading } = { ...props };
  return (
    <div
      className={`${
        loading && "invisible"
      } flex flex-col max-w-xl h-[500px] bg-gray-50/90 dark:bg-gray-900/40 border border-sky-400 rounded-xl snap-center px-2 py-4`}
      style={{ minWidth: featureWidth }}
    >
      <h4 className="text-3xl font-semibold mb-2">Multichain Magic</h4>
      <p className="text-xl text-gray-700 dark:text-gray-200">
        {" "}
        With Kryptik you can access a world of possibilities across
        <span className="font-semibold"> 10+ blockchains</span> from a single
        app.
      </p>
      <Image
        src="/icons/chainLogos.gif"
        alt="Wavy chain logos"
        className="mx-auto object-contain snap-center"
        width={300}
        height={300}
      />
      <div className="absolute bottom-8 flex flex-row space-x-2 mt-2">
        <div className="rounded-xl h-fit border px-2 py-1 bg-gray-900/10">
          <p>WalletConnect</p>
        </div>
        <div className="rounded-xl h-fit border px-2 py-1 bg-gray-900/10">
          <p>10+ Networks</p>
        </div>
      </div>
    </div>
  );
}

function OpenSource(props: { featureWidth: number; loading: boolean }) {
  const { featureWidth, loading } = { ...props };
  return (
    <div
      className={`${
        loading && "invisible"
      } flex flex-col h-[500px] bg-gray-50/90 dark:bg-gray-900/40 border border-green-400 rounded-xl snap-center px-2 py-4`}
      style={{ minWidth: featureWidth }}
    >
      <h4 className="text-3xl font-semibold mb-2">Open Source</h4>
      <p className="text-xl text-gray-700 dark:text-gray-200">
        All of Kryptik's code is public and open source. We believe in 100%
        transparency.
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
  );
}

function Secure(props: { featureWidth: number; loading: boolean }) {
  const { featureWidth, loading } = { ...props };
  return (
    <div
      className={`${
        loading && "invisible"
      } flex flex-col h-[500px] bg-gray-50/90 dark:bg-gray-900/40 border border-sky-400 rounded-xl snap-center px-2 py-4`}
      style={{ minWidth: featureWidth }}
    >
      <h4 className="text-3xl font-semibold mb-2">Lockdown Security</h4>
      <p className="text-xl text-gray-700 dark:text-gray-200">
        Kyptik uses threshold cryptography to secure your funds. Your secrets
        never leave your device.
      </p>
      <Image
        src="/icons/keyWave.gif"
        alt="Wavy key"
        className="mx-auto object-contain snap-center"
        width={300}
        height={300}
      />
      <div className="absolute bottom-8 flex flex-row space-x-2 mt-2">
        <div className="rounded-xl border px-2 py-1 bg-gray-900/10">
          <p>WebAuthn</p>
        </div>
        <div className="rounded-xl border px-2 py-1 bg-gray-900/10">
          <p>Threshold Crypto</p>
        </div>
      </div>
    </div>
  );
}

function Design(props: { featureWidth: number; loading: boolean }) {
  const { featureWidth, loading } = { ...props };
  return (
    <div
      className={`${
        loading && "invisible"
      } flex flex-col h-[500px] bg-gray-50/90 dark:bg-gray-900/40 border border-green-400 rounded-xl snap-center px-2 py-4`}
      style={{ minWidth: featureWidth }}
    >
      <h4 className="text-3xl font-semibold mb-2">Delightful Design</h4>
      <p className="text-xl text-gray-700 dark:text-gray-200">
        Kryptik is designed with lots of care and a dash of{" "}
        <span className="text-sky-300">magic</span>. Every pixel is engineered
        with unforgiving precision.
      </p>
      <Image
        src="/kryptikBrand/kryptik balance screen.webp"
        alt="Kryptik sample screen"
        className="mx-auto object-contain snap-center"
        width={135}
        height={135}
      />
      <div className="absolute bottom-8 flex flex-row space-x-2 mt-2">
        <div className="rounded-xl border px-2 py-1 bg-gray-900/10">
          <p>Simple</p>
        </div>
        <div className="rounded-xl border px-2 py-1 bg-gray-900/10">
          <p>Precise</p>
        </div>
      </div>
    </div>
  );
}
