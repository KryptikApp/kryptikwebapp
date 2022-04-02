import { KryptikFetch } from "../../kryptikFetch";
import { parsePoaps } from '../parsers/poap';


export const fetchPoaps = async (address: string) => {
  try {
    const url = `https://api.poap.xyz/actions/scan/${address}`;
    const data = await KryptikFetch(url, {
      timeout: 10000, // 10 secs
    });
    return parsePoaps(data);
  } catch (error) {
    console.log('Error getting POAPs', error);
  }
};