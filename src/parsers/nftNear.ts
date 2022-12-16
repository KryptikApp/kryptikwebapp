import { KryptikFetch } from "../kryptikFetch";
import {
  INFTAssetContract,
  INFTCollectionData,
  INFTMetadata,
  MetaDataExtension,
} from "./nftEthereum";

export interface NearParseData {
  token: any;
  tokenMetaData?: any;
  metaDataUrl?: string;
  tokenId: string;
  contractName: string;
  collectionData: INearCollectionData;
}

export interface INearCollectionData {
  base_uri: string;
  icon: string;
  name: string;
  reference: string;
  reference_hash: string;
  spec: string;
  symbol: string;
}

export const parseNearNFTMetaData = function (
  assetData: NearParseData[]
): INFTMetadata[] {
  let nftDataToReturn: INFTMetadata[] = [];
  for (const asset of assetData) {
    let imagePath = buildMediaUrl(
      asset.token.metadata.media,
      asset.collectionData.base_uri
    );
    let collection: INFTCollectionData = {
      name: asset.collectionData.name,
    };
    let assetContract: INFTAssetContract = {
      address: asset.contractName,
    };

    let nftData: INFTMetadata = {
      image_url: imagePath,
      name: asset.token.metadata.title,
      description: asset.token.metadata.description,
      isPoap: false,
      networkTicker: "near",
      token_id: asset.tokenId,
      collection: collection,
      asset_contract: assetContract,
    };
    if (asset.metaDataUrl) {
      let metaExtensions: MetaDataExtension = {
        metadataUrl: asset.metaDataUrl,
      };
      nftData.metaExtensions = metaExtensions;
    }
    nftDataToReturn.push(nftData);
  }
  return nftDataToReturn;
};

export const buildMediaUrl = (media: string, base_uri?: string) => {
  // return the provided media string if it is empty or already in a URI format
  if (!media || media.includes("://") || media.startsWith("data:image")) {
    return media;
  }

  if (base_uri) {
    return `${base_uri}/${media}`;
  }

  // return w/ default ipfs gateway if none provided
  return `https://cloudflare-ipfs.com/ipfs/${media}`;
};
