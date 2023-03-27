import type { NextPage } from "next";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";
import { RiQrCodeFill } from "react-icons/ri";
import Button from "../../components/buttons/Button";
import Divider from "../../components/Divider";
import { useKryptikAuthContext } from "../../components/KryptikAuthProvider";
import KryptikScanner from "../../components/kryptikScanner";
import { useKryptikThemeContext } from "../../components/ThemeProvider";
import { ColorEnum } from "../../src/helpers/utils";

// connect wallet to external application
const Connect: NextPage = () => {
  const [uri, setUri] = useState<string>("");
  const { signClient } = useKryptikAuthContext();
  const [loading, setLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const { isDark } = useKryptikThemeContext();
  const handleConnect = async function (newUri?: string) {
    const uriToConnect = newUri ? newUri : uri;
    setShowScanner(false);
    if (!signClient) {
      console.log("No sign client.");
      toast.error("Unable to create sign client. Please try again later.");
      setUri("");
      return;
    }
    // ensure uri has length
    if (uriToConnect.length < 2) {
      toast.error("Please enter a valid uri.");
      return;
    }
    try {
      // initiate pair request
      signClient.pair({ uri: uriToConnect });
      setUri("");
    } catch (e) {
      console.warn(e);
      toast.error("Unable to pair.");
    }
  };
  function onShowScanner() {
    setShowScanner(true);
  }
  return (
    <div>
      <div className="max-w-md border border-gray-400 dark:border-gray-500 pt-10 pb-20 mx-auto my-auto px-4 rounded rounded-lg mt-20">
        <div>
          <p className="text-xl font-semibold dark:text-white">Connect App</p>
          <Divider />
        </div>

        <KryptikScanner show={showScanner} onScan={handleConnect} />

        {!showScanner && (
          <div className="flex flex-col space-y-2 py-14 mx-auto border border-gray-400 dark:border-gray-500 w-[340px] h-[280px] rounded rounded-lg hover:border-sky-400">
            <RiQrCodeFill
              size={100}
              className="text-gray-500 dark:text-gray-400 mx-auto"
            />
            <div className="mx-auto">
              <Button
                color={ColorEnum.blue}
                text={"Scan QR Code"}
                clickHandler={onShowScanner}
              />
            </div>
          </div>
        )}
        <div className="mx-auto flex flex-col space-y-2 mt-4">
          <p className="text-md text-gray-300 dark:text-gray-600 text-center">
            or enter uri
          </p>

          <div className="relative">
            <input
              aria-label="wc url connect input"
              placeholder="e.g. wc:a281567bb3e4..."
              onChange={(e) => setUri(e.target.value)}
              value={uri}
              className="p-1 text-gray-900 text-lg bg-gray-50 border rounded-lg border-gray-300 dark:bg-gray-700 dark:border-l-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white font-bold focus:outline-[1px] focus:outline-gray-200 dark:focus:outline-gray-700 w-full"
            />
            <div
              className={`opacity-95 hover:cursor-pointer absolute inset-y-0 right-2 px-2 rounded rounded-md my-1 bg-gray-300 dark:bg-gray-600 ${
                uri.length > 0 && "bg-gradient-to-r"
              } from-sky-400 to-blue-500 flex items-center text-sm leading-5`}
              onClick={() => handleConnect()}
            >
              Connect
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-md border border-gray-400 dark:border-gray-500 py-2 px-2 mx-auto my-auto px-4 rounded rounded-lg mt-20 text-slate-700 dark:text-slate-200 text-lg">
        <p>Review your connections.</p>
        <Link
          className="w-full text-center text-sky-400 hover:text-sky-500 font-semibold"
          href="../connect/pairings"
        >
          View Pairings
        </Link>
      </div>
    </div>
  );
};

export default Connect;
