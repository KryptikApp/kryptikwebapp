// helps with integrating web3service into app. context
import { CoinGeckoClient, CoinMarketChartResponse } from 'coingecko-api-v3';

  export type PricesDict = {[id: string]: number}

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

  export const getPriceOfMultipleTickers = async function(ids:string[]):Promise<PricesDict>{
    const client = new CoinGeckoClient({
      timeout: 10000,
      autoRetry: true,
    });
    const idString:string = ids.join();
    let input = {
    vs_currencies: "usd",
    ids: idString,
    include_market_cap: false,
    include_24hr_vol: false,
    include_24hr_change: false,
    include_last_updated_at: false
    }

    let priceDict:PricesDict = {}
    const priceResponse = await client.simplePrice(input);
    for(const id of ids){
      priceDict[id] = priceResponse[id].usd;
    }
    return priceDict
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
    let prices:number[][] = marketChartResponse.prices
    priceSetFunction(prices);
    return marketChartResponse;
  }