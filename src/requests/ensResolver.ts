import { IResolvedAccount } from "../helpers/resolvers/accountResolver";
import { KryptikFetch } from "../kryptikFetch";

export const fetchResolvedENSName = async function(account:string, next=""):Promise<IResolvedAccount|null>{
    try { // add support for multiple pages
        const url = `https://api.ensideas.com/ens/resolve/${account}`;
        const dataResponse = await KryptikFetch(url, {
          timeout: 10000, // 10 secs
        });
        if(!dataResponse || !dataResponse.data) return null;
        // parse api response and return
        console.log(dataResponse);
        return null;
      }
    catch(e){
      console.log("Error while fetching opensea data");
      console.warn(e);
      return null; 
    }
}