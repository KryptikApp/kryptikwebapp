import { NextPage } from "next";
import { INFTMetadata } from "../../src/parsers/nftEthereum";
import { useKryptikThemeContext } from "../ThemeProvider";

interface Props {
  nftMetaData: INFTMetadata;
}
const SolExplorers: NextPage<Props> = (props) => {
  const { nftMetaData } = { ...props };
  const { isDark } = useKryptikThemeContext();
  return (
    <div className="">
      {!nftMetaData.isPoap && (
        <div className="flex flex-wrap">
          <div className="mx-2 my-1 transition ease-in-out hover:scale-105">
            <a
              href={`https://magiceden.io/item-details/${nftMetaData.asset_contract.address}?name=${nftMetaData.name}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="drop-shadow-lg bg-gray-50 hover:bg-gray-100 dark:hover-gray-800 border border-gray-100 dark:border-gray-800 dark:bg-[#0c0c0c] hover:cursor-pointer transition ease-in-out hover:scale-110 rounded-full py-1 px-1 w-fit">
                <img
                  className="w-5 h-5 inline mr-2"
                  src="/nftPlatforms/logos/magic eden.png"
                ></img>
                <span className="inline text-slate-700 dark:text-slate-200 font-bold text-md">
                  Magic Eden
                </span>
              </div>
            </a>
          </div>

          <div className="mx-2 my-1 transition ease-in-out hover:scale-105">
            <a
              href={`https://opensea.io/assets/solana/${nftMetaData.asset_contract.address}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="drop-shadow-lg bg-gray-50  hover:bg-gray-100 dark:hover-gray-800 border border-gray-100 dark:border-gray-800 dark:bg-[#0c0c0c] hover:cursor-pointer rounded-full py-1 px-1 w-fit">
                <img
                  className="w-5 h-5 inline mr-2"
                  src="/nftPlatforms/logos/opensea.svg"
                ></img>
                <span className="inline text-slate-700 dark:text-slate-200 font-bold text-md">
                  Opensea
                </span>
              </div>
            </a>
          </div>

          <div className="mx-2 my-1 transition ease-in-out hover:scale-105">
            <a
              href={`https://solscan.io/token/${nftMetaData.asset_contract.address}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="drop-shadow-lg bg-gray-50  hover:bg-gray-100 dark:hover-gray-800 border border-gray-100 dark:border-gray-800 dark:bg-[#0c0c0c] hover:cursor-pointer transition ease-in-out hover:scale-110 rounded-full py-1 px-1 w-fit">
                <img
                  className="w-5 h-5 inline mr-2"
                  src="/scanners/logos/solscan.png"
                ></img>
                <span className="inline text-slate-700 dark:text-slate-200 font-bold text-md">
                  Solscan
                </span>
              </div>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default SolExplorers;
