import type { NextPage } from 'next'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import { useKryptikAuthContext } from '../../components/KryptikAuthProvider'
import { getHistoricalPriceForTicker } from "../../src/helpers/coinGeckoHelper";
import React from 'react';
import {Chart} from 'react-chartjs-2';
import "chartjs-adapter-date-fns"
import {Chart as ChartJS, LinearScale, PointElement, LineElement, TimeScale, Tooltip} from 'chart.js'
import { defaultTokenAndNetwork } from '../../src/services/models/network';
import { formatTicker, roundToDecimals, roundUsdAmount } from '../../src/helpers/wallet/utils';
import Divider from '../../components/Divider';
import { removeHttp } from '../../src/helpers/utils';

ChartJS.register(LinearScale, PointElement, LineElement, TimeScale, Tooltip);


const coinInfo: NextPage = () => {
  const {kryptikService} = useKryptikAuthContext();
  const defualtHistoricalData:number[][] = []
  const [historicalData, setHistoricalData] = useState(defualtHistoricalData);
  const defaultDataArray:number[] = [];
  const [prices, setPrices] = useState(defaultDataArray);
  const [loaded, setLoaded] = useState(false);
  const [percentChange, setPercentChange] = useState(0);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [times, setTimes] = useState(defaultDataArray);
  const [activeLookback, setActiveLookbook] = useState('1D');
  const [tokenAndNetwork, setTokenAndNetwork] = useState(defaultTokenAndNetwork);
  const [assetId, setAssetId] = useState("");
  const chartRef = useRef<ChartJS>(null);  

  const router = useRouter();
  
  //maps lookback string to number of days
  const lookbackDict:{ [name: string]: number } = {
    '1D': 1,
    '7D': 7,
    '1M': 30,
    '3M': 90,
    '1Y': 365
  }

  // get asset price on page load
  useEffect(() => {
    // default network ticker to ethereum ticker
    let networkTicker:string = "eth";
    let tokenTicker:string|null = "";
    // pull network ticker from route
    if ((typeof(router.query["networkTicker"]) == "string") ) {
      networkTicker = router.query["networkTicker"];
    }
    // pull token ticker from route
    if(router.query["tokenTicker"] && (typeof(router.query["tokenTicker"]) == "string")){
      tokenTicker = router.query["tokenTicker"];
    }
    let networkData = kryptikService.getTokenAndNetworkFromTickers(networkTicker, tokenTicker?tokenTicker:undefined);
    setTokenAndNetwork(networkData); 
  }, [])

  // update percent difference when prices change
  useEffect(()=>{
    let currentPrice = prices[prices.length-1];
    let initialPrice = prices[0];
    if(!currentPrice || !initialPrice){
      return;
    }
    let amountChange = currentPrice-initialPrice;
    let percentChange = amountChange/initialPrice;
    percentChange = roundToDecimals(percentChange*100, 2);
    setPercentChange(percentChange);
    setCurrentPrice(currentPrice);
    setLoaded(true);
  }, [prices])

  useEffect(()=>{
    let coingeckoId:string;
    if(tokenAndNetwork.tokenData){
      coingeckoId = tokenAndNetwork.tokenData.tokenDb.coingeckoId;
    }
    else{
      coingeckoId = tokenAndNetwork.baseNetworkDb.coingeckoId;
    }
    // fetch historical data for asset. Default 1 day
    getHistoricalPriceForTicker(coingeckoId, 1, setHistoricalData);
    setAssetId(coingeckoId);
  }, [tokenAndNetwork])

  // get asset price with dynamic lookback
  useEffect(()=>{
    if(assetId == "") return;
    let numDays:number = lookbackDict[activeLookback]?lookbackDict[activeLookback]:1;
    getHistoricalPriceForTicker(assetId, numDays, setHistoricalData);
  }, [activeLookback])

  // runs when historical data changes
  useEffect(() => {
    let newTimes:number[] = [];
    let newPrices:number[] = [];
    // extract times and prices from the historical data object
    for (let i = 0; i < historicalData.length; i++) {
      newTimes.push(historicalData[i][0]);
      newPrices.push(historicalData[i][1]);
    }
    // update local state
    setTimes(newTimes);
    setPrices(newPrices);
  }, [historicalData])

  const createGradient = function():CanvasGradient|undefined{
    const chart = chartRef.current;
    if (!chart) {
      return undefined;
    }
    const gradient = chart.ctx.createLinearGradient(0, 0, 0, 400);
    // UPDATE FOR DARK SCHEME
    gradient.addColorStop(0, tokenAndNetwork.tokenData?tokenAndNetwork.tokenData.tokenDb.hexColor:tokenAndNetwork.baseNetworkDb.hexColor)
    gradient.addColorStop(1, "#11161a");
    return gradient;
  }

  
  const data = {
    labels: times,
    datasets: [{
      label: `${formatTicker(tokenAndNetwork.tokenData?tokenAndNetwork.tokenData.tokenDb.symbol:tokenAndNetwork.baseNetworkDb.ticker)} Price`,
      data: prices,
      borderColor: createGradient(),
      tension: 0.3
    }],
  };    


  return (
    <div>
       <div className="h-[1rem]">
          {/* padding div for space between top of screen and main elements */}
        </div>

        <div className="text-center max-w-2xl mx-auto content-center">
        {
          loaded &&
          <div className="flex flex-row mb-4">
             {/* icon and token name */}
             <div className="flex-shrink-0">
                  <img className="w-8 h-8 rounded-full inline" src={tokenAndNetwork.tokenData?tokenAndNetwork.tokenData.tokenDb.logoURI:tokenAndNetwork.baseNetworkDb.iconPath} alt={`Token image`}/>
                  {
                    tokenAndNetwork.tokenData &&
                    <img className="w-4 h-4 -ml-2 drop-shadow-lg mt-4 rounded-full inline" src={tokenAndNetwork.baseNetworkDb.iconPath} alt={`Base network image`}/>
                  }
              </div>
              {/* price and percent change */}
              <div className="flex-1 min-w-0 content-start text-left ml-2">
                    <div>
                        <h1 className="text-2xl font-bold truncate" style={{color:`${tokenAndNetwork.tokenData?tokenAndNetwork.tokenData.tokenDb.hexColor:tokenAndNetwork.baseNetworkDb.hexColor}`}}>
                            {tokenAndNetwork.tokenData?tokenAndNetwork.tokenData.tokenDb.name:tokenAndNetwork.baseNetworkDb.fullName} ({formatTicker(tokenAndNetwork.tokenData?tokenAndNetwork.tokenData.tokenDb.symbol:tokenAndNetwork.baseNetworkDb.ticker)})
                        </h1>
                    </div>
                  <div>
                        <span className={`text-3xl text-black`}>${roundUsdAmount(currentPrice)}</span> <span className={`text-base font-semibold mt-1 mx-2 ${percentChange>0?"text-green-500":"text-red-600"}`}>{percentChange}%</span>
                  </div>
              </div>
          </div>
        }
        <Chart
            ref={chartRef}
            data={data}
            type="line"
            options = {{
                scales: {
                x: {
                        type: 'time',
                        time: {
                            unit: 'day'
                        },
                        grid: {
                          display: false
                        }
                    },
                y:{
                      grid:{
                        display:false
                      }
                }
                },
                elements:{
                    point:{
                        borderWidth: 0,
                        radius: 10,
                        backgroundColor: 'rgba(0,0,0,0)'
                    }
                },
                plugins:{
                  tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
    
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y);
                            }
                            return label;
                        }
                    }
                  }
                }
              }
            }
            width={400}
            height={400}
        />
                <div className="flex flex-row">
                      <div className="flex-1">
                        {/* space filler */}
                      </div>

                      <div className="flex-1">
                        {/* space filler */}
                      </div>

                      <div className="flex-3 content-end">

                        <ul className="flex flex-wrap text-sm font-medium text-center text-gray-500 dark:text-gray-400">
                            <li className="mr-2">
                                <div onClick={()=>setActiveLookbook("1D")} className={`inline-block py-3 px-4 rounded-lg hover:text-gray-900 hover:cursor-pointer  dark:hover:text-white ${activeLookback=="1D"?`active text-white bg-sky-600`:"hover:bg-gray-400"}`} aria-current="page">1D</div>
                            </li>
                            <li className="mr-2">
                                <div onClick={()=>setActiveLookbook("7D")} className={`inline-block py-3 px-4 rounded-lg hover:text-gray-900 hover:cursor-pointer  dark:hover:text-white ${activeLookback=="7D"?"active text-white bg-sky-600":"hover:bg-gray-400"}`}>7D</div>
                            </li>
                            <li className="mr-2">
                                <div onClick={()=>setActiveLookbook("1M")} className={`inline-block py-3 px-4 rounded-lg hover:text-gray-900 hover:cursor-pointer  dark:hover:text-white ${activeLookback=="1M"?"active text-white bg-sky-600":"hover:bg-gray-400"}`}>1M</div>
                            </li>
                            <li className="mr-2">
                                <div onClick={()=>setActiveLookbook("3M")} className={`inline-block py-3 px-4 rounded-lg hover:text-gray-900 hover:cursor-pointer  dark:hover:text-white ${activeLookback=="3M"?"active text-white bg-sky-600":"hover:bg-gray-400"}`}>3M</div>
                            </li>
                            <li>
                                <div onClick={()=>setActiveLookbook("1Y")} className={`inline-block py-3 px-4 rounded-lg hover:text-gray-900 hover:cursor-pointer  dark:hover:text-white ${activeLookback=="1Y"?"active text-white bg-sky-600":"hover:bg-gray-400"}`}>1Y</div>
                            </li>
                        </ul>

                      </div>
          </div>
          <Divider/>
          {
            loaded &&
            <div>

              <div className="text-left mt-4 mb-20 text-lg">
                <h2 className="font-semibold">About</h2>
                <p>{tokenAndNetwork.tokenData?tokenAndNetwork.tokenData.tokenDb.extensions.description:tokenAndNetwork.baseNetworkDb.about}</p>
              </div>

              <div className="border border-solid border-1 border-gray-500 py-4 rounded-lg">
                <div className="flex flex-row">
                      <div className="flex-1">
                        <div className="flex-1 content-end">
                            {/* update.... space filler for now. */}
                        </div>
                      </div>
                      <a href={tokenAndNetwork.tokenData?tokenAndNetwork.tokenData.tokenDb.extensions.link:tokenAndNetwork.baseNetworkDb.whitePaperPath} target="_blank" rel="noopener noreferrer">
                        <div className="flex-1 content-end">
                          <div className="rounded hover:bg-sky-400 hover:text-white text-black font-semibold border border-solid border-gray-400 py-1 mx-4 px-2">
                            <span>{tokenAndNetwork.tokenData?`${removeHttp(tokenAndNetwork.tokenData.tokenDb.extensions.link)}`:"Whitepaper"}</span>
                          </div>
                        </div>
                      </a>
                  </div>
              </div>

          </div>
          }
          

        </div>
        
        <div className="h-[4rem]">
          {/* padding div for space between bottom of screen and main elements */}
        </div>

    </div>
 
  )
}

export default coinInfo