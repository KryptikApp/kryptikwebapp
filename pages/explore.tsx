import type { NextPage } from 'next'
import { useEffect, useState } from 'react';
import { useKryptikAuthContext } from '../components/KryptikAuthProvider'
import NftDisplay from '../components/nfts/NftDisplay';
import ProfileName from '../components/ProfileName';
import { getUserPhotoPath } from '../src/helpers/firebaseHelper';
import { INFTMetadata } from '../src/parsers/nftMetaData';
import { listNftsByAddress } from '../src/requests/nfts/openSeaApi';
import { listPoapsByAddress } from '../src/requests/nfts/poapApi';


const Explore: NextPage = () => {
  const enum ActiveCategory{
    all=0,
    poaps=1
  }
  const {authUser, kryptikWallet} = useKryptikAuthContext();
  const [activeCategory, setActiveCategory] = useState(ActiveCategory.all);
  const [isNFTFetched, setIsNFTFetched] = useState(true);
  const [nftMetaDataList, setNftMetadataList] = useState<INFTMetadata[]>([]);
  const [poapMetaDataList, setPoapMetadataList] = useState<INFTMetadata[]>([]);
  
  const fetchNFTData = async function(){
    setIsNFTFetched(false);
    // fetch eth nfts
    let newNftMetadataList = await listNftsByAddress(kryptikWallet.ethAddress);
    if(!newNftMetadataList){
      setIsNFTFetched(true);
      return;
    }
    // update eth state
    setNftMetadataList(newNftMetadataList);

    // fetch poaps
    let poapsList = await listPoapsByAddress(kryptikWallet.ethAddress);
    console.log("POAPS:");
    console.log(poapsList);
    if(!poapsList){
      setIsNFTFetched(true);
      return;
    }
    // update poap state
    setPoapMetadataList(poapsList);
    setIsNFTFetched(true);
  }

  useEffect(()=>{
    
    fetchNFTData();
    
  },[])

  return (
    <div>
       <div className="h-[2rem] dark:text-white">
          {/* padding div for space between top and main elements */}
        </div>
        <div className="flex flex-col md:flex-row">

           <div className='flex-1'>
            <div className="mx-auto text-center">
              <img src={getUserPhotoPath(authUser)} alt="Profile Image" className="object-cover w-20 h-20 rounded-full mx-auto mb-2"/>
              <ProfileName/>
            </div>
            <br/>

            <div className="flex flex-col mx-6">

              <div onClick={()=>setActiveCategory(ActiveCategory.all)} className={`${activeCategory == ActiveCategory.all?"bg-gradient-to-r from-gray-100 to-white dark:from-gray-900 dark:to-black":""} flex flex-row text-lg hover:cursor-pointer outline-0 transition ease-in-out hover:scale-110 text-slate-800 dark:text-slate-100 font-semibold rounded py-2 px-2`}>
                <span className='w-5 min-w-5 mr-2'>🎨</span>
                <h3 className="">All NFTs</h3>
                <span className="grow text-right">{nftMetaDataList.length+poapMetaDataList.length}</span>
              </div>

              <div onClick={()=>setActiveCategory(ActiveCategory.poaps)} className={`${activeCategory == ActiveCategory.poaps?"bg-gradient-to-r from-gray-100 to-white dark:from-gray-900 dark:to-black":""} flex flex-row text-lg hover:cursor-pointer outline-0 transition ease-in-out hover:scale-110 text-slate-800 dark:text-slate-100 font-semibold rounded py-2 px-2`}>
                 <span className='w-5 min-w-5 mr-2'>🏷️</span>
                 <h3 className="">Proof of Attendance</h3>
                 <span className="grow text-right">{poapMetaDataList.length}</span>
              </div>

            </div>             
           </div>

           <div className="flex-9 md:w-[80%]">
            {/* show active category name */}
            <div className="invisible md:visible dark:text-white">
            {
              activeCategory == ActiveCategory.all &&
              <div className="font-bold text-2xl ml-20 mb-6">
                <span className='w-10 min-w-10 mr-2 inline'>🎨</span>
                <h1 className="inline">All</h1>
              </div>
            }
             {
              activeCategory == ActiveCategory.poaps &&
              <div className="font-bold text-2xl ml-20 mb-6">
                <span className='w-10 min-w-10 mr-2 inline'>🏷️</span>
                <h1 className="inline">Proof of Attendance</h1>
              </div>
            }
            </div>

            {/* show loader while fetching nft data */}
            {
                !isNFTFetched &&
                <div className='text-center content-center items-center place-items-center my-40 mr-4'>
                    <p className="text-md font-bold text-slate-700 dark:text-slate-200 inline">Loading brilliant works of art!</p>
                    <svg role="status" className="w-8 h-8 ml-6 text-white animate-spin text-center content-center inline" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                              <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB"/>
                                              <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor"/>
                    </svg>
                </div>
            }
            {/* nft gallery */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mx-auto place-items-center">
              {/* all category */}
              {
                (activeCategory == ActiveCategory.all && isNFTFetched && nftMetaDataList.length !=0)?
                nftMetaDataList.map((nftData:INFTMetadata)=>
                (
                  <NftDisplay nftMetaData={nftData}/>
                )):
                <div>
                {
                  (isNFTFetched && activeCategory == ActiveCategory.all)&&
                  <div className="text-lg font-semibold text-lg dark:text-white text-center mt-40">
                    <span className='w-5 min-w-5 mr-2 inline'>👻</span>
                    <p className="inline">Nothing here!!</p>
                  </div>
                }
                </div>
                
              }
              {/* poap category */}
              {
                ((activeCategory == ActiveCategory.poaps || activeCategory == ActiveCategory.all) && isNFTFetched && poapMetaDataList.length !=0)?
                poapMetaDataList.map((poapData:INFTMetadata)=>
                (
                  <NftDisplay nftMetaData={poapData}/>
                )):
                <div>
                {
                  (isNFTFetched && activeCategory == ActiveCategory.poaps) &&
                  <div className="text-lg font-semibold text-lg dark:text-white text-center mt-40">
                    <span className='w-5 min-w-5 mr-2 inline'>👻</span>
                    <p className="inline">Nothing here!!</p>
                  </div>
                }
                </div>
                
              }
            </div>
           </div>
           <div className="md:hidden min-h-[4rem] dark:text-white">
            
                    {/* padding div for space between top and main elements */}
            </div>
        </div>

    </div>
 
  )
}

export default Explore