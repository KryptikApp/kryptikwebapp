// server wrapper for API call... to bypass browser cors issue

// A response from Covalent for the address balance API.

import { KryptikFetch } from "../../kryptikFetch";

export interface CovalentBalance{
      contract_decimals: number;
      contract_name: string;
      contract_ticker_symbol: string;
      contract_address: string;
      supports_erc: string[] | null;
      logo_url: string;
      last_transferred_at: string | null;
      type: string;
      balance: string;
      balance_24h: string;
      quote_rate: number;
      quote_rate_24h: number;
      quote: number;
      quote_24h: number;
      nft_data: any[] | null;
}
// See https://www.covalenthq.com/docs/api/#/0/Get%20historical%20portfolio%20value%20over%20time/USD/1.
export interface CovalentAddressBalanceResponseData {
    address: string;
    updated_at: string;
    next_update_at: string;
    quote_currency: string;
    items:CovalentBalance[];
}

// interface used by kryptik API to store requests
export interface BalanceReqParams{
    chainId: Number,
    accountAddress: string,
    currency:string
}

export const getAssetsFromCovalent = async (
    chainId: Number,
    accountAddress: string,
    currency:string,
    apiKey?:string
  ): Promise<CovalentAddressBalanceResponseData|null> => {
    try {
        const url = `https://api.covalenthq.com/v1/${chainId}/address/${accountAddress}/balances_v2/`;
        const covalentKey = apiKey || process.env.CovalentApiKey;
        if(!covalentKey) return null;
        const params = {
            'key': covalentKey,
            'nft': 'false',
            'quote-currency': currency,
        };
        const response = await KryptikFetch(url, {
            method: 'get',
            params,
            timeout: 10000, // 10 secs
        });
    
        if (response?.data?.data && !response?.data.error) {
            return response.data.data;
        }
    } 
    catch (e) {
      console.error(`Error: Unable to fetch Covalent balance data for network with Covalent chain id: ${chainId}.`);
    }
    return null;
};

// gets all balances from server for all possible networks (currently will fetch if network supported by covalent + kryptik)
export const fetchServerBalances = async function(chainId: Number,
    accountAddress: string,
    currency:string):Promise<CovalentAddressBalanceResponseData|null>{
    // request balance data from api
    let dataResponse = await KryptikFetch('/api/balances', {method:"POST", timeout:2000, headers:{'Content-Type': 'application/json',}, body: JSON.stringify({chainId:chainId, accountAddress:accountAddress, currency:currency})})
    if(dataResponse.status != 200) return null
    let dataJson = await dataResponse.data.balanceData;
    if(!dataJson.balanceData) return null;
    return dataJson.balanceData;
}