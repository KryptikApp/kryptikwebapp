import { Contributor, ContributorRole } from "../types";

//TODO: consider automatically pulling doc contributors from Github

// a list of doc contributors
export const contributorList:Contributor[] = [
    {   
        id: "jett",
        name: "Jett Hays",
        role: "Core Creator",
        avatarPath: "/blog/contributors/jett.png"
    }
]

// for now default contributor is kryptik
// only used when no contributor is provided
const defaultContributor:Contributor =  {   
    id: "kryptik",
    name: "Kryptik",
    role: "Builder",
    avatarPath: "/favicon.ico"
}


/**
 * Finds contributor by ID. Returns default contributor if no id's match.
 */
export function getContributorById(id:string):Contributor{
    const idToSearch = id.toLowerCase();
    const newContributor:Contributor = contributorList.find(c=>c.id.toLowerCase() == idToSearch) || defaultContributor;
    return newContributor;
}
