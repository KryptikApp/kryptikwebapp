import { NextPage } from "next";
import { useContext, useState } from "react";
import { INFTMetadata, ITraitType } from "../../src/parsers/nftEthereum";
import { defaultNetworkDb } from "../../src/services/models/network";
import { useKryptikAuthContext } from "../KryptikAuthProvider";
import { useKryptikThemeContext } from "../ThemeProvider";
import CardDivider from "./CardDivider";
import EthExplorers from "./EthExplorers";
import NearExplorers from "./NearExplorers";
import SolExplorers from "./SolExplorers";

interface Props {
    nftMetaData: INFTMetadata
}
const NftDisplay:NextPage<Props> = (props) => {
    const{nftMetaData} = {...props};
    const{isDark} = useKryptikThemeContext();
    const {kryptikService} = useKryptikAuthContext();
    const [showModal, setShowModal] = useState(false);
    const networkDb = kryptikService.getNetworkDbByTicker(nftMetaData.networkTicker)||defaultNetworkDb;
    return(
        <div className="">
        {
            (nftMetaData.image_preview_url || nftMetaData.image_url)?
            <div className="hover:cursor-pointer transition ease-in-out hover:scale-110" onClick={()=>setShowModal(true)}>
                <img src={nftMetaData.image_preview_url?nftMetaData.image_preview_url:nftMetaData.image_url} className="w-56 h-56 rounded-md drop-shadow-lg object-cover border border-gray-200 dark:border-gray-800"/>
                <div className="flex">
                    <p className="my-2 text-sm text-gray-400 dark:text-gray-500 font-semibold">{nftMetaData.name?nftMetaData.name:nftMetaData.collection.name}</p>
                    <div className="flex-grow mt-3">
                        <img className="h-4 w-4 float-right" src={networkDb.iconPath}/>
                    </div>
                </div>
            </div>:
            <div className="transition ease-in-out hover:scale-110 hover:cursor-pointer" onClick={()=>setShowModal(true)}>
            <div className="h-56 w-56 pt-20 rounded-md bg-gradient-to-r from-gray-100 to-white drop-shadow-lg dark:from-gray-900 dark:to-black text-lg dark:text-white text-center px-1 font-semibold">
                 {nftMetaData.collection.name}
            </div>
            <p className="my-2 text-sm text-gray-400 dark:text-gray-500 font-semibold">{nftMetaData.name?nftMetaData.name:nftMetaData.collection.name}</p>
            </div>
        }
        
        {/* nft modal */}
        <div id={`${nftMetaData.id}Modal`} tabIndex={-1} aria-hidden={showModal?"false":"true"} className={`${!showModal && "hidden"} modal fixed w-full h-full top-0 left-0 z-50 flex items-center justify-center overflow-y-auto`} style={{backgroundColor:`${isDark?"rgba(0, 0, 0, 0.9)":"rgba(0, 0, 0, 0.9)"}`}}>
            {/* top right fixed close button  */}
            <button type="button" className="invisible md:visible text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto fixed top-4 right-5 items-center dark:hover:bg-gray-600 dark:hover:text-white" onClick={()=>setShowModal(false)}>
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>  
            </button>
            {/* flex with card and image */}
            <div className="flex flex-col md:flex-row opacity-100 m-4 md:min-w-[60%] max-w-[90%] md:max-w-[900px] max-h-screen">
                <div className="md:hidden min-h-[2rem] dark:text-white">
                        
                        {/* padding div for space between top and main elements */}
                </div>

                {/* close button shown on small screens */}
                <button type="button" className="md:hidden mb-2 text-black bg-white rounded-full font-bold text-sm p-1.5 ml-auto items-center dark:bg-white dark:text-black transition ease-in-out hover:scale-110" onClick={()=>setShowModal(false)}>
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>  
                </button>

                {/* nft main image */}
                <div className="flex-1 opacity-100">
                        {
                        (nftMetaData.image_original_url||nftMetaData.image_url)?
                        <img src={nftMetaData.image_original_url?nftMetaData.image_original_url:nftMetaData.image_url?nftMetaData.image_url:nftMetaData.image_preview_url} className="w-full h-fit min-h-[30rem] md:min-h-[25rem] rounded-lg drop-shadow-xl object-cover border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900" placeholder="blur"/>:            
                        <div className="w-full min-h-[10rem] max-h-[20rem] pt-[3rem] rounded-md bg-gradient-to-r from-gray-100 to-white drop-shadow-lg dark:from-gray-900 dark:to-black text-lg dark:text-white text-center px-1 font-semibold overflow-y-auto no-scrollbar">
                        {nftMetaData.name}
                        </div>
                        }
                </div>
                    
                {/* nft info card */}
                <div className="flex-1 bg-white dark:bg-black md:ml-6 mt-8 md:mt-0 rounded-lg min-h-[30rem] md:min-h-[25rem] h-fit md:max-h-[40rem] dark:border dark:border-gray-100 md:overflow-x-hidden overflow-y-auto no-scrollbar">
                    <div className="mx-3 mt-3 dark:text-white">
                        <div>
                            {
                                nftMetaData.collection.image_url?
                                <img className="inline object-cover w-6 h-6 rounded-full mr-2" src={nftMetaData.collection.image_url}/>:
                                <img className="inline object-cover w-6 h-6 rounded-full mr-2" src={nftMetaData.image_url}/>
                            }
                            <span className="font-semibold inline text-sm text-gray-400 dark:gray-500 mt-2">{nftMetaData.collection.name}</span>
                        </div>
                        <div>
                            <h1 className="font-bold text-2xl">{nftMetaData.name}</h1>
                        </div>
                        
                        <div className="my-4">
                            {
                                nftMetaData.networkTicker == "eth" && <EthExplorers nftMetaData={nftMetaData}/>
                            }
                            {
                                nftMetaData.networkTicker == "sol" && <SolExplorers nftMetaData={nftMetaData}/>
                            }
                            {
                                nftMetaData.networkTicker == "near" && <NearExplorers nftMetaData={nftMetaData}/>
                            }
                            <CardDivider/>

                            {
                                nftMetaData.description?
                                <div>
                                <h2 className="text-lg dark:text-white font-bold">Description</h2>
                                    <p className="text-gray-400 dark:text-gray-300">
                                        {nftMetaData.description}
                                    </p>
                                
                                </div>:

                                <div>
                                    <h2 className="text-lg dark:text-white font-bold">Description</h2>
                                    <p className="text-gray-400 dark:text-gray-300">{nftMetaData.name} is a collectible. You can learn more about NFTs <a className="hover:cursor-pointer hover:text-sky-500 text-sky-400" href={`https://opensea.io/blog/guides/non-fungible-tokens/`} target="_blank" rel="noopener noreferrer">here</a>.</p>
                                </div> 
                            }
                            
                            
                            <div>

                                
                                {
                                    (nftMetaData.traits && nftMetaData.traits.length>0)&& 
                                    
                                    <div>
                                        <CardDivider/>
                                        <h2 className="text-lg dark:text-white font-bold">Attributes</h2>
                                        <div className="flex flex-wrap">
                                        {
                                             nftMetaData.traits.map((trait:ITraitType, index:number)=>
                                                <div className="hover:cursor-pointer transition ease-in-out hover:scale-110 hover:z-10 bg-gray-200 dark:bg-[#111112] border border-gray-300 w-fit my-1 max-w-4 px-1 mx-2 rounded drop-shadow-lg" key={index}>
                                                    <p className="text-sm text-gray-400 dark:text-slate-300 font-bold">{trait.trait_type}</p>
                                                    <p className="text-sm text-gray-400 dark:text-slate-300 truncate ...">{trait.value}</p>
                                                </div>
                                            )
                                        }
                                        </div>
                                    </div>
                                }
                            
                            </div>
                            {
                                (nftMetaData.isPoap) &&
                                <div>
                                    <CardDivider/>
                                    <h2 className="text-lg dark:text-white font-bold">About Poap</h2>
                                    <p>POAPs are unique NFT badges given out to attendees of both virtual and real-world events.</p>
                                </div>
                            }
                            <div className="h-[2rem] dark:text-white">
                            {/* padding div for space between top and main elements */}
                            </div>              
                        </div>
                    </div>
                </div>
                <div className="md:hidden min-h-[4rem] dark:text-white">
                    
                            {/* padding div for space between top and main elements */}
                </div>
            </div>
        </div>


        </div>
        
    )   
}

export default NftDisplay;