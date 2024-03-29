import { useEffect, useState } from "react";
import { IContract } from "../../src/contracts/types";
import Image from "next/image";
import { getAppContracts } from "../../src/requests/contracts";
import { useKryptikAuthContext } from "../KryptikAuthProvider";
import { NetworkDb } from "@prisma/client";
import { ServiceState } from "../../src/services/types";

export default function ListTrendingApps() {
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [apps, setApps] = useState<IContract[] | null>(null);
  const loadingQuantity = 6;
  async function handleLoadApps() {
    setLoading(true);
    setFailed(false);
    try {
      const apps = await getAppContracts();
      if (!apps) throw new Error("No apps found");
      setApps(apps);
    } catch (error) {
      console.error(error);
      setFailed(true);
    }
    setLoading(false);
  }

  useEffect(() => {
    if (apps && apps.length > 0) return;
    handleLoadApps();
  }, []);

  return (
    <div className="flex flex-col space-y-4 w-full px-2">
      {loading &&
        Array(loadingQuantity)
          .fill(0)
          .map((_) => <LoadingCard key={_} />)}
      {failed && (
        <div className="text-center text-gray-500 dark:text-gray-400">
          Failed to load apps.
        </div>
      )}
      {!loading &&
        apps &&
        apps.length > 0 &&
        apps.map((app, _) => <AppCard contract={app} key={_} index={_} />)}
    </div>
  );
}

function AppCard(props: { contract: IContract; index: number }) {
  const { contract, index } = { ...props };
  const [networkDb, setNetworkDb] = useState<NetworkDb | null>(null);
  const { kryptikService } = useKryptikAuthContext();
  const tagLine = getTagline(contract);
  useEffect(() => {
    if (kryptikService.serviceState != ServiceState.started) {
      return;
    }
    try {
      const newNetorkDb = kryptikService.getNetworkDbByTicker(
        contract.networkTicker
      );
      setNetworkDb(newNetorkDb);
    } catch (e: any) {
      console.log("failed to get network db");
    }
  }, [kryptikService.serviceState]);

  return (
    <a
      href={contract.appMetaData.url}
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className="group h-[120px] rounded-md flex flex-row px-2 py-3 dark:bg-gray-800/10 py-1 ring-[1px] ring-gray-500/10 border border-gray-400/10 hover:border-green-400/20 transform-color duration-300 bg-gray-200/30 dark:bg-gray-700/30 hover:brightness-105 relative hover:ring-[3px] hover:cursor-pointer">
        <div className="">
          <Image
            className="float-left pl-2 rounded-md bg-gradient-to-r from-sky-400/10 to-indigo-500/10 background-animate px-2 py-2"
            src={contract.appMetaData.icon}
            alt={`${contract.appMetaData.name} image`}
            width={50}
            height={50}
          />
        </div>
        <div className="flex flex-col px-2">
          <h1 className="text-2xl font-semibold text-left text-gray-800 dark:text-white">
            {contract.appMetaData.name}
          </h1>
          <p className="text-left text-gray-500 dark:text-gray-400 text-xl">
            {tagLine}
          </p>
          <div className="flex flex-row flex-wrap justify-right space-x-2">
            {contract.appMetaData.tags.map((tag) => (
              <div
                key={tag}
                className="px-2 py-1 mt-2 text-sm text-gray-700 bg-sky-200/20 rounded-md dark:bg-gray-700/20 dark:text-gray-400 h-fit ring-gray-500/10 ring-1"
              >
                {tag}
              </div>
            ))}
          </div>
        </div>
        <div className="p-1 font-semibold absolute right-4 top-2 text-gray-500">
          {index + 1}
        </div>
        {networkDb && (
          <div className="absolute bottom-2 right-2 text-gray-500">
            <img
              src={networkDb.iconPath}
              alt={`${networkDb.ticker} icon`}
              width={20}
              height={20}
              className="grayscale group-hover:grayscale-0 opacity-25 group-hover:opacity-100"
            />
          </div>
        )}
      </div>
    </a>
  );
}

function LoadingCard() {
  return (
    <div className="flex flex-col space-y-2 w-full">
      <div className="flex flex-row space-x-2">
        <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse"></div>
        <div className="flex flex-col space-y-2">
          <div className="w-32 h-4 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="w-16 h-4 bg-gray-200 rounded-full animate-pulse"></div>
        </div>
      </div>
      <div className="w-full h-4 bg-gray-200 rounded-full animate-pulse"></div>
    </div>
  );
}

function getTagline(contract: IContract) {
  if (!contract.stats) return contract.appMetaData.description;
  if (contract.appMetaData.name.toLowerCase().includes("name service")) {
    return `Registered ${contract.stats.totalTransactionsLastHour} name${
      contract.stats.totalTransactionsLastHour != 1 ? "s" : ""
    } in the last hour.`;
  }
  if (contract.appMetaData.name.toLowerCase().includes("swap")) {
    return `Swapped ${contract.stats.totalTransactionsLastHour} time${
      contract.stats.totalTransactionsLastHour != 1 ? "s" : ""
    } in the last hour.`;
  }
  return `Used ${contract.stats.totalTransactionsLastHour} time${
    contract.stats.totalTransactionsLastHour != 1 ? "s" : ""
  } in the last hour.`;
}
