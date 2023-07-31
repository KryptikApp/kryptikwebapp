// poap parser adapted from rainbowme wallet
import { get } from "lodash";
import { INFTMetadata, ITrait } from "./nftEthereum";

/**
 * @desc parse poaps
 * @param  {Object}
 * @return {Array}
 */

export const parsePoaps = function (data: any): INFTMetadata[] {
  const poaps = get(data, "data", null);
  let poapsToReturn: INFTMetadata[] = [];
  for (const poap of poaps) {
    // TODO: CHECK IF SPAM
    let poapToAdd: INFTMetadata = {
      isSpam: false,
      asset_contract: {
        address: "0x22c1f6050e56d2876009903609a2cc3fef83b415",
        name: "POAPs",
        nft_version: "3.0",
        schema_name: "ERC721",
        symbol: "The Proof of Attendance Protocol",
      },
      collection: {
        description: "The Proof of Attendance Protocol",
        external_url: "https://poap.xyz/",
        image_url:
          "https://lh3.googleusercontent.com/FwLriCvKAMBBFHMxcjqvxjTlmROcDIabIFKRp87NS3u_QfSLxcNThgAzOJSbphgQqnyZ_v2fNgMZQkdCYHUliJwH-Q=s60",
        name: "POAP",
        short_description: "The Proof of Attendance Protocol",
      },
      description: poap.event.description,
      external_link: poap.event.event_url,
      token_id: poap.event.id,
      // request the small image
      image_url: poap.event.image_url + "?size=small",
      isPoap: true,
      name: poap.event.name,
      networkTicker: "poap",
      traits: [],
    };
    let traitsToAdd: ITrait[] = [];
    if (poap.event.city) {
      traitsToAdd.push({ trait_type: "city", value: poap.event.city });
    }
    if (poap.event.country) {
      traitsToAdd.push({ trait_type: "country", value: poap.event.country });
    }
    if (poap.event.start_date) {
      traitsToAdd.push({
        trait_type: "startDate",
        value: poap.event.start_date,
      });
    }
    if (poap.event.end_date) {
      traitsToAdd.push({ trait_type: "endDate", value: poap.event.end_date });
    }
    if (poap.event.event_url) {
      traitsToAdd.push({ trait_type: "eventUrl", value: poap.event.event_url });
    }
    poapToAdd.traits = traitsToAdd;
    poapsToReturn.push(poapToAdd);
  }

  return poapsToReturn;
};
