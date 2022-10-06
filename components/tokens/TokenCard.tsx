import { Token } from "graphql";
import { NextPage } from "next";
import { TokenDb } from "../../src/services/models/token";

interface Props {
    token:TokenDb
}
const TokenCard:NextPage<Props> = (props) => {
    const {token} = {...props};
    return(
        <div className="border border-gray-100 dark:border-gray-800 rounded-lg px-2 py-4">
            <div className="flex flex-row space-x-2">
                <img className="w-8 h-8 rounded-full my-auto" src={token.logoURI} alt={`${token.name} image`}/>
                <h1 className="text-xl text-gray-900 dark:text-gray-100">{token.name}</h1>
            </div>
        </div>
    )   
}

export default TokenCard;