import { IKryptikFetchResponse, KryptikFetch } from "../../kryptikFetch";
import { INFTMetadata, parseNFTMetaData } from "../../parsers/nftMetaData";

export const listNftsByAddress = async function(address:string, next=""):Promise<INFTMetadata[]|null>{
    try { //add support for multiple pages
        const url = `https://api.opensea.io/api/v1/assets/?owner=${address}`;
        const dataResponse = await KryptikFetch(url, {
          timeout: 10000, // 10 secs
        });
        if(!dataResponse || !dataResponse.data || !dataResponse.data.assets) return null;
        let nftDataToReturn:INFTMetadata[] = [];
        for(const asset of dataResponse.data.assets){
            let nftData = parseNFTMetaData(asset);
            nftDataToReturn.push(nftData);
        }
        return nftDataToReturn;
      }
    catch(e){
      console.log("Error while fetching poensea data");
      console.warn(e);
      return null; 
    }
}