import { KryptikFetch } from "../../kryptikFetch";
import { INFTMetadata } from "../../parsers/nftEthereum";
import { parsePoaps } from "../../parsers/poap";


export const listPoapsByAddress = async function(address: string):Promise<INFTMetadata[]|null>{
    try {
      const url = `https://api.poap.xyz/actions/scan/${address}`;
      const data = await KryptikFetch(url, {
        timeout: 10000, // 10 secs
      });
      // parse and return poap data
      return parsePoaps(data);
    }
    catch (error) {
      console.log('Error getting POAPs', error);
      return null;
    }
  };