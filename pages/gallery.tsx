import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
import GalleryProfile from "../components/profiles/GalleryProfile";
import { debounce } from "lodash";
import { AnimatePresence, motion } from "framer-motion";

import { useKryptikAuthContext } from "../components/KryptikAuthProvider";
import NftDisplay from "../components/nfts/NftDisplay";

import { getAddressForNetworkDb } from "../src/helpers/utils/accountUtils";
import { WalletStatus } from "../src/models/KryptikWallet";
import { defaultUser } from "../src/models/user";
import { INFTMetadata } from "../src/parsers/nftEthereum";
import { defaultNetworkDb, NetworkDb } from "../src/services/models/network";
import { ServiceState } from "../src/services/types";
import {
  ActiveCategory,
  CategoryLengths,
  defaultCategoryLengths,
} from "../src/types/category";
import SelectorCategory from "../components/nfts/SelectorCategory";
import {
  aggregateNfts,
  FetchNftProps,
  FetchNftResponse,
  fetchNFTs,
  totalNfts,
} from "../src/nfts/fetch";
import LoadingSpinner from "../components/loadingSpinner";
import { listEthNftsByAddress } from "../src/requests/nfts/ethereumApi";
import NftLoader from "../components/nfts/NftLoader";
import { fetchServerSolNfts } from "../src/requests/nfts/solanaApi";

interface IRouterParams {
  account: string;
  networkTicker: string;
  name?: string;
  networkDb: NetworkDb;
}

const Gallery: NextPage = () => {
  let routerParams: IRouterParams | null = null;
  // pull network ticker from route
  const { authUser, kryptikWallet, kryptikService } = useKryptikAuthContext();
  const router = useRouter();
  if (
    typeof router.query["networkTicker"] == "string" &&
    router.query["account"] &&
    typeof router.query["account"] == "string"
  ) {
    let networkTicker: string = router.query["networkTicker"];
    let networkDb: NetworkDb | null =
      kryptikService.getNetworkDbByTicker(networkTicker);
    if (!networkDb) networkDb = defaultNetworkDb;
    if (typeof router.query["name"] == "string") {
      routerParams = {
        account: router.query["account"],
        networkTicker: networkTicker,
        networkDb: networkDb,
        name: router.query["name"],
      };
    }
    routerParams = {
      account: router.query["account"],
      networkTicker: networkTicker,
      networkDb: networkDb,
    };
  }
  const MAX_NFTS_PER_VIEW = 12;
  const [activeCategory, setActiveCategory] = useState(ActiveCategory.all);
  const [isNFTFetched, setIsNFTFetched] = useState(true);
  const [nftList, setNftList] = useState<FetchNftResponse>({});
  const containerRef = useRef(null);
  const [isInView, setIsInView] = useState(false);
  const [isLast, setIsLast] = useState(false);
  const [loadingMoreOnScroll, setLoadingMoreOnScroll] = useState(false);
  const [activeCategoryNftList, setActiveCategoryNftList] = useState<
    INFTMetadata[]
  >([]);
  const [categoryLengths, setCategoryLengths] = useState<CategoryLengths>(
    defaultCategoryLengths
  );
  const [activeNetworkDb, setactiveNetworkDb] = useState<NetworkDb | null>(
    defaultNetworkDb
  );

  // fetches nfts from server
  async function handleFetchNFTData() {
    let nearNetworkDb = kryptikService.getNetworkDbByTicker("near");
    if (!nearNetworkDb) return;
    let nearKryptikProvider =
      await kryptikService.getKryptikProviderForNetworkDb(nearNetworkDb);
    let fetchProps: FetchNftProps = {
      nearKryptikProvider: nearKryptikProvider,
      maxToFetch: MAX_NFTS_PER_VIEW,
    };
    setIsNFTFetched(false);
    // populate fetchProps with addresses
    if (routerParams) {
      switch (routerParams.networkTicker) {
        case "eth":
          fetchProps.ethAddress = routerParams.account;
          break;
        case "sol":
          fetchProps.solAddress = routerParams.account;
          break;
        case "near":
          fetchProps.nearAddress = routerParams.account;
          break;
        default:
          break;
      }
    } else {
      if (
        kryptikWallet.status != WalletStatus.Connected ||
        !authUser ||
        authUser == defaultUser
      ) {
        setIsNFTFetched(true);
        return;
      }
      let ethNetworkDb = kryptikService.getNetworkDbByTicker("eth");
      if (ethNetworkDb) {
        fetchProps.ethAddress = getAddressForNetworkDb(
          kryptikWallet,
          ethNetworkDb
        );
      }
      let solNetworkDb = kryptikService.getNetworkDbByTicker("sol");
      if (solNetworkDb) {
        fetchProps.solAddress = getAddressForNetworkDb(
          kryptikWallet,
          solNetworkDb
        );
      }
      let nearNetworkDb = kryptikService.getNetworkDbByTicker("near");
      if (nearNetworkDb) {
        fetchProps.nearAddress = getAddressForNetworkDb(
          kryptikWallet,
          nearNetworkDb
        );
      }
    }
    // fetch nfts
    let nftData: FetchNftResponse = await fetchNFTs(fetchProps);
    setNftList(nftData);
    setIsNFTFetched(true);
    let newNetworkDB: NetworkDb | null = null;
    if (routerParams) {
      switch (routerParams.networkTicker) {
        case "eth":
          let ethNftList = nftData.eth ? nftData.eth.nfts : [];
          setActiveCategoryNftList(ethNftList);
          setActiveCategory(ActiveCategory.eth);
          break;
        case "sol":
          let solNftList = nftData.sol ? nftData.sol.nfts : [];
          setActiveCategoryNftList(solNftList);
          setActiveCategory(ActiveCategory.sol);
          newNetworkDB = kryptikService.getNetworkDbByTicker("sol");
          // if unable to get selected network db... return
          // TODO: UPDATE NETWORKDB ERROR HANDLER
          if (!newNetworkDB) return;
          setactiveNetworkDb(newNetworkDB);
          break;
        case "near":
          newNetworkDB = kryptikService.getNetworkDbByTicker("near");
          // if unable to get selected network db... return
          // TODO: UPDATE NETWORKDB ERROR HANDLER
          if (!newNetworkDB) return;
          setactiveNetworkDb(newNetworkDB);
          let nearNftList = nftData.near ? nftData.near.nfts : [];
          setActiveCategoryNftList(nearNftList);
          setActiveCategory(ActiveCategory.near);
          break;
        case "poaps":
          let poapNftList = nftData.poaps ? nftData.poaps.nfts : [];
          setActiveCategoryNftList(poapNftList);
          setActiveCategory(ActiveCategory.poaps);
          break;
        default:
          break;
      }
    } else {
      setActiveCategoryNftList(aggregateNfts(nftData));
      setActiveCategory(ActiveCategory.all);
    }
  }

  const handleActiveCategoryChange = function (newCategory: ActiveCategory) {
    setActiveCategory(newCategory);
    setActiveCategoryNftList([]);
    let newNetworkDB: NetworkDb | null = null;
    switch (newCategory) {
      case ActiveCategory.all: {
        setActiveCategoryNftList(aggregateNfts(nftList));
        break;
      }
      case ActiveCategory.eth: {
        newNetworkDB = kryptikService.getNetworkDbByTicker("eth");
        // if unable to get selected network db... return
        // TODO: UPDATE NETWORKDB ERROR HANDLER
        if (!newNetworkDB) return;
        setactiveNetworkDb(newNetworkDB);
        let newNftList = nftList.eth ? nftList.eth.nfts : [];
        setActiveCategoryNftList(newNftList);
        break;
      }
      case ActiveCategory.near: {
        newNetworkDB = kryptikService.getNetworkDbByTicker("near");
        // if unable to get selected network db... return
        // TODO: UPDATE NETWORKDB ERROR HANDLER
        if (!newNetworkDB) return;
        setactiveNetworkDb(newNetworkDB);

        let newNftList = nftList.near ? nftList.near.nfts : [];
        setActiveCategoryNftList(newNftList);
        break;
      }
      case ActiveCategory.sol: {
        newNetworkDB = kryptikService.getNetworkDbByTicker("sol");
        // if unable to get selected network db... return
        // TODO: UPDATE NETWORKDB ERROR HANDLER
        if (!newNetworkDB) return;
        setactiveNetworkDb(newNetworkDB);
        let newNftList = nftList.sol ? nftList.sol.nfts : [];
        setActiveCategoryNftList(newNftList);
        break;
      }
      case ActiveCategory.poaps: {
        let newNftList = nftList.poaps ? nftList.poaps.nfts : [];
        setActiveCategoryNftList(newNftList);
        break;
      }
      default: {
        setActiveCategoryNftList(aggregateNfts(nftList));
        break;
      }
    }
  };

  function handleScroll() {
    if (containerRef.current && typeof window !== "undefined") {
      const container: any = containerRef.current;
      const { bottom } = container.getBoundingClientRect();
      const { innerHeight } = window;
      setIsInView((prev) => bottom <= innerHeight);
    }
  }
  async function loadMoreEthNfts() {
    if (!nftList.eth || !nftList.eth.pageKey) return;
    console.log("Loading more eth nfts..");
    const nextPageKeyEth = nftList.eth.pageKey;
    // get correct address
    let ethAddress = "";
    if (routerParams) {
      ethAddress = routerParams.account;
    } else {
      if (
        kryptikWallet.status != WalletStatus.Connected ||
        !authUser ||
        authUser == defaultUser
      ) {
        setIsNFTFetched(true);
        return;
      }
      let ethNetworkDb = kryptikService.getNetworkDbByTicker("eth");
      if (ethNetworkDb) {
        ethAddress = getAddressForNetworkDb(kryptikWallet, ethNetworkDb);
      }
    }

    // get eth nfts
    let ethNftData = await listEthNftsByAddress(
      ethAddress,
      MAX_NFTS_PER_VIEW,
      nextPageKeyEth
    );
    // append to nft list
    if (ethNftData) {
      const oldNftList = nftList.eth?.nfts || [];
      const newNftList = {
        ...nftList,
        eth: {
          nfts: [...oldNftList, ...ethNftData.nfts],
          pageKey: ethNftData.pageKey,
        },
      };
      setNftList(newNftList);
      if (activeCategory == ActiveCategory.eth)
        setActiveCategoryNftList(newNftList.eth?.nfts || []);
      // no more nfts to load
      if (ethNftData.nfts.length < MAX_NFTS_PER_VIEW && !nftList.sol) {
        setIsLast(true);
      }
    }
    console.log("Done loading more nfts..");
  }
  async function loadMoreSolNfts() {
    if (!nftList.sol || !nftList.sol.pageKey) return;
    console.log("Loading more sol nfts..");
    const nextPageKey = nftList.sol.pageKey;
    // get correct address
    let address = "";
    if (routerParams) {
      address = routerParams.account;
    } else {
      if (
        kryptikWallet.status != WalletStatus.Connected ||
        !authUser ||
        authUser == defaultUser
      ) {
        setIsNFTFetched(true);
        return;
      }
      let networkDb = kryptikService.getNetworkDbByTicker("sol");
      if (networkDb) {
        address = getAddressForNetworkDb(kryptikWallet, networkDb);
      }
    }

    // get sol nfts
    let nftData = await fetchServerSolNfts(
      address,
      MAX_NFTS_PER_VIEW,
      nextPageKey
    );
    console.log("nftData", nftData);
    // append to nft list
    if (nftData) {
      const oldNftList = nftList.sol?.nfts || [];
      const newNftList = {
        ...nftList,
        sol: {
          nfts: [...oldNftList, ...nftData.nfts],
          pageKey: nftData.pageKey,
        },
      };
      setNftList(newNftList);
      if (activeCategory == ActiveCategory.sol)
        setActiveCategoryNftList(newNftList.sol?.nfts || []);
      // no more nfts to load
      if (nftData.nfts.length < MAX_NFTS_PER_VIEW && !nftList.eth) {
        setIsLast(true);
      }
    }
    console.log("Done loading more nfts..");
  }

  async function loadMoreNFTs() {
    setLoadingMoreOnScroll(true);
    if (activeCategory == ActiveCategory.eth) {
      await loadMoreEthNfts();
    } else if (activeCategory == ActiveCategory.sol) {
      await loadMoreSolNfts();
    } else {
      // pass
    }

    setLoadingMoreOnScroll(false);
  }

  useEffect(() => {
    // update category lengths with isMore set to false
    let newCategoryLengths: CategoryLengths = {
      [ActiveCategory.all]: { length: totalNfts(nftList), isMore: false },
      [ActiveCategory.eth]: {
        length: nftList.eth?.nfts.length || 0,
        isMore: false,
      },
      [ActiveCategory.near]: {
        length: nftList.near?.nfts.length || 0,
        isMore: false,
      },
      [ActiveCategory.sol]: {
        length: nftList.sol?.nfts.length || 0,
        isMore: false,
      },
      [ActiveCategory.poaps]: {
        length: nftList.poaps?.nfts.length || 0,
        isMore: false,
      },
    };
    // update isMore for eth
    if (nftList.eth?.pageKey && !isLast) {
      newCategoryLengths[ActiveCategory.eth].isMore = true;
    }
    if (nftList.sol?.pageKey && !isLast) {
      newCategoryLengths[ActiveCategory.sol].isMore = true;
    }
    setCategoryLengths(newCategoryLengths);
  }, [nftList]);
  // get nfts on page load
  useEffect(() => {
    if (kryptikService.serviceState != ServiceState.started) {
      router.push("/");
    }
    // async call to fetch nfts
    handleFetchNFTData();
    const handleDebouncedScroll = debounce(
      () => !isLast && handleScroll(),
      200
    );
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (isInView) {
      loadMoreNFTs();
    }
  }, [isInView]);

  return (
    <div>
      <div className="h-[2rem] dark:text-white">
        {/* padding div for space between top and main elements */}
      </div>
      <div className="flex flex-col md:flex-row pb-20">
        <div className="flex-1">
          {routerParams ? (
            <GalleryProfile
              account={routerParams.account}
              networkDb={routerParams.networkDb}
              forAuthUser={false}
            />
          ) : (
            <GalleryProfile forAuthUser={true} />
          )}
          <br />
          <SelectorCategory
            onCategoryClick={handleActiveCategoryChange}
            activeCategory={activeCategory}
            categoryLength={categoryLengths}
          />
        </div>

        <div className="flex-9 md:w-[80%]">
          <CategoryHeader
            activeCategory={activeCategory}
            activeNetworkDb={activeNetworkDb}
          />
          {/* show loader while fetching nft data */}
          {!isNFTFetched && (
            <div className="text-center content-center items-center place-items-center my-40 mr-4">
              <p className="text-md font-bold text-slate-700 dark:text-slate-200 inline">
                Loading brilliant works of art!
              </p>
              <LoadingSpinner />
            </div>
          )}

          {/* nft gallery */}
          {isNFTFetched && (
            <div>
              {activeCategoryNftList.length != 0 ? (
                <div
                  ref={containerRef}
                  className="grid grid-cols-1 md:grid-cols-3 gap-3 mx-auto place-items-center"
                >
                  {activeCategoryNftList.map(
                    (nftData: INFTMetadata, index: number) => (
                      <NftDisplay nftMetaData={nftData} key={index} />
                    )
                  )}
                  {loadingMoreOnScroll && <NftLoader />}
                  {loadingMoreOnScroll && <NftLoader />}
                  {loadingMoreOnScroll && <NftLoader />}
                  {loadingMoreOnScroll && <NftLoader />}
                  {loadingMoreOnScroll && <NftLoader />}
                  {loadingMoreOnScroll && <NftLoader />}
                </div>
              ) : (
                // show nothing here if no nfts
                <div className="text-3xl font-semibold text-lg dark:text-white text-center mt-40 mx-auto">
                  <span className="w-5 min-w-5 mr-2 inline">👻</span>
                  <p className="inline">Nothing here!!</p>
                </div>
              )}
            </div>
          )}
          {/* notification when loading more nfts */}
          {loadingMoreOnScroll && (
            <AnimatePresence>
              <motion.div
                initial={{ y: -50 }}
                animate={{ y: 0 }}
                exit={{ y: -50 }}
                transition={{ duration: 0.2 }}
              >
                <div className="fixed bottom-0 max-w-sm p-2 text-center bg-gray-600/30 dark:bg-gray-400/30 rounded-tr-md rounded-tl-md">
                  <p className="text-md text-center font-semibold text-slate-700 dark:text-slate-200 inline">
                    Loading more...
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
};

export default Gallery;

function CategoryHeader(props: {
  activeCategory: ActiveCategory;
  activeNetworkDb: NetworkDb | null;
}) {
  const { activeCategory, activeNetworkDb } = props;
  return (
    <div className="flex flex-row">
      {/* show active category name */}
      <div className="invisible md:visible dark:text-white min-h-[60px]">
        {activeCategory == ActiveCategory.all && (
          <div className="font-bold text-2xl ml-20 mb-6">
            <span className="w-10 mr-2 inline">🎨</span>
            <h1 className="inline">All</h1>
          </div>
        )}
        {activeCategory == ActiveCategory.poaps && (
          <div className="font-bold text-2xl ml-20 mb-6">
            <span className="w-10 mr-2 inline">🏷️</span>
            <h1 className="inline">Proof of Attendance</h1>
          </div>
        )}
        {activeCategory != ActiveCategory.poaps &&
          activeCategory != ActiveCategory.all &&
          activeNetworkDb && (
            <div className="font-bold text-2xl ml-20 mb-6">
              <img
                className="w-10 mr-2 inline"
                src={activeNetworkDb.iconPath}
              />
              <h1 className="inline">{activeNetworkDb.fullName} Nfts</h1>
            </div>
          )}
      </div>
    </div>
  );
}
