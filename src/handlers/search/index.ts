import { NetworkDb } from "../../services/models/network";
import { TokenDb } from "../../services/models/token";
import Web3Service from "../../services/Web3Service";
import { getAccountSearchSuggestions } from "./accounts";
import { getTokenSearchSuggestions } from "./token";
import { ISearchResult } from "./types";

// aggregates blockchain search methods
export const getAllNetworkSearchSuggestions = async function (
  query: string,
  networkDb: NetworkDb,
  tickerToNetworkDict: { [ticker: string]: NetworkDb },
  networkToSearch: NetworkDb[],
  tokensToSearch: TokenDb[]
): Promise<ISearchResult[]> {
  let suggestions: ISearchResult[] = [];
  let tokenResults = getTokenSearchSuggestions(
    query,
    networkToSearch,
    networkToSearch,
    tokensToSearch
  );
  let accountResults = await getAccountSearchSuggestions(query, networkDb);
  suggestions.push(...tokenResults);
  suggestions.push(...accountResults);
  return suggestions;
};
