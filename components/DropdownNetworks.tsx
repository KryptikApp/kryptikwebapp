import { NextPage } from "next";
import { useEffect, useState } from "react";

import { TokenAndNetwork } from "../src/services/models/token";
import { useKryptikAuthContext } from "./KryptikAuthProvider";
import ListItemDropdown from "./lists/ListItemDropwdown";

import { title } from "process";
import { useKryptikThemeContext } from "./ThemeProvider";
import { KryptikBalanceHolder } from "../src/services/models/KryptikBalanceHolder";

interface Props {
  onlyWithValue?: boolean;
  onlyNetworks?: boolean;
  selectedTokenAndNetwork: TokenAndNetwork;
  selectFunction: any;
  onLoadedFunction?: any;
  hideLabel?: boolean;
}
const DropdownNetworks: NextPage<Props> = (props) => {
  const {
    selectedTokenAndNetwork,
    selectFunction,
    onlyWithValue,
    onLoadedFunction,
    hideLabel,
    onlyNetworks,
  } = props;
  const { kryptikService, authUser, kryptikWallet } = useKryptikAuthContext();
  const { isAdvanced } = useKryptikThemeContext();
  const [networkAndTokens, setNetworkAndTokens] = useState<TokenAndNetwork[]>(
    []
  );
  const [isFetched, setIsFetched] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  // retrieves wallet balances
  const fetchTokenAndNetworks = async () => {
    // ensure kryptik service is started
    await kryptikService.StartSevice();
    let newTokensAndNetworks: TokenAndNetwork[] = [];

    // remove zero balances, if requested
    if (onlyWithValue) {
      // get balances
      let balanceHolder: KryptikBalanceHolder = kryptikService.kryptikBalances;
      newTokensAndNetworks = balanceHolder.getNonzeroBalances();
    }
    //TODO: FIX TO SHOW TOKENS AS WELL
    else {
      let networkDbs = kryptikService.NetworkDbs;
      for (const nw of networkDbs) {
        newTokensAndNetworks.push({ baseNetworkDb: nw });
      }
    }
    setNetworkAndTokens(newTokensAndNetworks);
    // update selected network to be first in possible options
    if (newTokensAndNetworks.length != 0 && onlyWithValue)
      selectFunction(newTokensAndNetworks[0]);
    setIsFetched(true);
    if (onLoadedFunction) {
      onLoadedFunction();
    }
  };

  const toggleShowOptions = async () => {
    setShowOptions(!showOptions);
  };

  const handleOptionClick = function (tokenAndNetwork: TokenAndNetwork) {
    selectFunction(tokenAndNetwork);
    toggleShowOptions();
  };

  useEffect(() => {
    fetchTokenAndNetworks();
  }, []);

  return (
    <div>
      {!isFetched ? (
        <div>
          <label
            id="listbox-label"
            className="block text-sm font-medium text-gray-700 text-left dark:text-gray-200"
          >
            Token
          </label>
          {/* skeleton loader */}
          <div className="mt-1 relative">
            <div className="relative w-full bg-gray-400 border border-gray-300 rounded-md shadow-sm pl-3 pr-10 h-8 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-sky-500 sm:text-sm animate-pulse" />
          </div>
        </div>
      ) : (
        <div>
          {!hideLabel && (
            <label
              id="listbox-label"
              className="block text-sm font-medium text-gray-700 text-left dark:text-gray-200 mb-1"
            >
              {onlyNetworks ? "Network" : "Token"}
            </label>
          )}
          <div className="relative" onClick={() => toggleShowOptions()}>
            <button
              type="button"
              className="relative w-full bg-white dark:bg-black border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
              aria-haspopup="listbox"
              aria-expanded="true"
              aria-labelledby="listbox-label"
            >
              <span className="flex items-center">
                {selectedTokenAndNetwork.tokenData ? (
                  <div className="py-1">
                    <img
                      src={selectedTokenAndNetwork.tokenData.tokenDb.logoURI}
                      alt={`${title} icon`}
                      className="flex-shrink-0 h-6 w-6 rounded-full inline"
                    />
                    <img
                      className="w-4 h-4 -ml-2 drop-shadow-lg mt-4 rounded-full inline"
                      src={selectedTokenAndNetwork.baseNetworkDb.iconPath}
                      alt={`${title} secondary image`}
                    />
                    <span className="ml-3 block truncate inline dark:text-white">
                      {" "}
                      {selectedTokenAndNetwork.tokenData.tokenDb.name}
                    </span>
                  </div>
                ) : (
                  <div className="py-1">
                    <img
                      src={selectedTokenAndNetwork.baseNetworkDb.iconPath}
                      alt={`${title} icon`}
                      className="flex-shrink-0 h-6 w-6 rounded-full inline"
                    />
                    <span className="ml-3 block truncate inline dark:text-white">
                      {" "}
                      {selectedTokenAndNetwork.baseNetworkDb.fullName}
                    </span>
                  </div>
                )}
              </span>
              <span className="ml-3 absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                {/* selector icon solid */}
                <svg
                  className="h-5 w-5 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
            </button>

            <ul
              className="no-scrollbar absolute z-10 mt-1 w-full bg-white dark:bg-black opacity-95 shadow-lg max-h-56 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm dark:border dark:border-slate-500"
              tabIndex={-1}
              role="listbox"
              aria-labelledby="listbox-label"
              aria-activedescendant="listbox-option-3"
              hidden={!showOptions}
            >
              {onlyWithValue && networkAndTokens.length == 0 ? (
                <li className="py-2">
                  <p className="dark:text-white">No Token Balances Available</p>
                </li>
              ) : (
                networkAndTokens.map(
                  (nt: TokenAndNetwork, index: number) =>
                    !(
                      nt.baseNetworkDb.isTestnet &&
                      authUser &&
                      !authUser.isAdvanced
                    ) && (
                      <ListItemDropdown
                        selectedTokenAndNetwork={selectedTokenAndNetwork}
                        selectFunction={handleOptionClick}
                        tokenAndNetwork={nt}
                        key={index}
                      />
                    )
                )
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default DropdownNetworks;
