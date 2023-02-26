import type { NextPage } from "next";
import QRCodeStyling, { Options } from "qr-code-styling";
import { useRef, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { AiFillCheckCircle, AiOutlineCopy } from "react-icons/ai";
import { useEffect } from "react";

// kryptik imports
import { useKryptikAuthContext } from "../../components/KryptikAuthProvider";
import { TokenAndNetwork } from "../../src/services/models/token";
import { defaultTokenAndNetwork } from "../../src/services/models/network";
import DropdownNetworks from "../../components/DropdownNetworks";
import { getAddressForNetworkDb } from "../../src/helpers/utils/accountUtils";
import { useRouter } from "next/router";
import { ServiceState } from "../../src/services/types";
import { WalletStatus } from "../../src/models/KryptikWallet";
import Link from "next/link";
import Script from "next/script";

const Recieve: NextPage = () => {
  const {
    kryptikWallet,
    kryptikService,
    authUser,
    loadingAuthUser,
    walletStatus,
  } = useKryptikAuthContext();
  const [selectedTokenAndNetwork, setSelectedTokenAndNetwork] = useState(
    defaultTokenAndNetwork
  );
  const [readableFromAddress, setReadableFromAddress] = useState("");
  const [toAddress, setToAddress] = useState(" ");
  const [isCopied, setIsCopied] = useState(false);
  const [qrOptions, setQrOptions] = useState<Options>({
    width: 300,
    height: 300,
    margin: 2,
    type: "svg",
    data: readableFromAddress,
    dotsOptions: {
      gradient: {
        type: "radial",
        colorStops: [
          { offset: 0, color: "#28C2F6" },
          { offset: 1, color: "#000000" },
        ],
      },
      type: "dots",
    },
    cornersSquareOptions: {
      color: "black",
      type: "extra-rounded",
    },
    backgroundOptions: {
      color: "#e9ebee",
    },
    imageOptions: {
      crossOrigin: "anonymous",
    },
  });

  const useQRCodeStyling = (options: Options): QRCodeStyling | null => {
    //Only do this on the client
    if (typeof window !== "undefined") {
      /* eslint-disable */
      const QRCodeStylingLib = require("qr-code-styling");
      /* eslint-disable */
      const qrCodeStyling: QRCodeStyling = new QRCodeStylingLib(options);
      return qrCodeStyling;
    }
    return null;
  };

  const [qrCode] = useState<QRCodeStyling | null>(useQRCodeStyling(qrOptions));
  const qrRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  // ROUTE PROTECTOR: Listen for changes on loading and authUser, redirect if needed
  useEffect(() => {
    if (
      (!loadingAuthUser && !authUser) ||
      (walletStatus != WalletStatus.Connected &&
        walletStatus != WalletStatus.Locked)
    )
      router.push("/");
    // ensure service is started
    if (kryptikService.serviceState != ServiceState.started) {
      router.push("/");
    }
  }, [authUser, loadingAuthUser]);

  useEffect(() => {
    fetchFromAddress();
  }, []);

  useEffect(() => {
    if (qrRef.current) {
      qrCode?.append(qrRef.current);
    }
  }, [qrCode, qrRef]);

  const fetchFromAddress = async () => {
    let accountAddress = await getAddressForNetworkDb(
      kryptikWallet,
      selectedTokenAndNetwork.baseNetworkDb
    );
    // handle empty address
    if (accountAddress == "") {
      toast.error(
        `Error: no address found for ${selectedTokenAndNetwork.baseNetworkDb.fullName}. Please contact the Kryptik team or try refreshing your page.`
      );
      setToAddress(kryptikWallet.resolvedEthAccount.address);
      setReadableFromAddress(kryptikWallet.resolvedEthAccount.address);
      setSelectedTokenAndNetwork(defaultTokenAndNetwork);
      return;
    }
    setToAddress(accountAddress);
    qrCode?.update({ data: accountAddress });
    setReadableFromAddress(accountAddress);
  };

  const handleIsCopiedToggle = async () => {
    // copy selected adress
    navigator.clipboard.writeText("");
    navigator.clipboard.writeText(toAddress);
    if (!isCopied) {
      // update copy state
      setIsCopied(true);
    }
  };

  useEffect(() => {
    fetchFromAddress();
  }, [selectedTokenAndNetwork]);

  const handleTokenAndNetworkChange = function (
    tokenAndNetwork: TokenAndNetwork
  ) {
    setSelectedTokenAndNetwork(tokenAndNetwork);
    setIsCopied(false);
  };

  return (
    <div>
      <div className="h-[5rem]">
        {/* padding div for space between top and main elements */}
      </div>

      <div className="max-w-md mx-auto content-center dark:text-white">
        <div className="rounded-lg border border-sky-300 hover:border-sky-400 py-10 ">
          <h1 className="text-center text-3xl font-bold lg:mb-2 dark:text-white">
            Recieve
            <img
              src="/kryptikBrand/kryptikEyez.png"
              alt="Kryptik Eyes"
              className="rounded-full w-10 ml-2 inline max-h-sm h-auto align-middle border-none"
            />
          </h1>

          {/* QR CODE */}
          <div className="flex mb-2">
            <div className="flex-1" />
            <div className="flex-2">
              <div className="rounded rounded-lg bg-sky-400 p-2">
                <div ref={qrRef} />
              </div>
            </div>
            <div className="flex-1" />
          </div>
          <div className="text-center">
            {isCopied ? (
              <p
                className="font-bold text-green-600 hover:cursor-pointer"
                onClick={() => handleIsCopiedToggle()}
              >
                <AiFillCheckCircle className="inline mr-3" />
                Copied to Clipboard
              </p>
            ) : (
              <p
                className="hover:cursor-pointer dark:text-white"
                onClick={() => handleIsCopiedToggle()}
              >
                <AiOutlineCopy className="inline mr-3" />
                Copy address to clipboard
              </p>
            )}
            {/* network dropdown */}
            <div className="max-w-xs mx-auto">
              <DropdownNetworks
                selectedTokenAndNetwork={selectedTokenAndNetwork}
                onlyNetworks={true}
                selectFunction={handleTokenAndNetworkChange}
              />
            </div>
          </div>
          {selectedTokenAndNetwork.tokenData ? (
            <p className="mx-auto text-center text-slate-500 text-sm px-4 dark:text-slate-400 mt-3">
              Easily receive{" "}
              <span
                style={{
                  color: `${selectedTokenAndNetwork.tokenData.tokenDb.hexColor}`,
                }}
                className="font-medium"
              >
                {selectedTokenAndNetwork.tokenData.tokenDb.name}
              </span>{" "}
              on{" "}
              <span
                style={{
                  color: `${selectedTokenAndNetwork.baseNetworkDb.hexColor}`,
                }}
                className="font-medium"
              >
                {selectedTokenAndNetwork.baseNetworkDb.fullName}
              </span>{" "}
              by having someone scan the code below.
            </p>
          ) : (
            <p className="mx-auto text-center text-slate-500 text-sm px-4 dark:text-slate-400 mt-3">
              Easily receive money on{" "}
              <span
                style={{
                  color: `${selectedTokenAndNetwork.baseNetworkDb.hexColor}`,
                }}
                className="font-medium"
              >
                {selectedTokenAndNetwork.baseNetworkDb.fullName}
              </span>{" "}
              by having someone scan the code above.
            </p>
          )}
          {selectedTokenAndNetwork.baseNetworkDb.ticker.toLowerCase() ==
            "algo" && (
            <div className="mx-auto w-max mt-8">
              <Link
                href={"../assets/enable"}
                className="text-md font-semibold my-2 px-2 py-2 border rounded-md hover:text-sky-400"
              >
                Enable Algorand Assets
              </Link>
            </div>
          )}
        </div>
      </div>
      <div className="h-[12rem]">
        {/* padding div for space between bottom and main elements */}
      </div>
    </div>
  );
};

export default Recieve;
