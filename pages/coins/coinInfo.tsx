import type { NextPage } from 'next'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useKryptikAuthContext } from '../../components/KryptikAuthProvider'
import { getHistoricalPriceForTicker } from "../../src/helpers/coinGeckoHelper";
import React from 'react';
import {Line} from 'react-chartjs-2';
import {Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ScaleChartOptions} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement);


const coinInfo: NextPage = () => {
  const { authUser, loading } = useKryptikAuthContext();
  const [historicalData, setHistoricalData] = useState([]);
  let defaultArray:string[] = [];
  const [prices, setPrices] = useState(defaultArray);
  const [times, setTimes] = useState(defaultArray);

  const router = useRouter();
  console.log(router.query["network"]);
  let network:string = "";
  if (typeof(router.query["network"]) == "string") {
     network = router.query["network"];
  }
  
  useEffect(() => {
    getHistoricalPriceForTicker(network, 30, setHistoricalData);
  }, [])

  useEffect(() => {
    let new_times:string[] = [];
    let new_prices:string[] = [];
    for (let i = 0; i < historicalData.length; i++) {
      new_times.push(historicalData[i][0]);
      new_prices.push(historicalData[i][1]);
    }
    setTimes(new_times);
    setPrices(new_prices);
    console.log(times);
    console.log(prices);
  }, [historicalData])
  
  // ROUTE PROTECTOR: Listen for changes on loading and authUser, redirect if needed
  useEffect(() => {
    if (!loading && !authUser)
      router.push('/')
  }, [authUser, loading])

  
  const data = {
  labels: times,
  datasets: [{
    label: 'My First Dataset',
    data: prices,
    fill: false,
    borderColor: 'rgb(75, 192, 192)',
    tension: 0.1
  }]
};    


  return (
    <div>
      
        <div className="text-center max-w-2xl mx-auto content-center">
        <Line
            data={data}
            width={400}
            height={400}
        />
        </div>

    </div>
 
  )
}

export default coinInfo