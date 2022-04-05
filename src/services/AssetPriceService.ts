import firestore from './firebaseDB';
import { collection, getDocs, query, where } from "firebase/firestore";
import axios from 'axios';
import moment from 'moment';

import { ServiceState } from './types';
import BaseService from './BaseService';
import { Network } from '../models/network';
const citiesRef = collection(firestore, "networks");


//TODO: add types to incoming api data and format
class AssetPriceService extends BaseService{
    public marketData;
   
    constructor() {
        super();
    }

    async InternalStartService(){
        this.marketData = await this.fetchMarketData();
        console.log("internal start service asset prices");
        return this;
    }

    formatSparkline = (numbers) => {
        const sevenDaysAgo = moment().subtract(7, 'days').unix();
        let formattedSparkline = numbers.map((item, index) => {
          return {
            timestamp: sevenDaysAgo + (index + 1) * 3600,
            value: item,
          }
        })
      
        return formattedSparkline;
      }
      
    formatMarketData = (data) => {
        let formattedData:any[] = [];
        data.forEach(item => {
          const formattedSparkline = this.formatSparkline(item.sparkline_in_7d.price)
      
          const formattedItem = {
            ...item,
            sparkline_in_7d: {
              price: formattedSparkline
            }
          }
      
          formattedData.push(formattedItem);
        });
      
        return formattedData;
      }
      
      private fetchMarketData = async () => {
        try {
          const response = await axios.get("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=true&price_change_percentage=7d");
          const data = response.data;
          const formattedResponse = this.formatMarketData(data);
          return formattedResponse;
        } catch (error) {
          throw("Error: unable to retrieve market data");
        }
      }

    // retrives market data for specified asset
    getAssetData(network:Network){
        if(this.serviceState != ServiceState.started) throw("Asset price Service is not running. Price data has not been populated.");
        return this.marketData.find(c => c.name.toLowerCase() == network.fullName.toLowerCase());
    }

    getAllMarketData(){
        if(this.serviceState != ServiceState.started) throw("Service is not running. Network data has not been populated.")
        return this.marketData[0];
    }

   
  }



export default AssetPriceService;