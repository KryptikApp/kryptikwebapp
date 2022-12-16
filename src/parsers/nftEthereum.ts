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

export interface ITraitType {
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
  animation_original_url?: string;
  animation_url?: string;
  asset_contract: INFTAssetContract;
  background_color?: string;
  collection: INFTCollectionData;
  decimals?: null;
  description?: string;
  external_link?: string;
  metaExtensions?: MetaDataExtension;
  id?: number;
  image_original_url?: string;
  image_preview_url?: string;
  image_thumbnail_url?: string;
  image_url: string;
  is_nsfw?: boolean;
  is_presale?: boolean;
  isPoap: boolean;
  last_sale?: string;
  listing_date?: string;
  name?: string;
  networkTicker: string;
  num_sales?: number;
  permalink?: string;
  sell_orders?: string;
  token_id?: string;
  token_metadata?: string;
  top_bid?: number;
  traits?: ITraitType[];
  transfer_fee?: number;
  transfer_fee_payment_token?: string;
}

export const parseEthNFTMetaData = function (assetData: any[]): INFTMetadata[] {
  let nftDataToReturn: INFTMetadata[] = [];
  for (const asset of assetData) {
    let nftData = { ...asset };
    nftData.networkTicker = "eth";
    nftDataToReturn.push(nftData);
  }
  return nftDataToReturn;
};
