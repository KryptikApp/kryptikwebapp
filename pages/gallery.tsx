import { truncateAddress } from 'hdseedloop';
import type { NextPage } from 'next'
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import GalleryProfile from '../components/GalleryProfile';

import { useKryptikAuthContext } from '../components/KryptikAuthProvider'
import NftDisplay from '../components/nfts/NftDisplay';
import ProfileName from '../components/ProfileName';
import SearchNetwork from '../components/search/searchNetwork';
import { getUserPhotoPath } from '../src/helpers/firebaseHelper';
import { getAddressForNetworkDb } from '../src/helpers/utils/accountUtils';
import { networkFromNetworkDb } from '../src/helpers/utils/networkUtils';
import { WalletStatus } from '../src/models/KryptikWallet';
import { INFTMetadata } from '../src/parsers/nftEthereum';
import { listNearNftsByAddress } from '../src/requests/nearIndexApi';
import { listNftsByAddress } from '../src/requests/nfts/ethereumApi';
import { listPoapsByAddress } from '../src/requests/nfts/poapApi';
import { fetchServerSolNfts, listSolanaNftsByAddress } from '../src/requests/nfts/solanaApi';
import { defaultNetworkDb, NetworkDb } from '../src/services/models/network';
import { ServiceState } from '../src/services/types';

interface IRouterParams{
  account:string,
  networkTicker:string,
  name?:string,
  networkDb:NetworkDb
}

const Gallery: NextPage = () => {
  const enum ActiveCategory{
    all=0,
    poaps=1,
    sol=2,
    eth=3,
    near=4
  }
  let routerParams:IRouterParams|null = null
  // pull network ticker from route
  const {authUser, kryptikWallet, kryptikService} = useKryptikAuthContext();
  const router = useRouter();
  if ((typeof(router.query["networkTicker"]) == "string") && router.query["account"] && (typeof(router.query["account"]) == "string")) {
    let networkTicker:string = router.query["networkTicker"];
    let networkDb:NetworkDb|null = kryptikService.getNetworkDbByTicker(networkTicker);
    if(!networkDb) networkDb = defaultNetworkDb;
    if(typeof(router.query["name"]) == "string"){
      routerParams = {account:router.query["account"], networkTicker:networkTicker, networkDb:networkDb, name:router.query["name"]}
    }
    routerParams = {account:router.query["account"], networkTicker:networkTicker, networkDb:networkDb}
  }

  const [activeCategory, setActiveCategory] = useState(ActiveCategory.all);
  const [isNFTFetched, setIsNFTFetched] = useState(true);
  const [nftList, setNftList] = useState<INFTMetadata[]>([]);
  const [activeCategoryNftList, setActiveCategoryNftList] = useState<INFTMetadata[]>([]);
  const [activeCategoryNetworkDb, setActiveCategoryNetworkDb] = useState<NetworkDb|null>(defaultNetworkDb);

  const solImagePath = "https://firebasestorage.googleapis.com/v0/b/kryptikapp-50542.appspot.com/o/sol.png?alt=media&token=6d6e8337-79bb-45c6-bb31-47e49c7ce763"
  const nearImagePath = "https://firebasestorage.googleapis.com/v0/b/kryptikapp-50542.appspot.com/o/near%20logo.png?alt=media&token=244c738f-e138-4e28-bf23-c991b99050c7"
  const ethImagePath = "https://firebasestorage.googleapis.com/v0/b/kryptikapp-50542.appspot.com/o/eth.png?alt=media&token=cc1091fb-ef28-4008-a91e-5709818c452e"

  const fetchNFTDataKryptik = async function(){
    if(kryptikWallet.status != WalletStatus.Connected || !authUser?.isLoggedIn) return;
    setIsNFTFetched(false);
    let solanaNetworkDb = kryptikService.getNetworkDbByTicker("sol");
    if(!solanaNetworkDb){
      setIsNFTFetched(true);
      return;
    }
    let solanaAddress:string = await getAddressForNetworkDb(kryptikWallet, solanaNetworkDb);
    let newNftMetadataList:INFTMetadata[] = []
    let solNfts:INFTMetadata[]|null = await fetchServerSolNfts(solanaAddress);
    // fetch eth nfts
    let ethNfts:INFTMetadata[]|null = await listNftsByAddress(kryptikWallet.resolvedEthAccount.address);

    // push eth nfts to main list
    if(ethNfts){
      newNftMetadataList.push(...ethNfts)
    }
    // push sol nfts to main list
    if(solNfts){
      newNftMetadataList.push(...solNfts)
    }
    let nearNetworkDb = kryptikService.getNetworkDbByTicker("near");
    if(!nearNetworkDb){
      setIsNFTFetched(true);
      return;
    }
    // fetch near nfts
    let nearAddress = await getAddressForNetworkDb(kryptikWallet, nearNetworkDb)
    let nearKryptikProvider = await kryptikService.getKryptikProviderForNetworkDb(nearNetworkDb);
    if(nearKryptikProvider.nearProvider){
      try{
        let nearNfts = await listNearNftsByAddress(nearAddress, nearKryptikProvider.nearProvider);
        if(nearNfts){
          newNftMetadataList.push(...nearNfts);
        }
      }
      catch(e){
        console.warn(`Error: Unable to fetch NEAR nfts for ${nearAddress}`)
      }
    }
    // fetch poaps
    let poapsList = await listPoapsByAddress(kryptikWallet.resolvedEthAccount.address);
    if(poapsList){
      newNftMetadataList.push(...poapsList);
    }
    // update nft state
    setNftList(newNftMetadataList);
    setActiveCategoryNftList(newNftMetadataList);
    setIsNFTFetched(true);
  }

  // populates gallery if an external account and network ticker are provided
  const fetchNftDataAccount = async function(account:string, networkTicker:string){
    console.log("fetching nfts via account");
    setIsNFTFetched(false);
    let networkDb = kryptikService.getNetworkDbByTicker(networkTicker);
    if(!networkDb){
      setIsNFTFetched(true);
      return;
    }
    let newNftMetadataList:INFTMetadata[] = []
    switch(networkDb.ticker){
      case("eth"):{
        let ethNfts:INFTMetadata[]|null = await listNftsByAddress(account);
        // push eth nfts to main list
        if(ethNfts){
          newNftMetadataList.push(...ethNfts)
        }
        // fetch poaps
        let poapsList = await listPoapsByAddress(account);
        if(poapsList){
          newNftMetadataList.push(...poapsList);
        }
        break;
      }
      case("sol"):{
        let solNfts:INFTMetadata[]|null = await fetchServerSolNfts(account);
        // push sol nfts to main list
        if(solNfts){
          newNftMetadataList.push(...solNfts)
        }
        break;
      }
      case("near"):{
        let nearNetworkDb = kryptikService.getNetworkDbByTicker("near");
        if(!nearNetworkDb) return;
        let nearKryptikProvider = await kryptikService.getKryptikProviderForNetworkDb(nearNetworkDb);
        if(nearKryptikProvider.nearProvider){
          try{
            let nearNfts = await listNearNftsByAddress(account, nearKryptikProvider.nearProvider);
            if(nearNfts){
              newNftMetadataList.push(...nearNfts);
            }
          }
          catch(e){
            console.warn(`Error: Unable to fetch NEAR nfts for ${account}`)
          } 
        }
        break;
      }
      default:{
        break;
      }
    }
    // update nft list state
    setNftList(newNftMetadataList);
    setActiveCategoryNftList(newNftMetadataList);
    setIsNFTFetched(true);
  }
  

  const handleActiveCategoryChange = function(newCategory:ActiveCategory){
    setActiveCategory(newCategory);
    setActiveCategoryNftList([]);
    let newNetworkDB:NetworkDb|null = null;
    switch(newCategory){
        case(ActiveCategory.all):{
            setActiveCategoryNftList(nftList);
            break;
        }
        case(ActiveCategory.eth):{
            newNetworkDB = kryptikService.getNetworkDbByTicker("eth");
            // if unable to get selected network db... return
            // TODO: UPDATE NETWORKDB ERROR HANDLER
            if(!newNetworkDB) return;
            setActiveCategoryNetworkDb(newNetworkDB);
            let newNftList = nftList.filter(nft=>nft.networkTicker=="eth")
            setActiveCategoryNftList(newNftList);
            break;
        }
        case(ActiveCategory.near):{
            newNetworkDB = kryptikService.getNetworkDbByTicker("near");
            // if unable to get selected network db... return
            // TODO: UPDATE NETWORKDB ERROR HANDLER
            if(!newNetworkDB) return;
            setActiveCategoryNetworkDb(newNetworkDB);
            let newNftList = nftList.filter(nft=>nft.networkTicker=="near")
            setActiveCategoryNftList(newNftList);
            break;
        }
        case(ActiveCategory.sol):{
            newNetworkDB = kryptikService.getNetworkDbByTicker("sol");
            // if unable to get selected network db... return
            // TODO: UPDATE NETWORKDB ERROR HANDLER
            if(!newNetworkDB) return;
            setActiveCategoryNetworkDb(newNetworkDB);
            let newNftList = nftList.filter(nft=>nft.networkTicker=="sol")
            setActiveCategoryNftList(newNftList);
            break;
        }
        case(ActiveCategory.poaps):{
            let newNftList = nftList.filter(nft=>nft.isPoap)
            setActiveCategoryNftList(newNftList);
            break;
        }
        default:{
            setActiveCategoryNftList(nftList);
            break;
        }
    }
  }

  // get nfts on page load
  useEffect(() => {
      if(kryptikService.serviceState != ServiceState.started){
        router.push("/");
      }
      if(routerParams){
        fetchNftDataAccount(routerParams.account, routerParams.networkTicker);
      }
      else{
        fetchNFTDataKryptik();
      }
  }, [])

  return (
    <div>
       <div className="h-[2rem] dark:text-white">
          {/* padding div for space between top and main elements */}
        </div>
        <div className="flex flex-col md:flex-row">

           <div className='flex-1'>
             {
                routerParams?
                <GalleryProfile account={routerParams.account} networkDb={routerParams.networkDb}/>:
                <GalleryProfile/>
              }
            <br/>

            <div className="flex flex-col mx-6">

              <div onClick={()=>handleActiveCategoryChange(ActiveCategory.all)} className={`${activeCategory == ActiveCategory.all?"bg-gradient-to-r from-gray-100 to-white dark:from-gray-900 dark:to-black":""} flex flex-row text-lg hover:cursor-pointer outline-0 transition ease-in-out hover:scale-110 text-slate-800 dark:text-slate-100 font-semibold rounded py-2 px-2`}>
                <span className='w-5 mr-2'>🎨</span>
                <h3 className="">All NFTs</h3>
                <div className={`ml-1 grow text-right`}>
                    <span className={`${activeCategory == ActiveCategory.all && "bg-slate-400 dark:bg-slate-700 rounded-full w-fit pl-2 pr-2 -mr-2"}`}>{nftList.length}</span> 
                </div>
              </div>

              <div onClick={()=>handleActiveCategoryChange(ActiveCategory.eth)} className={`${activeCategory == ActiveCategory.eth?"bg-gradient-to-r from-gray-100 to-white dark:from-gray-900 dark:to-black":""} flex flex-row text-lg hover:cursor-pointer outline-0 transition ease-in-out hover:scale-110 text-slate-800 dark:text-slate-100 font-semibold rounded py-2 px-2`}>
                <img className='w-5 h-5 mt-1 rounded-full mr-2 flex-shrink-0' src={ethImagePath}/>
                <h3 className="">Ethereum NFTs</h3>
                  <div className={`ml-1 grow text-right`}>
                    <span className={`${activeCategory == ActiveCategory.eth && "bg-slate-400 dark:bg-slate-700 rounded-full w-fit pl-2 pr-2 -mr-2"}`}>{nftList.filter(nft=>nft.networkTicker=="eth").length}</span> 
                  </div>
              </div>

              <div onClick={()=>handleActiveCategoryChange(ActiveCategory.sol)} className={`${activeCategory == ActiveCategory.sol?"bg-gradient-to-r from-gray-100 to-white dark:from-gray-900 dark:to-black":""} flex flex-row text-lg hover:cursor-pointer outline-0 transition ease-in-out hover:scale-110 text-slate-800 dark:text-slate-100 font-semibold rounded py-2 px-2`}>
                <img className='w-5 h-5 mt-1 rounded-full mr-2 flex-shrink-0' src={solImagePath}/>
                <h3 className="">Solana NFTs</h3>
                  <div className={`ml-1 grow text-right`}>
                    <span className={`${activeCategory == ActiveCategory.sol && "bg-slate-400 dark:bg-slate-700 rounded-full w-fit pl-2 pr-2 -mr-2"}`}>{nftList.filter(nft=>nft.networkTicker=="sol").length}</span> 
                  </div>
              </div>

              <div onClick={()=>handleActiveCategoryChange(ActiveCategory.near)} className={`${activeCategory == ActiveCategory.near?"bg-gradient-to-r from-gray-100 to-white dark:from-gray-900 dark:to-black":""} flex flex-row text-lg hover:cursor-pointer outline-0 transition ease-in-out hover:scale-110 text-slate-800 dark:text-slate-100 font-semibold rounded py-2 px-2`}>
                <img className='w-5 h-5 mt-1 rounded-full mr-2 flex-shrink-0' src={nearImagePath}/>
                <h3 className="">Near NFTs</h3>
                  <div className={`ml-1 grow text-right`}>
                    <span className={`${activeCategory == ActiveCategory.near && "bg-slate-400 dark:bg-slate-700 rounded-full w-fit pl-2 pr-2 -mr-2"}`}>{nftList.filter(nft=>nft.networkTicker=="near").length}</span> 
                  </div>
              </div>

              <div onClick={()=>handleActiveCategoryChange(ActiveCategory.poaps)} className={`${activeCategory == ActiveCategory.poaps?"bg-gradient-to-r from-gray-100 to-white dark:from-gray-900 dark:to-black":""} flex flex-row text-lg hover:cursor-pointer outline-0 transition ease-in-out hover:scale-110 text-slate-800 dark:text-slate-100 font-semibold rounded py-2 px-2`}>
                 <span className='w-5 mr-2'>🏷️</span>
                 <h3 className="">Proof of Attendance</h3>
                 <div className={`ml-1 grow text-right`}>
                    <span className={`${activeCategory == ActiveCategory.poaps && "bg-slate-400 dark:bg-slate-700 rounded-full w-fit pl-2 pr-2 -mr-2"}`}>{nftList.filter(nft=>nft.isPoap).length}</span> 
                  </div>
              </div>

            </div>             
           </div>

           <div className="flex-9 md:w-[80%]"> 

            <div className="flex flex-row">
                   {/* show active category name */}
                   <div className="invisible md:visible dark:text-white min-h-[60px]">
                   {
                     activeCategory == ActiveCategory.all &&
                     <div className="font-bold text-2xl ml-20 mb-6">
                       <span className='w-10 mr-2 inline'>🎨</span>
                       <h1 className="inline">All</h1>
                     </div>
                   }
                   {
                     activeCategory == ActiveCategory.poaps &&
                     <div className="font-bold text-2xl ml-20 mb-6">
                       <span className='w-10 mr-2 inline'>🏷️</span>
                       <h1 className="inline">Proof of Attendance</h1>
                     </div>
                   }
                   {
                     (activeCategory!=ActiveCategory.poaps && activeCategory!=ActiveCategory.all && activeCategoryNetworkDb) &&
                     <div className="font-bold text-2xl ml-20 mb-6">
                       <img className='w-10 mr-2 inline' src={activeCategoryNetworkDb.iconPath}/>
                       <h1 className="inline">{activeCategoryNetworkDb.fullName} Nfts</h1>
                     </div>
                   }
                   </div>
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
            {
              isNFTFetched &&
              <div>
              {
                (activeCategoryNftList.length!=0)?
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mx-auto place-items-center">
                    {
                        (activeCategoryNftList).map((nftData:INFTMetadata, index:number)=>
                          <NftDisplay nftMetaData={nftData} key={index}/>
                        )
                    }
                </div>:
                <div>
                {
                  // update last condition to be not equals
                  (isNFTFetched && routerParams && routerParams.networkTicker==activeCategory.toString())?
                   // indicate network and account don't match
                  <div className="text-3xl font-semibold text-lg dark:text-white text-center mt-40 mx-auto">
                    <span className='w-5 min-w-5 mr-2 inline'>👻</span>
                    <p className="inline">Nothing here!!</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400"><span className="italic">{truncateAddress(routerParams.account, networkFromNetworkDb(routerParams.networkDb))} is not an {routerParams.networkDb.fullName} address</span></p>
                  </div>:
                  <div className="text-3xl font-semibold text-lg dark:text-white text-center mt-40 mx-auto">
                  <span className='w-5 min-w-5 mr-2 inline'>👻</span>
                  <p className="inline">Nothing here!!</p>
                </div>
                }
                </div>
              }
            </div>
            }
            


           </div>
           <div className="md:hidden min-h-[4rem] h-[4rem] dark:text-white">
            
                    {/* padding div for space between top and main elements */}
            </div>
        </div>

    </div>
 
  )
}

export default Gallery