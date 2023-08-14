import { NetworkDb } from "@prisma/client";
import { Network, truncateAddress } from "hdseedloop";
import { NextPage } from "next";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { AiOutlineCheckCircle, AiOutlineCopy } from "react-icons/ai";
import { networkFromNetworkDb } from "../../src/helpers/utils/networkUtils";
import { useKryptikAuthContext } from "../KryptikAuthProvider";

type Props = {
  networkDb: NetworkDb;
};

const NetworkAddress: NextPage<Props> = (props) => {
  const { networkDb } = { ...props };
  const { kryptikWallet } = useKryptikAuthContext();
  const network: Network = networkFromNetworkDb(networkDb);
  const address = kryptikWallet.seedLoop.getAddresses(network)[0];
  const readableAddress = truncateAddress(address, network);
  const [isCopied, setIsCopied] = useState(false);

  const handleIsCopiedToggle = function () {
    navigator.clipboard.writeText(address);
    if (!isCopied) {
      // update copy state
      setIsCopied(true);
    }
    toast.success("Address copied.");
  };

  useEffect(() => {
    if (!isCopied) return;
    setInterval(() => {
      setIsCopied(false);
    }, 2000);
  }, [isCopied]);

  return (
    <div
      className="rounded-lg"
      style={{
        backgroundColor: networkDb.hexColor,
        borderColor: networkDb.hexColor,
      }}
    >
      <div
        className="w-full rounded-lg p-2 flex flex-col  bg-white bg-opacity-40 dark:bg-black border border-[2px]"
        style={{
          borderColor: networkDb.hexColor,
        }}
      >
        <div className="flex flex-row space-x-2 px-2">
          <div className="flex-shrink-0 min-w-[48px]">
            <img
              className="w-10 h-10 mt-2 rounded-full"
              src={networkDb.iconPath}
              alt={`${networkDb.fullName} logo`}
            />
          </div>
          <div className="flex flex-col">
            <p className="text-xl font-semibold">{networkDb.fullName}</p>
            <p className="text-slate-600 dark:text-slate-300 text-md">
              {readableAddress}
            </p>
          </div>
          <div className="flex-grow">
            <div className="flex flex-row flex-row-reverse">
              <div
                className="p-2 rounded-lg border border-1 w-fit mt-2 bg-white bg-opacity-20 hover:cursor-pointer"
                style={{
                  borderColor: networkDb.hexColor,
                }}
                onClick={handleIsCopiedToggle}
              >
                {isCopied ? (
                  <AiOutlineCheckCircle size={20} />
                ) : (
                  <AiOutlineCopy size={20} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkAddress;
