import { KryptikFetch } from "../../kryptikFetch";
import { INFTMetadata } from "../../parsers/nftEthereum";
import { parseSolNFTMetaData } from "../../parsers/nftSolana";

export const listSolanaNftsByAddress = async function (
  address: string
): Promise<INFTMetadata[] | null> {
  console.log("Fetching solana data....");
  try {
    //add support for multiple pages
    const url = `https://thingproxy.freeboard.io/fetch/https://api-mainnet.magiceden.dev/v2/wallets/${address}/tokens`;
    const dataResponse = await KryptikFetch(url, {
      headers: { "Access-Control-Allow-Origin": "*" },
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
  address: string
): Promise<INFTMetadata[] | null> {
  let dataResponse = await fetch("/api/solNfts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ address }),
  });
  if (dataResponse.status != 200) return null;
  let dataJson = await dataResponse.json();
  if (!dataJson.nftData) return null;
  return dataJson.nftData;
};
