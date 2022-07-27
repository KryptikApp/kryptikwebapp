import { KryptikFetch } from "../../kryptikFetch";
import { IEVMSwapData, parse0xdata } from "../../parsers/0xData";


export const fetch0xSwapOptions = async function(buyTokenId:string, sellTokenId:string, sellAmount:number, takerAddress?:string):Promise<null|IEVMSwapData>{
    try { // add support for multiple pages
        let url:string;
        if(takerAddress){
          url = `https://api.0x.org/swap/v1/quote?buyToken=${buyTokenId}&sellToken=${sellTokenId}&sellAmount=${sellAmount}&takerAddress=${takerAddress}`;
        }
        else{
          url = `https://api.0x.org/swap/v1/quote?buyToken=${buyTokenId}&sellToken=${sellTokenId}&sellAmount=${sellAmount}`;
        }
        const dataResponse = await KryptikFetch(url, {
          timeout: 10000, // 10 secs
        });
        if(!dataResponse || !dataResponse.data) return null;
        // parse api response and return
        const evmSwapData:IEVMSwapData = parse0xdata(dataResponse.data);
        return evmSwapData;
      }
    catch(e){
      console.log("Error while fetching 0x swap data");
      console.warn(e);
      return null; 
    }
}