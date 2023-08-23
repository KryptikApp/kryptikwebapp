import type { NextPage } from "next";

import SearchNetwork from "../components/search/searchNetwork";
import ListApps from "../components/lists/ListApps";
import { topApps } from "../src/explore/apps/topApps";
import { topProfiles } from "../src/explore/profiles/topProfiles";
import ListProfiles from "../components/lists/ListProfiles";

const Explore: NextPage = () => {
  return (
    <div className="">
      <div className="max-w-3xl mx-auto text-left border-b border-green-400/30 mb-8 py-2 p-4">
        <h1 className="text-left text-3xl font-semibold">Explore</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          See what's happening in Web3.
        </p>
      </div>

      <div className="text-center max-w-2xl mx-auto content-center">
        <SearchNetwork />
      </div>
      <div className="max-w-3xl mx-auto py-2 px-1 my-8">
        <div className="max-w-3xl text-lg my-4 font-gray-500">Top Profiles</div>
        <ListProfiles />
      </div>
      <div className="max-w-3xl mx-auto py-2 px-1 bg-gray-200/10 dark:bg-gray-700/10 my-8 rounded-xl hover:ring-2 ring-1 dark:ring-gray-800/40 ring-gray-400/40">
        <div className="max-w-3xl text-2xl my-4">Top Apps</div>
        <ListApps apps={topApps} />
      </div>

      <div className="h-[4vh]">
        {/* padding div for space between bottom and main elements */}
      </div>
    </div>
  );
};

export default Explore;
