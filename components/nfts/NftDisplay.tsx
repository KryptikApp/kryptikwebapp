import { NextPage } from "next";
import Image from "next/image";
import { useEffect, useState } from "react";
import { INFTMetadata, ITrait } from "../../src/parsers/nftEthereum";
import { defaultNetworkDb } from "../../src/services/models/network";
import { useKryptikAuthContext } from "../KryptikAuthProvider";
import Modal from "../modals/modal";
import { useKryptikThemeContext } from "../ThemeProvider";
import CardDivider from "./CardDivider";
import EthExplorers from "./EthExplorers";
import NearExplorers from "./NearExplorers";
import SolExplorers from "./SolExplorers";
import { motion } from "framer-motion";

interface Props {
  nftMetaData: INFTMetadata;
}
const NftDisplay: NextPage<Props> = (props) => {
  const { nftMetaData } = { ...props };
  const nftCardId = `${
    nftMetaData.name ? nftMetaData.name : nftMetaData.collection.name
  }Card`;
  const modalId = `${nftMetaData.name}Modal`;
  const { isDark } = useKryptikThemeContext();
  const { kryptikService } = useKryptikAuthContext();
  const [showModal, setShowModal] = useState(false);
  const networkDb =
    kryptikService.getNetworkDbByTicker(nftMetaData.networkTicker) ||
    defaultNetworkDb;
  const [srcImg, setSrcImg] = useState(
    nftMetaData.isPoap ? "/nftPlatforms/logos/poap.svg" : networkDb.iconPath
  );

  useEffect(() => {
    if (!document) return;
    const modal = document.getElementById(modalId);
    if (!modal) return;
    // close modal if you click area around the nft card
    modal.addEventListener("click", function (e) {
      if (showModal) setShowModal(false);
    });
    // if you click the nft card itself, don't close the card!
    // stop propogation
    const nftCard = document.getElementById(nftCardId);
    if (!nftCard) return;
    nftCard.addEventListener("click", function (e) {
      e.stopPropagation();
    });
  }, []);
  function handleModalClose() {
    setShowModal(false);
  }
  return (
    <div id="" className="">
      {nftMetaData.image_url ? (
        <motion.div
          key={nftCardId + "motion"}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.4,
            ease: [0.25, 0.25, 0, 1],
            delay: 0.1,
          }}
        >
          <div
            className="hover:cursor-pointer transition ease-in-out hover:scale-110"
            onClick={() => setShowModal(true)}
          >
            <img
              src={nftMetaData.image_url}
              className="w-56 h-56 rounded-md drop-shadow-lg object-cover border border-gray-200 dark:border-gray-800"
            />

            <div className="flex">
              <p className="my-2 text-sm max-w-[200px] text-gray-400 dark:text-gray-500 font-semibold truncate ...">
                {nftMetaData.name
                  ? nftMetaData.name
                  : nftMetaData.collection.name}
              </p>
              <div className="flex-grow mt-3">
                <img className="h-4 w-4 float-right" src={srcImg} />
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <div
          className="transition ease-in-out hover:scale-110 hover:cursor-pointer"
          onClick={() => setShowModal(true)}
        >
          <div className="h-56 w-56 pt-20 rounded-md bg-gradient-to-r from-gray-100 to-white drop-shadow-lg dark:from-gray-900 dark:to-black text-lg dark:text-white text-center px-1 font-semibold truncate ...">
            {nftMetaData.collection.name}
          </div>
          <p className="my-2 text-sm text-gray-400 dark:text-gray-500 font-semibold">
            {nftMetaData.name ? nftMetaData.name : nftMetaData.collection.name}
          </p>
        </div>
      )}
      <Modal isOpen={showModal} onRequestClose={handleModalClose} dark={isDark}>
        {/* flex with card and image */}
        <div className="flex flex-col md:flex-row">
          <div className="md:hidden min-h-[2rem] dark:text-white">
            {/* padding div for space between top and main elements */}
          </div>

          {/* nft main image */}
          <div className="flex-1 opacity-100">
            {nftMetaData.image_url ? (
              <img
                src={nftMetaData.image_url}
                className="w-96 h-96 my-auto rounded-lg drop-shadow-xl object-cover border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900"
                placeholder="blur"
              />
            ) : (
              <div className="w-96 h-96 pt-36 rounded-md bg-gradient-to-r from-gray-100 to-white drop-shadow-lg dark:from-gray-900 dark:to-black text-lg dark:text-white text-center px-1 font-semibold overflow-y-auto no-scrollbar">
                <p>
                  {nftMetaData.name
                    ? nftMetaData.name
                    : nftMetaData.collection.name}
                </p>
              </div>
            )}
          </div>

          {/* nft info card */}
          <div
            id={nftCardId}
            className="flex-1 bg-white dark:bg-[#0c0c0c] md:ml-6 mt-8 md:mt-0 rounded-lg min-h-[30rem] md:min-h-[25rem] h-fit md:max-h-[40rem] dark:border dark:border-gray-100 md:overflow-x-hidden overflow-y-auto no-scrollbar"
          >
            <div className="mx-3 mt-3 text-black dark:text-white">
              <div>
                {nftMetaData.collection.image_url ? (
                  <img
                    className="inline object-cover w-6 h-6 rounded-full mr-2"
                    src={nftMetaData.collection.image_url}
                  />
                ) : (
                  <img
                    className="inline object-cover w-6 h-6 rounded-full mr-2"
                    src={nftMetaData.image_url}
                  />
                )}
                <span className="font-semibold inline text-sm text-gray-400 dark:gray-500 mt-2">
                  {nftMetaData.collection.name}
                </span>
              </div>
              <div>
                <h1 className="font-bold text-2xl">{nftMetaData.name}</h1>
              </div>

              <div className="my-4">
                {nftMetaData.networkTicker == "eth" && (
                  <EthExplorers nftMetaData={nftMetaData} />
                )}
                {nftMetaData.networkTicker == "sol" && (
                  <SolExplorers nftMetaData={nftMetaData} />
                )}
                {nftMetaData.networkTicker == "near" && (
                  <NearExplorers nftMetaData={nftMetaData} />
                )}
                <CardDivider />

                {nftMetaData.description ? (
                  <div>
                    <h2 className="text-lg dark:text-white font-bold">
                      Description
                    </h2>
                    <p className="text-gray-400 dark:text-gray-300">
                      {nftMetaData.description}
                    </p>
                  </div>
                ) : nftMetaData.metaExtensions &&
                  nftMetaData.metaExtensions.metadataUrl ? (
                  <div>
                    <h2 className="text-lg dark:text-white font-bold">
                      Description
                    </h2>
                    <p className="text-gray-400 dark:text-gray-300">
                      {nftMetaData.name
                        ? nftMetaData.name
                        : nftMetaData.collection.name}{" "}
                      is a collectible. You can find more metadata{" "}
                      <a
                        className="hover:cursor-pointer hover:text-sky-500 text-sky-400"
                        href={nftMetaData.metaExtensions.metadataUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        here
                      </a>
                      .
                    </p>
                  </div>
                ) : (
                  <div>
                    <h2 className="text-lg dark:text-white font-bold">
                      Description
                    </h2>
                    <p className="text-gray-400 dark:text-gray-300">
                      {nftMetaData.name
                        ? nftMetaData.name
                        : nftMetaData.collection.name}{" "}
                      is a collectible. You can learn more about NFTs{" "}
                      <a
                        className="hover:cursor-pointer hover:text-sky-500 text-sky-400"
                        href={`https://opensea.io/blog/guides/non-fungible-tokens/`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        here
                      </a>
                      .
                    </p>
                  </div>
                )}

                <div>
                  {nftMetaData.traits && nftMetaData.traits.length > 0 && (
                    <div>
                      <CardDivider />
                      <h2 className="text-lg dark:text-white font-bold">
                        Attributes
                      </h2>
                      <div className="flex flex-wrap">
                        {nftMetaData.traits.map(
                          (trait: ITrait, index: number) => (
                            <div
                              className="hover:cursor-pointer transition ease-in-out hover:scale-110 hover:z-10 bg-gray-200 dark:bg-[#111112] border border-gray-300 w-fit my-1 max-w-[140px] px-1 mx-2 rounded drop-shadow-lg"
                              key={index}
                            >
                              <p className="text-sm text-gray-400 dark:text-slate-300 font-bold">
                                {trait.trait_type}
                              </p>
                              <p className="text-sm text-gray-400 dark:text-slate-300 truncate ...">
                                {trait.value}
                              </p>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
                {nftMetaData.isPoap && (
                  <div>
                    <CardDivider />
                    <h2 className="text-lg dark:text-white font-bold">
                      About Poap
                    </h2>
                    <p>
                      POAPs are unique NFT badges given out to attendees of both
                      virtual and real-world events.
                    </p>
                  </div>
                )}
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
      </Modal>
    </div>
  );
};

export default NftDisplay;
