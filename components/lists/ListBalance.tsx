import { NextPage } from "next";
import { useEffect, useState } from "react";

import { useKryptikAuthContext } from "../KryptikAuthProvider";
import ListItemBalance from "./ListItemBalance";
import Divider from "../Divider";
import ListItemLoading from "./ListItemLoading";
import { roundToDecimals } from "../../src/helpers/utils/numberUtils";
import { useKryptikThemeContext } from "../ThemeProvider";
import { useRouter } from "next/router";
import { ServiceState } from "../../src/services/types";
import { TokenAndNetwork } from "../../src/services/models/token";
import { AiOutlineRedo } from "react-icons/ai";
import { WalletStatus } from "../../src/models/KryptikWallet";
import AvailableNetworks from "../networks/AvailableNetworks";
import BuyEth from "../BuyEth";
import { PubSub } from "pubsub-ts";

const ListBalance: NextPage = () => {
  const { kryptikService, kryptikWallet, refreshBalances } =
    useKryptikAuthContext();
  const [balanceHolder, setBalanceHolder] = useState(
    kryptikService.kryptikBalances
  );
  // ensure service is started
  const router = useRouter();
  const { isAdvanced, hideBalances } = useKryptikThemeContext();
  const [isFetchedBalances, setIsFetchedBalances] = useState(
    !balanceHolder.isLoading
  );
  const [isManualRefresh, setIsManualRefresh] = useState(false);
  const [tokenAndBalances, setTokenAndBalances] = useState<TokenAndNetwork[]>(
    []
  );
  const [totalBalance, setTotalBalance] = useState<number>(0);
  const [progressPercent, setProgressPercent] = useState(0);
  const [addedSubscriber, setAddedSubscriber] = useState(false);

  //TODO: ACCOUNT FOR TOKENS ON MULTIPLE NETWORKS

  class BalanceManager extends PubSub.Subscriber {
    public totalToFetch: number;
    constructor(totalToFetch: number) {
      super();
      this.on("incrementBalance", this.onBalanceIncrement);
      this.on("loading", this.onLoading);
      this.totalToFetch = totalToFetch;
    }
    public onBalanceIncrement(notification: PubSub.Notification) {
      const data = notification.body;
      const fetchCount: number = data.fetchCount || 0;
      //TODO: SEE IF POSSIBLE TO ONLY GET ONCE
      const progressBar = document.getElementById("progressBar");
      if (progressBar) {
        const currentProgress = (fetchCount / this.totalToFetch) * 100;
        // update ui progress percent.. not to exceed 100%
        if (currentProgress > 100) {
          progressBar.style.width = `${100}%`;
          setProgressPercent(100);
        } else {
          progressBar.style.width = `${currentProgress}%`;
          setProgressPercent(currentProgress);
        }
      }
    }
    // TODO: BEING CALLED MULTIPLE TIMES
    public onLoading(notification: PubSub.Notification) {
      const newIsLoading = notification.body;
      if (kryptikService.kryptikBalances.isLoading || newIsLoading) {
        return;
      }
      const newTokenAndBals: TokenAndNetwork[] =
        kryptikService.kryptikBalances.getNonzeroBalances(isAdvanced);
      const newTotalBal: number =
        kryptikService.kryptikBalances.getTotalBalance();
      setTotalBalance(newTotalBal);
      setTokenAndBalances(newTokenAndBals);
      setIsManualRefresh(false);
      setIsFetchedBalances(true);
    }
  }

  const handleManualRefresh = function () {
    console.log("RUNNING MANUAL REFRESH");
    if (!isManualRefresh) {
      setIsManualRefresh(true);
    }
    setProgressPercent(0);
    fetchBalances(true);
    setIsFetchedBalances(false);
  };

  // retrieves wallet balances... done for manual refresh
  const fetchBalances = async (manualRefresh = false) => {
    if (kryptikWallet.status != WalletStatus.Connected) return;
    if (!kryptikService.kryptikBalances) return;
    // start async balance refresh
    console.log("refreshing balances..");
    refreshBalances();
  };

  useEffect(() => {
    // if (kryptikService.serviceState != ServiceState.started) {
    //   router.push("/");
    // }
    if (addedSubscriber) {
      return;
    }
    // instantiate balance manager
    const newBalanceManager = new BalanceManager(
      kryptikService.NetworkDbs.length + kryptikService.tokenDbs.length * 2
    );
    // enable notification processing
    newBalanceManager.start();
    kryptikService.kryptikBalances.add(newBalanceManager);
    const newBalances =
      kryptikService.kryptikBalances.getNonzeroBalances(isAdvanced);
    const newTotalBal: number =
      kryptikService.kryptikBalances.getTotalBalance();
    setTotalBalance(newTotalBal);
    setTokenAndBalances(newBalances);
    setAddedSubscriber(true);
  }, []);

  useEffect(() => {
    // pass for now
  }, [isFetchedBalances]);

  return (
    <div>
      <div className="pt-4 pb-4 border rounded rounded-xl border-gray-500 dark:border-gray-300 dark:bg-[#030709]">
        <div>
          <div className="flex flex-row px-3 py-2">
            <div className="">
              {isFetchedBalances || balanceHolder.hasCache ? (
                <div className="flex flex-col">
                  <h1 className="text-lg font-semibold text-slate-700 dark:text-slate-200">
                    Your Balance
                  </h1>
                  <h1
                    className={`text-left text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-sky-500 to-green-400 hover:text-sky-400 ${
                      hideBalances
                        ? "blur-md text-2xl text-sky-400 dark:text-white"
                        : ""
                    }`}
                  >
                    ${roundToDecimals(totalBalance, 2)}
                  </h1>
                </div>
              ) : (
                <div className="flex flex-col space-y-4">
                  <h1 className="text-lg font-semibold text-slate-700 dark:text-slate-200">
                    Your Balance
                  </h1>
                  <div className="w-20 h-6 my-auto bg-gray-400 animate-pulse rounded"></div>
                </div>
              )}
            </div>

            <div className="flex-grow text-right min-y-full">
              {isFetchedBalances && (
                <div className="text-slate-500 dark:text-slate-500 bottom-0 pt-8">
                  <h2 className="text-sm inline">
                    Last Updated: {balanceHolder?.getLastUpdateTimestamp()}
                  </h2>
                  {isManualRefresh ? (
                    <svg
                      role="status"
                      className="inline w-4 h-4 ml-3 text-white animate-spin"
                      viewBox="0 0 100 101"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                        fill="#E5E7EB"
                      />
                      <path
                        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                        fill="currentColor"
                      />
                    </svg>
                  ) : (
                    <AiOutlineRedo
                      className="inline pl-2 hover:cursor-pointer"
                      onClick={() => handleManualRefresh()}
                      size={25}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
          {/* progress bar */}
          {!isFetchedBalances && (
            <div className="max-w-full bg-gray-200 dark:bg-[#141414] rounded-full h-6 mx-2">
              <div
                id="progressBar"
                className="bg-gradient-to-r from-sky-400 to-sky-600 h-6 rounded-full text-gray-700"
                style={{ width: `0%`, maxWidth: `100%`, paddingLeft: "2%" }}
              >
                {progressPercent > 5
                  ? `${roundToDecimals(progressPercent, 2)}%`
                  : ""}
              </div>
            </div>
          )}

          <Divider />
          {/* Network balances list display*/}
        </div>
        {!isFetchedBalances && !isManualRefresh && !balanceHolder.hasCache ? (
          <ul role="list">
            {
              <div>
                <ListItemLoading />
                <ListItemLoading />
                <ListItemLoading />
              </div>
            }
          </ul>
        ) : tokenAndBalances.length == 0 ? (
          <div className="max-w-full m-2 py-2 px-4 bg-gray-300 dark:bg-gray-800 rounded">
            <div className="flex flex-row">
              <div className="my-auto">
                <AvailableNetworks />
              </div>
              <div className="ml-2 text-left">
                <h1 className="text-xl text-left text-slate-900 dark:text-slate-100 font-bold">
                  Deposit Tokens
                </h1>
                <p className=" text-slate-500 dark:text-slate-400">
                  You'll need tokens to use your wallet!
                </p>
              </div>
            </div>
            <div className="flex flex-row my-4">
              <div className="flex-grow">
                <div className="float-right">
                  <BuyEth />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <ul
              role="list"
              className="divide-y divide-gray-200 dark:divide-gray-700"
            >
              {tokenAndBalances.map(
                (tokenAndBalance: TokenAndNetwork, index: number) => (
                  <ListItemBalance
                    key={index}
                    tokenAndNetwork={tokenAndBalance}
                    htmlKey={index}
                  />
                )
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListBalance;
