import { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { getAllNetworkSearchSuggestions } from "../../src/handlers/search";
import { ISearchResult } from "../../src/handlers/search/types";
import { formatTicker } from "../../src/helpers/utils/networkUtils";
import { defaultTokenAndNetwork } from "../../src/services/models/network";
import { TokenAndNetwork } from "../../src/services/models/token";
import { ServiceState } from "../../src/services/types";
import DropdownNetworks from "../DropdownNetworks";
import { useKryptikAuthContext } from "../KryptikAuthProvider";
import Modal from "../modals/modal";
import SearchResultItem from "./searchResultItem";

const SearchNetwork: NextPage = () => {
  const { kryptikService } = useKryptikAuthContext();
  // ensure service is started
  const [selectedTokenAndNetwork, setSelectedTokenAndNetwork] = useState(
    defaultTokenAndNetwork
  );
  const [showDarkener, setShowDarkener] = useState(false);
  const [query, setQuery] = useState("");
  const [searchresults, setSearchResults] = useState<ISearchResult[]>([]);
  const [showNetworkModal, setShowNetworkModal] = useState(false);
  const router = useRouter();
  // ensure service is started
  useEffect(() => {
    if (kryptikService.serviceState != ServiceState.started) {
      router.push("/");
    }
  }, []);

  const handleQueryChange = async function (newQuery: string) {
    setQuery(newQuery);
    if (newQuery == "" || newQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    let newSearchResults: ISearchResult[] =
      await getAllNetworkSearchSuggestions(
        newQuery,
        selectedTokenAndNetwork.baseNetworkDb,
        kryptikService.TickerToNetworkDbs,
        kryptikService.NetworkDbs,
        kryptikService.tokenDbs
      );
    setSearchResults(newSearchResults);
  };

  function handleModalClose() {
    setShowNetworkModal(false);
  }

  const handleSelectedNetworkChange = function (
    newSelectedTokenAndNetwork: TokenAndNetwork
  ) {
    // reset search results
    setSearchResults([]);
    // update token and network
    setSelectedTokenAndNetwork(newSelectedTokenAndNetwork);
  };

  return (
    <div className="">
      <div className="md:max-w-lg max-h-40 max-w-[95%] mx-auto">
        <div
          onFocus={() => setShowDarkener(true)}
          className="flex relative z-20 w-full h-full transition ease-in-out focus-within:scale-105 focus-within:border focus-within:ring-2 focus-within:ring-sky-500 focus-within:border-slate-400 rounded-xl"
        >
          <div
            onClick={() => setShowNetworkModal(true)}
            className="flex-grow p-4 bg-gray-50 dark:bg-gray-700 hover:bg-[#F9FBFD] hover:dark:bg-[#1c1c1c] hover:cursor-pointer rounded-l-xl border border-slate-300 dark:border-slate-500"
          >
            <img
              className="flex-1 rounded-lg w-8 h-8 dropshadow-lg"
              src={`${
                selectedTokenAndNetwork.tokenData
                  ? selectedTokenAndNetwork.tokenData.tokenDb.logoURI
                  : selectedTokenAndNetwork.baseNetworkDb.iconPath
              }`}
            />
          </div>
          <input
            onFocus={() => setShowDarkener(true)}
            type="search"
            autoComplete="off"
            id="search-dropdown"
            className="w-[88%]  p-4 text-gray-900 text-lg bg-gray-50 border rounded-r-xl border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white font-bold outline-none"
            placeholder={`Search ${
              selectedTokenAndNetwork.tokenData
                ? formatTicker(selectedTokenAndNetwork.tokenData.tokenDb.symbol)
                : formatTicker(selectedTokenAndNetwork.baseNetworkDb.ticker)
            } name or address`}
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            required
          />
        </div>

        {searchresults.length != 0 && (
          <div className="ml-[12%] relative z-10 max-h-80 my-2 rounded-xl px-2 py-2 bg-white text-slate-500 dark:bg-gray-700 dark:text-slate-200 divide-y divide-gray-200 dark:divide-gray-600 overflow-auto no-scrollbar">
            {searchresults.length != 0 &&
              searchresults.map(
                (searchResult: ISearchResult, index: number) => {
                  return (
                    <SearchResultItem searchResult={searchResult} key={index} />
                  );
                }
              )}
          </div>
        )}
      </div>

      {/* screen darkener */}
      <div
        onClick={() => setShowDarkener(false)}
        className={`${
          !showDarkener && "hidden"
        } modal fixed w-full h-full top-0 left-0 z-0 flex items-center justify-center overflow-y-auto`}
        style={{ backgroundColor: `rgba(0, 0, 0, 0.2)` }}
      ></div>

      <Modal
        isOpen={showNetworkModal}
        dark={true}
        onRequestClose={handleModalClose}
      >
        <div className="flex md:flex-row flex-col">
          <div className="flex-1 text-left py-4 px-3 dark:text-white bg-white dark:bg-black md:ml-6 mt-8 md:mt-0 rounded-lg min-h-[30rem] md:min-h-[25rem] h-fit md:max-h-[40rem] dark:border dark:border-gray-100 md:overflow-x-hidden overflow-y-auto no-scrollbar">
            <h1 className="text-3xl font-bold mb-2">What is this?</h1>
            <p>
              You are now choosing a blockchain to interact with. Blockchains
              like{" "}
              <span
                style={{
                  color: `${
                    selectedTokenAndNetwork.tokenData
                      ? selectedTokenAndNetwork.tokenData.tokenDb.hexColor
                      : selectedTokenAndNetwork.baseNetworkDb.hexColor
                  }`,
                }}
              >
                {selectedTokenAndNetwork.tokenData
                  ? selectedTokenAndNetwork.tokenData.tokenDb.name
                  : selectedTokenAndNetwork.baseNetworkDb.fullName}
              </span>{" "}
              have unique tokens that you can send, save, and collect. Kryptik
              makes it easy to access <span className="text-sky-500">10+</span>{" "}
              blockchains.
            </p>
          </div>

          <div className="flex-1 pt-4 px-3 dark:text-white bg-white dark:bg-black md:ml-6 mt-8 md:mt-0 rounded-lg min-h-[30rem] md:min-h-[25rem] h-fit md:max-h-[40rem] dark:border dark:border-gray-100 md:overflow-x-hidden overflow-y-auto no-scrollbar">
            <div className="flex">
              <div className="flex-1"></div>
              <h1 className="text-2xl font-bold">Change Network</h1>
              <div className="flex-grow">
                <button
                  type="button"
                  className="float-right text-gray-200 dark:text-gray-700 rounded-full font-semibold text-sm p-1.5 ml-auto items-center transition ease-in-out hover:scale-110"
                  onClick={() => setShowNetworkModal(false)}
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </button>
              </div>
            </div>

            <div className="max-w-[90%] mx-auto">
              <DropdownNetworks
                onlyNetworks={true}
                selectedTokenAndNetwork={selectedTokenAndNetwork}
                selectFunction={handleSelectedNetworkChange}
              />
            </div>
            <p className="text-slate-400 dark:text-slate-500 text-sm mt-2">
              You will now be able to search and find{" "}
              {selectedTokenAndNetwork.tokenData
                ? formatTicker(selectedTokenAndNetwork.tokenData.tokenDb.symbol)
                : formatTicker(
                    selectedTokenAndNetwork.baseNetworkDb.ticker
                  )}{" "}
              names.
            </p>
          </div>
        </div>
      </Modal>

      <div className="md:hidden min-h-[4rem] dark:text-white">
        {/* padding div for space between top and main elements */}
      </div>
    </div>
  );
};

export default SearchNetwork;
