import { Account, Near } from "near-api-js";
import { NEAR_INDEXER_URL } from "../constants/nearConstants";
import { IKryptikFetchResponse, KryptikFetch } from "../kryptikFetch";
import { INFTMetadata } from "../parsers/nftEthereum";
import {
  buildMediaUrl,
  INearCollectionData,
  NearParseData,
  parseNearNFTMetaData,
} from "../parsers/nftNear";
import { NFTResponse } from "./nfts/ethereumApi";

export const listNearAccountsByAddress = async function (
  address: string
): Promise<IKryptikFetchResponse | null> {
  try {
    const url = `${NEAR_INDEXER_URL}/publicKey/${address}/accounts`;
    const data = await KryptikFetch(url, {
      timeout: 10000, // 10 secs
    });
    return data;
  } catch (e) {
    console.log("Error while fetching near account ids:");
    console.warn(e);
    return null;
  }
};

export const listNearLikelyNfts = async function (
  address: string
): Promise<IKryptikFetchResponse | null> {
  try {
    const url = `${NEAR_INDEXER_URL}/account/${address}/likelyNFTs`;
    const data = await KryptikFetch(url, {
      timeout: 7000, // 7 secs
    });
    return data;
  } catch (e) {
    console.log("Error while fetching likely NEAR nfts:");
    console.warn(e);
    return null;
  }
};

export const getTokenMetaData = async function (refUrl: string) {
  try {
    const dataResponse = await KryptikFetch(refUrl, {
      timeout: 2000, // 2 secs
    });
    return dataResponse.data;
  } catch (e) {
    console.log("Error while fetching near token metadata:");
    console.warn(e);
    return null;
  }
};

export const listNearNftsByAddress = async function (
  address: string,
  nearProvider: Near
): Promise<NFTResponse | null> {
  // first.. we get likelty nfts for address
  let likelyNfts = await listNearLikelyNfts(address);
  if (!likelyNfts) return null;
  let nearAccount = await nearProvider.account(address);
  let dataToParse: NearParseData[] = [];
  // iterate through likely nfts and get data
  for (const contractName of likelyNfts.data) {
    const collectionData: INearCollectionData = await getCollectionMetaData(
      contractName,
      nearAccount
    );
    const tokens = await getTokens(contractName, address, nearAccount);
    for (const token of tokens) {
      let tokenDataToAdd: NearParseData = {
        token: token,
        contractName: contractName,
        tokenId: token.token_id,
        collectionData: collectionData,
      };
      let metaDataPath = buildMediaUrl(
        token.metadata.reference,
        collectionData.base_uri
      );
      // TODO: FIX LOAD SPEED HANDLER FOR IPFS METADATA AND REQUEST CORS
      // let tokenMetaData = await getTokenMetaData(metaDataPath);
      tokenDataToAdd.metaDataUrl = metaDataPath;
      dataToParse.push(tokenDataToAdd);
    }
  }
  let parsedNfts = parseNearNFTMetaData(dataToParse);
  return { nfts: parsedNfts, pageKey: null };
};

export const getTokens = async function (
  contractName: string,
  accountId: string,
  nearAccount: Account
) {
  let nearTokens = await nearAccount.viewFunction(
    contractName,
    "nft_tokens_for_owner",
    { account_id: accountId }
  );
  return nearTokens;
};

export const getCollectionMetaData = async function (
  contractName: string,
  nearAccount: Account
) {
  let metaData: INearCollectionData = await nearAccount.viewFunction(
    contractName,
    "nft_metadata"
  );
  return metaData;
};
