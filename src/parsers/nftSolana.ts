import {
  INFTAssetContract,
  INFTCollectionData,
  INFTMetadata,
  ITrait,
} from "./nftEthereum";

export const parseSolNFTMetaData = function (assetData: any[]): INFTMetadata[] {
  let nftDataToReturn: INFTMetadata[] = [];
  for (const asset of assetData) {
    let collection: INFTCollectionData = {
      name: asset.collectionName,
    };
    let assetContract: INFTAssetContract = {
      seller_fee_basis_points: asset.seller_fee_basis_points
        ? asset.seller_fee_basis_points
        : 0,
      address: asset.mintAddress,
    };
    let traits: ITrait[] = [];
    for (const attribute of asset.attributes) {
      let trait: ITrait = {
        trait_type: attribute.trait_type,
        value: attribute.value,
      };
      traits.push(trait);
    }
    // TODO: CHECK IF SPAM
    let nftData: INFTMetadata = {
      isSpam: false,
      image_url: asset.image,
      name: asset.name,
      asset_contract: assetContract,
      collection: collection,
      traits: traits,
      networkTicker: "sol",
      isPoap: false,
    };
    nftDataToReturn.push(nftData);
  }
  return nftDataToReturn;
};
