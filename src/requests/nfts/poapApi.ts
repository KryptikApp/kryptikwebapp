import { env } from "process";
import { KryptikFetch } from "../../kryptikFetch";
import { INFTMetadata } from "../../parsers/nftEthereum";
import { parsePoaps } from "../../parsers/poap";
import { NFTResponse } from "./ethereumApi";

/** Fetches poaps from poap api. Requires env, so we should only call this method on the server. */
export const listPoapsByAddress = async function (
  address: string
): Promise<NFTResponse | null> {
  try {
    // TODO: add api key
    const url = `https://api.poap.tech/actions/scan/${address}`;
    const data = await KryptikFetch(url, {
      headers: {
        "x-api-key": env.POAP_API_KEY || "",
      },
      timeout: 10000, // 10 secs
    });
    // parse and return poap data
    return { nfts: parsePoaps(data), pageKey: null };
  } catch (error) {
    console.log("Error getting POAPs", error);
    return null;
  }
};

// server wrapper for API call... to bypass browser cors issue
export const fetchServerPoaps = async function (
  address: string
): Promise<NFTResponse | null> {
  let dataResponse = await fetch("/api/poaps", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ address }),
  });
  if (dataResponse.status != 200) return null;
  let dataJson = (await dataResponse.json()).nftData;
  if (!dataJson) return null;
  return {
    nfts: dataJson.nfts as INFTMetadata[],
    pageKey: dataJson.pageKey,
  };
};
