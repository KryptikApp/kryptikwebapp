import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import { KryptikFetch } from "../../src/kryptikFetch";
import { INFTMetadata } from "../../src/parsers/nftEthereum";
import { parseSolNFTMetaData } from "../../src/parsers/nftSolana";

type Data = {
    nftData:INFTMetadata[]|null,
}

// basic login routine
export default async( req: NextApiRequest, res: NextApiResponse<Data> )=>
{
    if (req.method !== 'POST') return res.status(405).end()
    const body = req.body;
    if(!body.address){
        console.warn("No address provided.");
    }
    let dataToReturn = await listSolanaNftsByAddress(body.address)
    res.status(200).json({ nftData:dataToReturn})
}

const listSolanaNftsByAddress = async function(address:string):Promise<INFTMetadata[]|null>{
    console.log("Fetching solana data....");
      try { //add support for multiple pages
          const url = `https://api-mainnet.magiceden.dev/v2/wallets/${address}/tokens`;
          const dataResponse = await axios.get(url)
          if(!dataResponse || !dataResponse.data) return null;
          let nftDataToReturn:INFTMetadata[] = parseSolNFTMetaData(dataResponse.data);
          return nftDataToReturn;
        }
      catch(e){
        console.log("Error while fetching Solana NFT data:");
        console.warn(e);
        return null; 
      }
  }
