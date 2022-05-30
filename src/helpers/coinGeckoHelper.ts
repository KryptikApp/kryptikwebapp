// helps with integrating web3service into app. context
import { CoinGeckoClient, SimplePriceResponse } from 'coingecko-api-v3';


  export const getPriceOfTicker = async function(ticker:string):Promise<number>{
    
    const client = new CoinGeckoClient({
      timeout: 10000,
      autoRetry: true,
    });
    let input = {
    vs_currencies: "usd",
    ids: ticker,
    include_market_cap: false,
    include_24hr_vol: false,
    include_24hr_change: false,
    include_last_updated_at: false
    }

    const priceResponse = await client.simplePrice(input);
    return priceResponse[ticker].usd;
  }
  