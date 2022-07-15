import { Account, Near } from "near-api-js";
import { NEAR_INDEXER_URL } from "../constants/nearConstants";
import { IKryptikFetchResponse, KryptikFetch } from "../kryptikFetch";
import { INFTMetadata } from "../parsers/nftEthereum";
import { buildMediaUrl, INearCollectionData, NearParseData, parseNearNFTMetaData } from "../parsers/nftNear";

export const listNearAccountsByAddress = async function(address:string):Promise<IKryptikFetchResponse|null>{
    try {
        const url = `${NEAR_INDEXER_URL}/publicKey/${address}/accounts`;
        const data = await KryptikFetch(url, {
          timeout: 10000, // 10 secs
        });
        return data;
      }
    catch(e){
      console.log("Error while fetching near account ids:");
      console.warn(e);
      return null; 
    }
}

export const listNearLikelyNfts = async function(address:string):Promise<IKryptikFetchResponse|null>{
  try {
    const url = `${NEAR_INDEXER_URL}/account/${address}/likelyNFTs`;
    const data = await KryptikFetch(url, {
      timeout: 10000, // 10 secs
    });
    return data;
  }
  catch(e){
    console.log("Error while fetching near likely nfts:");
    console.warn(e);
    return null; 
  }
}

export const getTokenMetaData = async function(refUrl:string){
  try {
      const dataResponse = await KryptikFetch(refUrl, {
        timeout: 3000, // 3 secs
      });
      return dataResponse.data;
    }
  catch(e){
    console.log("Error while fetching near token metadata:");
    console.warn(e);
    return null; 
  }
}

export const listNearNftsByAddress = async function(address:string, nearProvider:Near):Promise<INFTMetadata[]|null>{
  // first.. we get likelty nfts for address 
  let likelyNfts = await listNearLikelyNfts(address);
  if(!likelyNfts) return null;
  let nearAccount = await nearProvider.account(address);
  let dataToParse:NearParseData[] = [];
  // iterate through likely nfts and get data
  for(const contractName of likelyNfts.data){
    const collectionData:INearCollectionData = await getCollectionMetaData(contractName, nearAccount);
    const tokens = await getTokens(contractName, address, nearAccount);
    for(const token of tokens){
      let tokenDataToAdd:NearParseData = {
        token: token,
        contractName: contractName,
        tokenId: token.token_id,
        collectionData: collectionData
      }
      // TODO: FIX LOAD SPEED FOR IPFS METADATA
      // let metaDataPath = buildMediaUrl(token.metadata.reference, collectionData.base_uri);
      // console.log("getting near metadata");
      // console.log(metaDataPath);
      // let tokenMetaData = await getTokenMetaData(metaDataPath);
      // console.log(tokenMetaData);
      // if(tokenMetaData){
      //   tokenDataToAdd.tokenMetaData = tokenMetaData;
      // }
      dataToParse.push(tokenDataToAdd);
    }
  }
  let parsedNfts = parseNearNFTMetaData(dataToParse);
  return parsedNfts;
}

export const getTokens = async function(contractName:string, accountId:string, nearAccount:Account){
  let nearTokens = await nearAccount.viewFunction(contractName, 'nft_tokens_for_owner', { account_id: accountId});
  return nearTokens;
}

export const getCollectionMetaData = async function(contractName:string, nearAccount:Account){
  let metaData:INearCollectionData = await nearAccount.viewFunction(contractName, "nft_metadata");
  return metaData;
}