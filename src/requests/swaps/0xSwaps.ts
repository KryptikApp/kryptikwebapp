import { KryptikFetch } from "../../kryptikFetch";


export const fetch0xSwapOptions = async function(buyTokenticker:string, sellTokenTicker:string, sellAmount:number):Promise<null>{
    buyTokenticker = buyTokenticker.toUpperCase();
    sellTokenTicker = sellTokenTicker.toUpperCase();
    try { // add support for multiple pages
        const url = `https://api.0x.org/swap/v1/quote?buyToken=${buyTokenticker}&sellToken=${sellTokenTicker}&sellAmount=${sellAmount}`;
        const dataResponse = await KryptikFetch(url, {
          timeout: 10000, // 10 secs
        });
        if(!dataResponse || !dataResponse.data) return null;
        // parse api response and return
        console.log(dataResponse);
        return null;
      }
    catch(e){
      console.log("Error while fetching 0x swap data");
      console.warn(e);
      return null; 
    }
}