import { NetworkDb } from "../services/models/network";

// parses metadata returned by the opensea api
export interface INFTAssetContract {
  address: string;
  asset_contract_type?: string;
  buyer_fee_basis_points?: number;
  created_date?: string;
  default_to_fiat?: false;
  description?: string;
  dev_buyer_fee_basis_points?: number;
  dev_seller_fee_basis_points?: number;
  external_link?: string;
  image_url?: string;
  name?: string;
  nft_version?: any;
  only_proxied_transfers?: false;
  owner?: number;
  payout_address?: string;
  schema_name?: string;
  seller_fee_basis_points?: number;
  symbol?: string;
  total_supply?: number;
}

export interface INFTCollectionData {
  banner_image_url?: string;
  chat_url?: string;
  created_date?: string;
  default_to_fiat?: false;
  description?: string;
  dev_buyer_fee_basis_points?: string;
  dev_seller_fee_basis_points?: string;
  discord_url?: string;
  external_url?: string;
  featured?: false;
  featured_image_url?: string;
  hidden?: false;
  image_url?: string;
  instagram_username?: string;
  is_nsfw?: false;
  is_subject_to_whitelist?: false;
  large_image_url?: string;
  medium_username?: string;
  name: string;
  only_proxied_transfers?: false;
  payout_address?: string;
  short_description?: string;
  slug?: string;
  telegram_url?: string;
  twitter_username?: string;
  wiki_url?: string;
}

export interface ITrait {
  display_type?: string;
  max_value?: string;
  order?: any;
  trait_count?: number;
  trait_type: string;
  value: any;
}

export interface MetaDataExtension {
  metadataUrl?: string;
}

export interface INFTMetadata {
  isSpam: boolean;
  image_url: string;
  name: string;
  asset_contract: INFTAssetContract;
  collection: INFTCollectionData;
  traits: ITrait[];
  networkTicker: string;
  isPoap: boolean;
  description?: string;
  token_id?: string;
  metaExtensions?: MetaDataExtension;
  external_link?: string;
}

// pase metadata returned by the alchemy api as described here https://docs.alchemy.com/reference/nft-api-quickstart
export function parseEthNFTMetaData(assetData: any[]): INFTMetadata[] {
  let nftDataToReturn: INFTMetadata[] = [];
  for (const asset of assetData) {
    try {
      let newNftData: INFTMetadata = {
        isSpam: false,
        image_url: asset.image?.cachedUrl,
        name: asset.name,
        asset_contract: {
          address: asset.contract.address,
        },
        collection: {
          name: asset.contract.name,
          image_url: asset.contract.openSeaMetadata?.imageUrl,
          description: asset.contract.openSeaMetadata?.description,
        },
        networkTicker: "eth",
        isPoap: false,
        description: asset.description,
        token_id: asset.tokenId,
        traits: asset.raw.metadata.attributes,
        external_link: asset.raw?.metadata?.external_url,
      };
      // add to result
      nftDataToReturn.push(newNftData);
    } catch (e) {
      console.log("Error while parsing nft data");
      console.warn(e);
      // pass for now
    }
  }
  return nftDataToReturn;
}
