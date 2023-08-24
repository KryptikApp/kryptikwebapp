import {
  Network,
  NetworkFromTicker,
  formatAddress,
  truncateAddress,
} from "hdseedloop";
import { IResolvedAccount } from "../../src/helpers/resolvers/accountResolver";
import { NetworkDb, defaultNetwork } from "../../src/services/models/network";
import { getRandomAvatarPhoto } from "../../src/helpers/auth";
import { useKryptikAuthContext } from "../KryptikAuthProvider";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function PillProfile(params: { account: IResolvedAccount }) {
  const router = useRouter();
  const { account } = { ...params };
  const { kryptikService } = useKryptikAuthContext();
  const [networkDb, setNetworkDb] = useState<null | NetworkDb>(null);
  const [primaryNameToUse, setPrimaryNameToUse] = useState<string>("");
  const [linkToUse, setLinkToUse] = useState<string>("");
  useEffect(() => {
    if (!networkDb) {
      try {
        const newNetworkDb = kryptikService.getNetworkDbByTicker(
          account.networkTicker || "eth"
        );
        if (newNetworkDb) {
          setNetworkDb(newNetworkDb);
        }
        let newPrimaryName = "";
        const network: Network = account.networkTicker
          ? NetworkFromTicker(account.networkTicker)
          : defaultNetwork;

        console.log(account);
        if (account.names && account.names.length > 0) {
          newPrimaryName = account.names[0];
        } else {
          newPrimaryName = truncateAddress(account.address, network);
        }
        setPrimaryNameToUse(newPrimaryName);
      } catch (e) {
        console.log(e);
      }
    }
  });

  function clickHandler() {
    const addyToUse =
      account.address != ""
        ? account.address
        : account.names
        ? account.names[0]
        : "";
    router.push({
      pathname: "../gallery",
      query: {
        account: addyToUse,
        networkTicker: networkDb?.ticker,
        name: account.names ? account.names[0] : undefined,
      },
    });
  }

  return (
    <div
      className="flex flex-row rounded-md bg-gradient-to-r from-gray-500/10 to-gray-300/20 background-animate hover:brightness-105 hover:brightness-105 hover:cursor-pointer relative transitioncolors duration-300 hover:scale-105"
      onClick={() => clickHandler()}
    >
      {networkDb && (
        <img
          src={networkDb.iconPath}
          className="absolute top-0 left-0 w-5 h-5 -ml-2 -mt-1"
        />
      )}
      {account.avatarPath ? (
        <img
          src={account.avatarPath}
          className="w-16 h-16 object cover rounded-tl-md rounded-l-md"
        />
      ) : (
        <img
          src={getRandomAvatarPhoto()}
          className="w-16 h-16 object cover rounded-tl-md rounded-l-md"
        />
      )}
      <div className="px-2 h-full w-full">
        <p className="text-xl text-gray-500 font-semibold mx-auto text-center pt-4">
          {primaryNameToUse}
        </p>
      </div>
    </div>
  );
}

export function PillProfileLoading() {
  return (
    <div className="flex flex-row rounded-full bg-gray-500/10 background-animate">
      <div className="w-12 h-12 rounded-full bg-gray-500/50 animate-pulse"></div>
      <div className="px-2 my-auto w-16"></div>
    </div>
  );
}
