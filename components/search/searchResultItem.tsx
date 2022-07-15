import { NextPage } from "next";
import { ISearchResult } from "../../src/handlers/search/types";

interface Props{
    searchResult:ISearchResult
}

const defaultClickHandler = function(){
    return;
}

const SearchResultItem:NextPage<Props> = (props) => {
    const {searchResult} = {...props};
    return(
        <div onClick={()=>searchResult.onClickFunction?searchResult.onClickFunction(searchResult.onClickParams):defaultClickHandler()} className="font-semibold text-lg dark:text-slate-200 p-2 m-1 transition ease-in-out hover:scale-105 hover:cursor-pointer text-left">
            {
                searchResult.iconPath?
                <div>
                    <img className="w-8 h-8 rounded-full inline" src={searchResult.iconPath} alt={`${searchResult.resultString} image`}/>
                    <span className="inline ml-2">{searchResult.resultString}</span>
                </div>
                :
                <span className="ml">{searchResult.resultString}</span>
            }
            
        </div>
        
    )   
}

export default SearchResultItem;