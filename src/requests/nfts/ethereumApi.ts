import { IKryptikFetchResponse, KryptikFetch } from "../../kryptikFetch";
import { INFTMetadata, parseEthNFTMetaData } from "../../parsers/nftEthereum";

/**
 * Fetches nfts for a given address from the ethereum blockchain
 * @param address Owner address to fetch nfts for
 * @param limit Max number of nfts to fetch
 * @param pageKey Optional page key to fetch next page of nfts
 * @returns Formatted array of nft metadata
 */
export const listNftsByAddress = async function (
  address: string,
  limit: number = 100,
  pageKey?: string
): Promise<INFTMetadata[] | null> {
  try {
    const apiKey: string = process.env.NEXT_PUBLIC_ALCHEMY_ETH_KEY || "";
    // add support for multiple pages
    let url = `https://eth-mainnet.g.alchemy.com/nft/v3/${apiKey}/getNFTsForOwner?owner=${address}&excludeFilters[]=SPAM&excludeFilters[]=AIRDROPS&withMetadata=false&pageSize=${limit}`;
    if (pageKey) {
      url += `&pageKey=${pageKey}`;
    }
    const dataResponse = await KryptikFetch(url, {
      timeout: 10000, // 10 secs
    });
    if (!dataResponse || !dataResponse.data || !dataResponse.data.ownedNfts)
      return null;
    const metaUrl = `https://eth-mainnet.g.alchemy.com/nft/v3/${apiKey}/getNFTMetadataBatch`;
    const metaResponse = await KryptikFetch(metaUrl, {
      method: "POST",
      body: JSON.stringify({
        tokens: dataResponse.data.ownedNfts,
      }),
      timeout: 10000, // 10 secs
    });

    // parse api response and return
    let nftDataToReturn: INFTMetadata[] = parseEthNFTMetaData(
      metaResponse.data.nfts
    );
    console.log("Parsed nft data");
    return nftDataToReturn;
  } catch (e) {
    console.log("Error while fetching opensea data");
    console.warn(e);
    return null;
  }
};
