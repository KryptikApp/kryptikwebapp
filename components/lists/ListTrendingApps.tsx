import { useEffect, useState } from "react";
import { IContract } from "../../src/contracts/types";
import Image from "next/image";
import { getAppContracts } from "../../src/requests/contracts";

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
        !failed &&
        Array(loadingQuantity).map((_) => <LoadingCard key={_} />)}
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
  const tagLine = contract.stats
    ? `Used ${contract.stats.totalTransactionsLastHour} time${
        contract.stats.totalTransactionsLastHour != 1 ? "s" : ""
      } in the last hour.`
    : contract.appMetaData.description;
  return (
    <div className="h-[120px] rounded-md flex flex-row px-2 py-3 dark:bg-gray-800/10 py-1 ring-[1px] ring-gray-500/10 border border-gray-400/10 hover:border-green-400/20 transform-color duration-300 bg-gray-200/30 dark:bg-gray-700/30 hover:brightness-105 relative hover:ring-[3px] hover:cursor-pointer">
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
    </div>
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
