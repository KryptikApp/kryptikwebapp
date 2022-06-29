import { IKryptikFetchResponse, KryptikFetch } from "../kryptikFetch";

export const listNftsByAddress = async function(address:string, next=""):Promise<IKryptikFetchResponse|null>{
    try { //add support for multiple pages
        const url = `https://api.opensea.io/api/v1/assets/?owner=${address}`;
        const data = await KryptikFetch(url, {
          timeout: 10000, // 10 secs
        });
        console.log(data.data["assets"]);
        return data;
      }
    catch(e){
      console.log("Error while fetching near account ids:");
      console.warn(e);
      return null; 
    }
}