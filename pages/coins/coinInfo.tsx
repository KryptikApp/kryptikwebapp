import type { NextPage } from 'next'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useKryptikAuthContext } from '../../components/KryptikAuthProvider'
import { getHistoricalPriceForTicker } from "../../src/helpers/coinGeckoHelper";
import React from 'react';
import {Line} from 'react-chartjs-2';
import {Chart as ChartJS, CategoryScale} from 'chart.js/auto'



const coinInfo: NextPage = () => {
  const { authUser, loading } = useKryptikAuthContext();
  const router = useRouter();
  console.log(router.query["network"]);
  let network:string = "";
  if (typeof(router.query["network"]) == "string") {
     network = router.query["network"];
  }
  

  //console.log(getHistoricalPriceForTicker(network, 30));
  // ROUTE PROTECTOR: Listen for changes on loading and authUser, redirect if needed
  useEffect(() => {
    if (!loading && !authUser)
      router.push('/')
  }, [authUser, loading])

  
  const labels = [0, 1, 2, 3, 4, 5, 6];
  const data = {
  labels: labels,
  datasets: [{
    label: 'My First Dataset',
    data: [65, 59, 80, 81, 56, 55, 40],
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