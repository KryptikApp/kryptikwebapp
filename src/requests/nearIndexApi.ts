import { NEAR_INDEXER_URL } from "../constants/nearConstants";
import { IKryptikFetchResponse, KryptikFetch } from "../kryptikFetch";

export const listNearAccountsByAddress = async function(address:string):Promise<IKryptikFetchResponse|null>{
    try {
        const url = `${NEAR_INDEXER_URL}/publicKey/${address}/accounts`;
        const data = await KryptikFetch(url, {
          timeout: 10000, // 10 secs
        });
        return data;
      }
    catch(e){
      console.log("Error while fetching near account ids:");
      console.warn(e);
      return null; 
    }
}