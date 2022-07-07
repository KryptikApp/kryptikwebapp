

import { KryptikFetch } from "../../kryptikFetch";
import { INFTMetadata } from "../../parsers/nftEthereum";
import { parseSolNFTMetaData } from "../../parsers/nftSolana";

export const listSolanaNftsByAddress = async function(address:string, next=""):Promise<INFTMetadata[]|null>{
  console.log("Fetching solana data....");
    try { //add support for multiple pages
        const url = `https://cors-anywhere.herokuapp.com/https://api-mainnet.magiceden.dev/v2/wallets/${address}/tokens`;
        const dataResponse = await KryptikFetch(url, {
          headers: {"Access-Control-Allow-Origin": "*"},
          timeout: 10000, // 10 secs
        });
        if(!dataResponse || !dataResponse.data) return null;
        let nftDataToReturn:INFTMetadata[] = parseSolNFTMetaData(dataResponse.data);
        return nftDataToReturn;
      }
    catch(e){
      console.log("Error while fetching Solana NFT data.");
      console.warn(e);
      return null; 
    }
}