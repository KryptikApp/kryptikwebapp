// helps with integrating web3service into app. context
import { CoinGeckoClient, CoinMarketChartResponse } from 'coingecko-api-v3';


  export const getPriceOfTicker = async function(id:string):Promise<number>{
    
    const client = new CoinGeckoClient({
      timeout: 10000,
      autoRetry: true,
    });
    let input = {
    vs_currencies: "usd",
    ids: id,
    include_market_cap: false,
    include_24hr_vol: false,
    include_24hr_change: false,
    include_last_updated_at: false
    }

    const priceResponse = await client.simplePrice(input);
    return priceResponse[id].usd;
  }
  

  export const getHistoricalPriceForTicker = async function(id:string, days:number, priceSetFunction:(val:any)=>void):Promise<CoinMarketChartResponse>{
    
    const client = new CoinGeckoClient({
      timeout: 10000,
      autoRetry: true,
    });

    let input = {
    id: id,
    vs_currency: "usd",
    days: days
    }

    const marketChartResponse = await client.coinIdMarketChart(input);
    console.log(marketChartResponse);
    priceSetFunction(marketChartResponse.prices);
    return marketChartResponse;
  }