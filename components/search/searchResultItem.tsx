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
            {searchResult.resultString}
        </div>
        
    )   
}

export default SearchResultItem;