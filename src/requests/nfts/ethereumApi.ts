import { IKryptikFetchResponse, KryptikFetch } from "../../kryptikFetch";
import { INFTMetadata, parseEthNFTMetaData } from "../../parsers/nftEthereum";

export const listNftsByAddress = async function(address:string, next=""):Promise<INFTMetadata[]|null>{
    try { // add support for multiple pages
        const url = `https://api.opensea.io/api/v1/assets/?owner=${address}`;
        const dataResponse = await KryptikFetch(url, {
          timeout: 10000, // 10 secs
        });
        if(!dataResponse || !dataResponse.data || !dataResponse.data.assets) return null;
        // parse api response and return
        let nftDataToReturn:INFTMetadata[] = parseEthNFTMetaData(dataResponse.data.assets);
        return nftDataToReturn;
      }
    catch(e){
      console.log("Error while fetching opensea data");
      console.warn(e);
      return null; 
    }
}