import { INFTMetadata } from "../parsers/nftEthereum";
import { listNearNftsByAddress } from "../requests/nearIndexApi";
import {
  NFTResponse,
  listEthNftsByAddress,
} from "../requests/nfts/ethereumApi";
import { fetchServerPoaps, listPoapsByAddress } from "../requests/nfts/poapApi";
import { fetchServerSolNfts } from "../requests/nfts/solanaApi";
import { KryptikProvider } from "../services/models/provider";

export type FetchNftProps = {
  solAddress?: string;
  nearAddress?: string;
  ethAddress?: string;
  nearKryptikProvider?: KryptikProvider;
  maxToFetch?: number;
};

export type FetchNftResponse = {
  sol?: NFTResponse;
  near?: NFTResponse;
  eth?: NFTResponse;
  poaps?: NFTResponse;
};

/**
 * Fetches NFTs from Solana, NEAR, and Ethereum
 */
export async function fetchNFTs(props: FetchNftProps) {
  const {
    solAddress,
    nearAddress,
    ethAddress,
    nearKryptikProvider,
    maxToFetch,
  } = props;
  const MAX_TO_FETCH = maxToFetch || 10;
  let nftResponse: FetchNftResponse = {};
  Promise.all([]);
  if (solAddress) {
    let solNfts: NFTResponse | null = await fetchServerSolNfts(
      solAddress,
      maxToFetch,
      "0"
    );
    // push sol nfts to main list
    if (solNfts) {
      nftResponse.sol = solNfts;
    }
  }

  if (ethAddress) {
    // fetch poaps
    let poapsList: NFTResponse | null = await fetchServerPoaps(ethAddress);
    if (poapsList) {
      nftResponse.poaps = poapsList;
    }
    // fetch eth nfts
    let ethNfts: NFTResponse | null = await listEthNftsByAddress(
      ethAddress,
      MAX_TO_FETCH
    );

    // push eth nfts to main list
    if (ethNfts) {
      nftResponse.eth = ethNfts;
    }
  }

  if (nearKryptikProvider && nearKryptikProvider.nearProvider && nearAddress) {
    try {
      let nearNfts: NFTResponse | null = await listNearNftsByAddress(
        nearAddress,
        nearKryptikProvider.nearProvider
      );
      if (nearNfts) {
        nftResponse.near = nearNfts;
      }
    } catch (e) {
      console.error(e);
      console.warn(`Error: Unable to fetch NEAR nfts for ${nearAddress}`);
    }
  }
  return nftResponse;
}

// combine all nfts into one list
export function aggregateNfts(nftData: FetchNftResponse) {
  let res: INFTMetadata[] = [];
  // combine all nfts into one list
  if (nftData.eth) {
    res = res.concat(nftData.eth.nfts);
  }
  if (nftData.near) {
    res = res.concat(nftData.near.nfts);
  }
  if (nftData.sol) {
    res = res.concat(nftData.sol.nfts);
  }
  if (nftData.poaps) {
    res = res.concat(nftData.poaps.nfts);
  }
  return res;
}

export function totalNfts(nftData: FetchNftResponse) {
  let total = 0;
  if (nftData.eth) {
    total += nftData.eth.nfts.length;
  }
  if (nftData.near) {
    total += nftData.near.nfts.length;
  }
  if (nftData.sol) {
    total += nftData.sol.nfts.length;
  }
  if (nftData.poaps) {
    total += nftData.poaps.nfts.length;
  }
  return total;
}
