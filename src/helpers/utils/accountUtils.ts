import { PublicKey } from "@solana/web3.js";

import {
  isValidEVMAddress,
  Network,
  NetworkFamily,
  NetworkFamilyFromFamilyName,
} from "hdseedloop";
import { IWallet } from "../../models/KryptikWallet";
import { ActiveAddresses } from "../../services/models/KryptikBalanceHolder";
import { NetworkDb } from "../../services/models/network";
import { networkFromNetworkDb } from "./networkUtils";

// generate a public key from a given address, using the sol web3 library
export const createEd25519PubKey = function (address: string): PublicKey {
  let pubKey: PublicKey | null = new PublicKey(address);
  if (!pubKey) {
    throw new Error(
      "Error: Unable to generate public key. Please make sure input address is correct"
    );
  }
  return pubKey;
};

export const createSolTokenAccount = async function (
  accountAddress: string,
  tokenAddress: string
): Promise<PublicKey> {
  // smart contract ids defined by solana
  const TOKEN_PROGRAM_ID = new PublicKey(
    "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
  );
  const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey(
    "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
  );
  // user address
  const owner = new PublicKey(accountAddress);
  // token address
  const mint = new PublicKey(tokenAddress);
  const [pubKey] = await PublicKey.findProgramAddress(
    [owner.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    ASSOCIATED_TOKEN_PROGRAM_ID
  );
  return pubKey;
};

export const isValidAddress = function (
  address: NamedCurve,
  networkDB: NetworkDb
) {
  let network = networkFromNetworkDb(networkDB);
  switch (network.networkFamily) {
    case NetworkFamily.EVM: {
      return isValidEVMAddress(address);
    }
    // for now just return true
    default: {
      return true;
    }
  }
};

// returns blockchain address for a given networkdb
export const getAddressForNetworkDb = (
  wallet: IWallet,
  networkDb: NetworkDb
): string => {
  let network = networkFromNetworkDb(networkDb);
  let addy = getAddressForNetwork(wallet, network);
  return addy;
};

export const getAddressForNetwork = (
  wallet: IWallet,
  network: Network
): string => {
  // gets all addresses for network
  let allAddys: string[] = wallet.seedLoop.getAddresses(network);
  // gets first address for network
  let firstAddy: string = allAddys[0];
  return firstAddy;
};

/** Returns address corresponding to network db. */
export function getActiveNetworkAddress(
  addresses: ActiveAddresses,
  network: NetworkDb
): string {
  const networkFamily: NetworkFamily = NetworkFamilyFromFamilyName(
    network.networkFamilyName
  );
  switch (networkFamily) {
    case NetworkFamily.Algorand: {
      return addresses.algo;
    }
    case NetworkFamily.EVM: {
      return addresses.eth;
    }
    case NetworkFamily.Near: {
      return addresses.near;
    }
    case NetworkFamily.Solana: {
      return addresses.sol;
    }
    default: {
      throw new Error(`Active address not available for ${network.fullName}`);
    }
  }
}

export function trimUid(uid: string): string {
  // keep first four and last three characters
  let firstFour = uid.slice(0, 4);
  let lastThree = uid.slice(-3);
  return `${firstFour}...${lastThree}`;
}
