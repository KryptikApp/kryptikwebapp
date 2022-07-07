// poap parser adapted from rainbowme wallet
import { get } from 'lodash';
import { INFTMetadata } from './nftEthereum';

/**
 * @desc parse poaps
 * @param  {Object}
 * @return {Array}
 */

export const parsePoaps = function(data:any):INFTMetadata[]{
  const poaps = get(data, 'data', null);
  return poaps.map((poap:any) => {
    return {
      animation_url: poap.event.image_url,
      asset_contract: {
        address: '0x22c1f6050e56d2876009903609a2cc3fef83b415',
        name: 'POAPs',
        nft_version: '3.0',
        schema_name: 'ERC721',
        symbol: 'The Proof of Attendance Protocol',
        total_supply: null,
      },
      background: null,
      collection: {
        description: 'The Proof of Attendance Protocol',
        external_url: 'https://poap.xyz/',
        image_url:
          'https://lh3.googleusercontent.com/FwLriCvKAMBBFHMxcjqvxjTlmROcDIabIFKRp87NS3u_QfSLxcNThgAzOJSbphgQqnyZ_v2fNgMZQkdCYHUliJwH-Q=s60',
        name: 'POAP',
        short_description: 'The Proof of Attendance Protocol',
      },
      description:  poap.event.description,
      external_link:  poap.event.event_url,
      familyImage:
        'https://lh3.googleusercontent.com/FwLriCvKAMBBFHMxcjqvxjTlmROcDIabIFKRp87NS3u_QfSLxcNThgAzOJSbphgQqnyZ_v2fNgMZQkdCYHUliJwH-Q=s60',
      familyName: 'POAP',
      id:  poap.event.id,
      image_url:  poap.event.image_url,
      isPoap: true,
      isSendable: false,
      lastPrice: null,
      lastSalePaymentToken: null,
      name:  poap.event.name,
      permalink:  poap.event.event_url,
      traits: [
        {
          trait_type: 'country',
          value:  poap.event.country,
        },
        {
          trait_type: 'startDate',
          value:  poap.event.start_date,
        },
        {
          trait_type: 'endDate',
          value:  poap.event.start_date,
        },
        {
          trait_type: 'city',
          value:  poap.event.city,
        },
        {
          trait_type: 'eventURL',
          value:  poap.event.event_url,
        },
      ],
      uniqueId: `0x22c1f6050e56d2876009903609a2cc3fef83b415_${poap.event.id}`,
    };
  });
};