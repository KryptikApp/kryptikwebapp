import type { NextPage } from "next";

import SearchNetwork from "../components/search/searchNetwork";
import ListProfiles from "../components/lists/ListProfiles";
import ListTrendingApps from "../components/lists/ListTrendingApps";
import Head from "next/head";

const Explore: NextPage = () => {
  return (
    <div className="">
      {/* add page metadata */}
      <Head>
        <title>Explore | Kryptik</title>
        <meta
          name="description"
          content="Explore trending profiles and apps across the Web3 ecosystem."
        />
      </Head>
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
      <div className="max-w-3xl mx-auto py-2 px-1 my-8">
        <div className="max-w-3xl text-lg my-4 font-gray-500">Popular Apps</div>
        <ListTrendingApps />
      </div>
      <div className="h-[4vh]">
        {/* padding div for space between bottom and main elements */}
      </div>
    </div>
  );
};

export default Explore;
