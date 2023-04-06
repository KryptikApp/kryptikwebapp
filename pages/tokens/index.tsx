import type { NextPage } from "next";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { useKryptikAuthContext } from "../../components/KryptikAuthProvider";
import React from "react";
import { Chart } from "react-chartjs-2";
import "chartjs-adapter-date-fns";
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  TimeScale,
  Tooltip,
  LineController,
} from "chart.js";
import Divider from "../../components/Divider";
import { removeHttp } from "../../src/helpers/utils";
import { formatTicker } from "../../src/helpers/utils/networkUtils";
import {
  roundToDecimals,
  roundUsdAmount,
} from "../../src/helpers/utils/numberUtils";
import { useKryptikThemeContext } from "../../components/ThemeProvider";
import { fetchServerHistoricalPrices } from "../../src/requests/prices";
import { TokenAndNetwork } from "../../src/services/models/token";

ChartJS.register(
  LinearScale,
  PointElement,
  LineElement,
  TimeScale,
  LineController,
  Tooltip
);

interface IChartData {
  labels: number[];
  datasets: {
    label: string;
    data: number[];
    borderColor: CanvasGradient | string | undefined;
    tension: number;
  }[];
}

const CoinInfo: NextPage = () => {
  const { kryptikService } = useKryptikAuthContext();
  const { isDark } = useKryptikThemeContext();
  const defualtHistoricalData: number[][] = [];
  const [historicalData, setHistoricalData] = useState(defualtHistoricalData);
  const defaultDataArray: number[] = [];
  const [prices, setPrices] = useState(defaultDataArray);
  const [loaded, setLoaded] = useState(false);
  const [percentChange, setPercentChange] = useState(0);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [times, setTimes] = useState(defaultDataArray);
  const [activeLookback, setActiveLookbook] = useState("1D");
  const [tokenAndNetwork, setTokenAndNetwork] =
    useState<TokenAndNetwork | null>(null);
  const [chartData, setChartData] = useState<IChartData | null>(null);
  const [assetId, setAssetId] = useState("");
  const chartRef = useRef<ChartJS>(null);

  const router = useRouter();

  //maps lookback string to number of days
  const lookbackDict: { [name: string]: number } = {
    "1D": 1,
    "7D": 7,
    "1M": 30,
    "3M": 90,
    "1Y": 365,
  };

  // get asset price on page load
  useEffect(() => {
    // default network ticker to ethereum ticker
    let networkTicker: string = "eth";
    let tokenTicker: string | null = "";
    // pull network ticker from route
    if (typeof router.query["networkTicker"] == "string") {
      networkTicker = router.query["networkTicker"];
    }
    // pull token ticker from route
    if (
      router.query["tokenTicker"] &&
      typeof router.query["tokenTicker"] == "string"
    ) {
      tokenTicker = router.query["tokenTicker"];
    }
    let newTokenAndNetwork = kryptikService.getTokenAndNetworkFromTickers(
      networkTicker,
      tokenTicker ? tokenTicker : undefined
    );
    setTokenAndNetwork(newTokenAndNetwork);
  }, []);

  const updateHistoricalData = async function (daysBack: number) {
    if (!tokenAndNetwork) return;
    let coingeckoId: string;
    if (tokenAndNetwork.tokenData) {
      coingeckoId = tokenAndNetwork.tokenData.tokenDb.coingeckoId;
    } else {
      coingeckoId = tokenAndNetwork.baseNetworkDb.coingeckoId;
    }
    // fetch historical data for asset. Default 1 day
    let newHistoricalData = await fetchServerHistoricalPrices(
      coingeckoId,
      daysBack
    );
    if (!newHistoricalData) {
      return;
    }
    // update meta
    let newTimes: number[] = [];
    let newPrices: number[] = [];
    // extract times and prices from the historical data object
    for (let i = 0; i < newHistoricalData.prices.length; i++) {
      newTimes.push(newHistoricalData.prices[i][0]);
      newPrices.push(newHistoricalData.prices[i][1]);
    }
    // update percentage change when prices change
    let currentPrice = newPrices[newPrices.length - 1];
    let initialPrice = newPrices[0];
    if (!currentPrice || !initialPrice) {
      return;
    }
    let amountChange = currentPrice - initialPrice;
    let percentChange = amountChange / initialPrice;
    percentChange = roundToDecimals(percentChange * 100, 2);
    const newChartData = {
      labels: newTimes,
      datasets: [
        {
          label: `${formatTicker(
            tokenAndNetwork.tokenData
              ? tokenAndNetwork.tokenData.tokenDb.ticker
              : tokenAndNetwork.baseNetworkDb.ticker
          )} Price`,
          data: newPrices,
          borderColor: "#30b0ff",
          tension: 0.3,
        },
      ],
    };
    // update local state
    setChartData(newChartData);
    setHistoricalData(newHistoricalData.prices);
    setAssetId(coingeckoId);
    setTimes(newTimes);
    setPrices(newPrices);
    setPercentChange(percentChange);
    if (daysBack == 1) {
      setCurrentPrice(currentPrice);
    }
    setLoaded(true);
  };

  useEffect(() => {
    updateHistoricalData(1);
  }, [tokenAndNetwork]);

  // get asset price with dynamic lookback
  useEffect(() => {
    if (assetId == "") return;
    let numDays: number = lookbackDict[activeLookback]
      ? lookbackDict[activeLookback]
      : 1;
    updateHistoricalData(numDays);
  }, [activeLookback]);

  const createGradient = function (
    tokenAndNetworkForLine: TokenAndNetwork
  ): CanvasGradient | undefined {
    const chart = chartRef.current;
    if (!chart) {
      return undefined;
    }
    const gradient = chart.ctx.createLinearGradient(0, 0, 0, 400);
    // UPDATE FOR DARK SCHEME
    gradient.addColorStop(
      0,
      tokenAndNetworkForLine.tokenData
        ? tokenAndNetworkForLine.tokenData.tokenDb.hexColor
        : tokenAndNetworkForLine.baseNetworkDb.hexColor
    );
    gradient.addColorStop(1, `${isDark ? "#b5b5b5" : "#11161a"}`);
    return gradient;
  };

  return (
    <div>
      <div className="h-[1rem]">
        {/* padding div for space between top of screen and main elements */}
      </div>

      <div className="text-center max-w-2xl mx-auto content-center">
        {tokenAndNetwork && (
          <div>
            <div className="flex flex-row mb-4">
              {/* icon */}
              <div className="flex-shrink-0">
                <img
                  className="w-8 h-8 rounded-full inline"
                  src={
                    tokenAndNetwork.tokenData
                      ? tokenAndNetwork.tokenData.tokenDb.logoURI
                      : tokenAndNetwork.baseNetworkDb.iconPath
                  }
                  alt={`Token image`}
                />
                {tokenAndNetwork.tokenData && (
                  <img
                    className="w-4 h-4 -ml-2 drop-shadow-lg mt-4 rounded-full inline"
                    src={tokenAndNetwork.baseNetworkDb.iconPath}
                    alt={`Base network image`}
                  />
                )}
              </div>
              {/* token name and... price and percent change */}
              <div className="flex-1 min-w-0 text-left md:ml-2">
                <div>
                  <div>
                    <h1
                      className="text-2xl font-bold truncate dark:text-white"
                      style={{
                        color: `${
                          tokenAndNetwork.tokenData
                            ? tokenAndNetwork.tokenData.tokenDb.hexColor
                            : tokenAndNetwork.baseNetworkDb.hexColor
                        }`,
                      }}
                    >
                      {tokenAndNetwork.tokenData
                        ? tokenAndNetwork.tokenData.tokenDb.name
                        : tokenAndNetwork.baseNetworkDb.fullName}{" "}
                      (
                      {formatTicker(
                        tokenAndNetwork.tokenData
                          ? tokenAndNetwork.tokenData.tokenDb.ticker
                          : tokenAndNetwork.baseNetworkDb.ticker
                      )}
                      )
                    </h1>
                  </div>
                  {loaded && (
                    <div>
                      <span className={`text-3xl text-black dark:text-white`}>
                        ${roundUsdAmount(currentPrice)}
                      </span>{" "}
                      <span
                        className={`text-base font-semibold mt-1 mx-2 ${
                          percentChange > 0 ? "text-green-500" : "text-red-600"
                        }`}
                      >
                        {percentChange}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {chartData ? (
              <Chart
                ref={chartRef}
                data={chartData}
                type="line"
                options={{
                  scales: {
                    x: {
                      type: "time",
                      time: {
                        unit: "day",
                      },
                      grid: {
                        display: false,
                        borderColor: `${isDark ? "#f2f2f0" : "#11161a"}`,
                      },
                    },
                    y: {
                      grid: {
                        display: false,
                        borderColor: `${isDark ? "#f2f2f0" : "#11161a"}`,
                      },
                    },
                  },
                  elements: {
                    point: {
                      borderWidth: 0,
                      radius: 10,
                      backgroundColor: "rgba(20,0,0,0)",
                    },
                  },
                  plugins: {
                    legend: {
                      display: false,
                    },
                    tooltip: {
                      callbacks: {
                        label: function (context) {
                          let label = context.dataset.label || "";

                          if (label) {
                            label += ": ";
                          }
                          if (context.parsed.y !== null) {
                            label += new Intl.NumberFormat("en-US", {
                              style: "currency",
                              currency: "USD",
                            }).format(context.parsed.y);
                          }
                          return label;
                        },
                      },
                    },
                  },
                }}
                width={400}
                height={400}
              />
            ) : !loaded ? (
              <div className="my-4">
                <p className="text-gray-600 dark:text-gray-400 font-semibold inline">
                  Loading{" "}
                  {tokenAndNetwork.tokenData
                    ? tokenAndNetwork.tokenData.tokenDb.name
                    : tokenAndNetwork.baseNetworkDb.fullName}{" "}
                  prices
                </p>
                <svg
                  role="status"
                  className="inline w-4 h-4 ml-3 text-black dark:text-white animate-spin"
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
              </div>
            ) : (
              <div className="my-4">
                <p className="text-gray-600 dark:text-gray-400 font-semibold my-2">
                  Unable to load{" "}
                  {tokenAndNetwork.tokenData
                    ? tokenAndNetwork.tokenData.tokenDb.name
                    : tokenAndNetwork.baseNetworkDb.fullName}{" "}
                  prices
                </p>
              </div>
            )}

            <div className="flex flex-row">
              <div className="flex-1">{/* space filler */}</div>

              <div className="flex-1">{/* space filler */}</div>

              <div className="flex-3 content-end">
                <ul className="flex flex-wrap text-sm font-medium text-center text-gray-500 dark:text-gray-400">
                  <li className="mr-2">
                    <div
                      onClick={() => setActiveLookbook("1D")}
                      className={`inline-block py-3 px-4 rounded-lg hover:text-gray-900 hover:cursor-pointer  dark:hover:text-white ${
                        activeLookback == "1D"
                          ? `active text-white bg-sky-500`
                          : "hover:bg-gray-400"
                      }`}
                      aria-current="page"
                    >
                      1D
                    </div>
                  </li>
                  <li className="mr-2">
                    <div
                      onClick={() => setActiveLookbook("7D")}
                      className={`inline-block py-3 px-4 rounded-lg hover:text-gray-900 hover:cursor-pointer  dark:hover:text-white ${
                        activeLookback == "7D"
                          ? "active text-white bg-sky-500"
                          : "hover:bg-gray-400"
                      }`}
                    >
                      7D
                    </div>
                  </li>
                  <li className="mr-2">
                    <div
                      onClick={() => setActiveLookbook("1M")}
                      className={`inline-block py-3 px-4 rounded-lg hover:text-gray-900 hover:cursor-pointer  dark:hover:text-white ${
                        activeLookback == "1M"
                          ? "active text-white bg-sky-500"
                          : "hover:bg-gray-400"
                      }`}
                    >
                      1M
                    </div>
                  </li>
                  <li className="mr-2">
                    <div
                      onClick={() => setActiveLookbook("3M")}
                      className={`inline-block py-3 px-4 rounded-lg hover:text-gray-900 hover:cursor-pointer  dark:hover:text-white ${
                        activeLookback == "3M"
                          ? "active text-white bg-sky-500"
                          : "hover:bg-gray-400"
                      }`}
                    >
                      3M
                    </div>
                  </li>
                  <li>
                    <div
                      onClick={() => setActiveLookbook("1Y")}
                      className={`inline-block py-3 px-4 rounded-lg hover:text-gray-900 hover:cursor-pointer  dark:hover:text-white ${
                        activeLookback == "1Y"
                          ? "active text-white bg-sky-500"
                          : "hover:bg-gray-400"
                      }`}
                    >
                      1Y
                    </div>
                  </li>
                </ul>
              </div>
            </div>
            <Divider />
          </div>
        )}

        {loaded && tokenAndNetwork && (
          <div>
            <div className="text-left mt-4 mb-20 text-lg dark:text-white">
              <h2 className="font-semibold">About</h2>
              <p>
                {tokenAndNetwork.tokenData
                  ? tokenAndNetwork.tokenData.tokenDb.description
                  : tokenAndNetwork.baseNetworkDb.about}
              </p>
            </div>

            <div className="border border-solid border-1 border-gray-500 dark:border-gray-400 py-4 rounded-lg">
              <div className="flex flex-row">
                <div className="flex-1">
                  <div className="flex-1 content-end">
                    {/* update.... space filler for now. */}
                  </div>
                </div>
                <a
                  href={
                    tokenAndNetwork.tokenData
                      ? tokenAndNetwork.tokenData.tokenDb.link
                      : tokenAndNetwork.baseNetworkDb.whitePaperPath
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="flex-1 content-end">
                    <div className="rounded hover:bg-sky-500 hover:text-white text-black dark:text-white font-semibold border border-solid border-gray-400 hover:border-white dark:border-gray-500 py-1 mx-4 px-2">
                      <span>
                        {tokenAndNetwork.tokenData
                          ? `${removeHttp(
                              tokenAndNetwork.tokenData.tokenDb.link
                            )}`
                          : "Whitepaper"}
                      </span>
                    </div>
                  </div>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="h-[4rem]">
        {/* padding div for space between bottom of screen and main elements */}
      </div>
    </div>
  );
};

export default CoinInfo;
