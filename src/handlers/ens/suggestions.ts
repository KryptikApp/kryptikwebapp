import { isEmpty } from "lodash";
import { IResolvedAccount } from "../../helpers/resolvers/accountResolver";
import { ensClient } from "../../theGraph/client";
import { ENS_SUGGESTIONS } from "../../theGraph/queries";


export const fetchEnsSuggestions = async (query: string):Promise<IResolvedAccount[]> => {
    // only fetching suggestions for character range 
    if(query.length<3 || query.length>20) return []; 
    let resolvedSuggestions:IResolvedAccount[] = []
    query = query.toLowerCase();
    let result = await ensClient.query({
      query: ENS_SUGGESTIONS,
      variables: {
        amount: 8,
        name: query,
      },
    });
    if(!result.data || !result.data.domains) return [];
    for(const domain of result.data.domains){
        let resolvedAccount:IResolvedAccount = {
            names: [domain.name],
            address: domain.owner.id,
            isResolved: true
        }
        resolvedSuggestions.push(resolvedAccount);
    }
    return resolvedSuggestions;
  }