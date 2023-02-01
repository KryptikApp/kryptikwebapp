import { KryptikFetch } from "../../kryptikFetch";
import { NetworkDb } from "../../services/models/network";
import { TokenDb } from "../../services/models/token";
import { PricesDict } from "../coinGeckoHelper";

export async function fetchNetworks(): Promise<NetworkDb[] | null> {
  // try to fetch networks from db
  try {
    const res = await KryptikFetch("/api/networks/all", {
      method: "POST",
      timeout: 8000,
      headers: { "Content-Type": "application/json" },
    });
    const networks: NetworkDb[] | null | undefined = res.data.networks;
    if (res.status != 200 || !networks) {
      console.warn("Unable to fetch networks.");
      console.log(res.data.msg);
      return null;
    }
    return networks;
  } catch (e) {
    return null;
  }
}

export async function fetchTokens(): Promise<TokenDb[] | null> {
  // try to fetch tokens from db
  try {
    const res = await KryptikFetch("/api/tokens/all", {
      method: "POST",
      timeout: 8000,
      headers: { "Content-Type": "application/json" },
    });
    const tokens: TokenDb[] | null | undefined = res.data.tokens;
    if (res.status != 200 || !tokens) {
      console.warn("Unable to fetch networks.");
      console.log(res.data.msg);
      return null;
    }
    return tokens;
  } catch (e) {
    return null;
  }
}

/**Returns the chain id associated witha a given network. Extracted from the blockchain id.*/
export function getNetworkChainId(network: NetworkDb): number {
  const chainId = network.blockchainId.split(":")[1];
  try {
    const idAsNumber: number = Number(chainId);
    return idAsNumber;
  } catch (e) {
    return network.chainId;
  }
}

export async function getAllPrices(): Promise<PricesDict | null> {
  // try to fetch tokens from db
  try {
    const res = await KryptikFetch("/api/prices/update", {
      method: "POST",
      timeout: 8000,
      headers: { "Content-Type": "application/json" },
    });
    const pricesDict: PricesDict | null | undefined = res.data.prices;
    if (res.status != 200 || !pricesDict) {
      console.warn("Unable to fetch prices.");
      console.log(res.data.msg);
      return null;
    }
    return pricesDict;
  } catch (e) {
    return null;
  }
}
