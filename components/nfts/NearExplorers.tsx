import { NextPage } from "next";
import { useContext, useState } from "react";
import { INFTMetadata, ITraitType } from "../../src/parsers/nftEthereum";
import { useKryptikThemeContext } from "../ThemeProvider";
import CardDivider from "./CardDivider";

interface Props {
    nftMetaData: INFTMetadata
}
const NearExplorers:NextPage<Props> = (props) => {
    const{nftMetaData} = {...props};
    const{isDark} = useKryptikThemeContext();
    return(
        <div className="">
            {
                                (!nftMetaData.isPoap) &&
                                <div className="flex flex-wrap">
                                <div className="mx-2 my-1 transition ease-in-out hover:scale-105">
                                    <a href={`https://paras.id/token/${nftMetaData.asset_contract.address}::${nftMetaData.token_id}/${nftMetaData.token_id}`} target="_blank" rel="noopener noreferrer">
                                        <div className="drop-shadow-lg bg-gray-50 hover:bg-gray-100 dark:hover-gray-800 border border-gray-100 dark:border-gray-800 dark:bg-black hover:cursor-pointer transition ease-in-out hover:scale-110 rounded-full py-1 px-1 w-fit">
                                        <img className="w-5 h-5 inline mr-2" src="/nftPlatforms/logos/paras.png"></img>  
                                        <span className="inline text-slate-700 dark:text-slate-200 font-bold text-md">Paras</span>
                                        </div>
                                    </a>
                                </div>
            
                                <div className="mx-2 my-1 transition ease-in-out hover:scale-105">
                                    <a href={`https://explorer.mainnet.near.org/accounts/${nftMetaData.asset_contract.address}`} target="_blank" rel="noopener noreferrer">
                                        <div className="drop-shadow-lg bg-gray-50  hover:bg-gray-100 dark:hover-gray-800 border border-gray-100 dark:border-gray-800 dark:bg-black hover:cursor-pointer transition ease-in-out hover:scale-110 rounded-full py-1 px-1 w-fit">
                                            <img className="w-5 h-5 inline mr-2" src="/scanners/logos/near.png"></img>  
                                            <span className="inline text-slate-700 dark:text-slate-200 font-bold text-md">NEAR Scan</span>
                                        </div>
                                    </a>
                                </div>
                            </div>
            }

        </div>
        
    )   
}

export default NearExplorers;