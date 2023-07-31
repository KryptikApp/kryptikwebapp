import { KryptikFetch } from "../../kryptikFetch";
import { INFTMetadata } from "../../parsers/nftEthereum";
import { parseSolNFTMetaData } from "../../parsers/nftSolana";
import { NFTResponse } from "./ethereumApi";

export const listSolanaNftsByAddress = async function (
  address: string,
  limit: number = 100,
  pageKey?: string
): Promise<INFTMetadata[] | null> {
  console.log("Fetching solana data....");
  try {
    const offfset = pageKey ? `&offset=${Number(pageKey) * limit}` : "";
    const newLimit = `?limit=${limit}`;
    //add support for multiple pages
    const url = `https://api-mainnet.magiceden.dev/v2/wallets/${address}/tokens${newLimit}${offfset}`;
    const dataResponse = await KryptikFetch(url, {
      timeout: 10000, // 10 secs
    });
    if (!dataResponse || !dataResponse.data) return null;
    let nftDataToReturn: INFTMetadata[] = parseSolNFTMetaData(
      dataResponse.data
    );
    return nftDataToReturn;
  } catch (e) {
    console.log("Error while fetching Solana NFT data.");
    console.warn(e);
    return null;
  }
};

// server wrapper for API call... to bypass browser cors issue

export const fetchServerSolNfts = async function (
  address: string,
  limit: number = 100,
  pageKey?: string
): Promise<NFTResponse | null> {
  let dataResponse = await fetch("/api/solNfts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ address, limit, pageKey }),
  });
  if (dataResponse.status != 200) return null;
  let dataJson = await dataResponse.json();
  if (!dataJson.nftData) return null;
  let res: NFTResponse = {
    nfts: dataJson.nftData as INFTMetadata[],
    pageKey: null,
  };
  if (pageKey) {
    res.pageKey = (Number(pageKey) + 1).toString();
  }
  return res;
};
