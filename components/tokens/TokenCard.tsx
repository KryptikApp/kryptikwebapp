import { NextPage } from "next";
import { useEffect, useState } from "react";
import { NetworkDb } from "../../src/services/models/network";
import { TokenDb } from "../../src/services/models/token";
import { ServiceState } from "../../src/services/types";
import Expandable from "../Expandable";
import IconSneakPeek from "../IconSneakPeek";
import { useKryptikAuthContext } from "../KryptikAuthProvider";
import { useKryptikThemeContext } from "../ThemeProvider";

interface Props {
  token: TokenDb;
}
const TokenCard: NextPage<Props> = (props) => {
  const { isDark } = useKryptikThemeContext();
  const { kryptikService } = useKryptikAuthContext();
  const { token } = { ...props };
  const cardId = token.name;
  const cardTitleId = cardId + "Title";
  const cardDetailsId = cardId + "Details";
  const [supportedNetworks, setSupportedNetworks] = useState<NetworkDb[]>([]);
  const [networkIconsToShow, setNetworkIconsToShow] = useState<string[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  useEffect(() => {
    if (typeof document !== "undefined") {
      // change title color on hover
      document.getElementById(cardId)?.addEventListener("mouseover", () => {
        let cardTitle = document.getElementById(cardTitleId);
        if (!cardTitle) return;
        cardTitle.style.color = token.hexColor;
      });
      document.getElementById(cardId)?.addEventListener("mouseout", () => {
        let cardTitle = document.getElementById(cardTitleId);
        if (!cardTitle) return;
        if (isDark) {
          cardTitle.style.color = "white";
        } else {
          cardTitle.style.color = "black";
        }
      });
    }
    // expand to show token details when clicked
    const cardInfo = document.getElementById(cardDetailsId);
    if (cardInfo) {
      cardInfo.style.setProperty(
        "--originalHeight",
        `${cardInfo.scrollHeight}px`
      );
    }
    const newSupportedNetworks: NetworkDb[] = [];
    const newSupportedIcons: string[] = [];
    // UNCOMMENT below for fetching supported networks
    // ensure web3 service is started
    if (kryptikService.serviceState != ServiceState.started) {
      return;
    }
    // iterate through chain data and populate supported networks
    for (const cd of token.contracts) {
      const newNetwork: NetworkDb | null = kryptikService.getNetworkDbById(
        cd.networkId
      );
      if (newNetwork) {
        newSupportedNetworks.push(newNetwork);
        // only show max three icons
        if (newSupportedIcons.length < 3) {
          newSupportedIcons.push(newNetwork.iconPath);
        }
      }
    }
    // update ui state
    setSupportedNetworks(newSupportedNetworks);
    setNetworkIconsToShow(newSupportedIcons);
  }, []);
  useEffect(() => {
    // update height of element to expand when we add network
    const cardInfo = document.getElementById(cardDetailsId);
    if (cardInfo) {
      cardInfo.style.setProperty(
        "--originalHeight",
        `${cardInfo.scrollHeight}px`
      );
    }
  }, [supportedNetworks]);
  return (
    <div
      id={`${cardId}`}
      className="border border-gray-100 dark:border-gray-800 rounded-lg px-2 py-4 hover:cursor-pointer"
      onClick={() => setShowDetails(!showDetails)}
    >
      <div className="flex flex-row space-x-2">
        <img
          className="w-8 h-8 rounded-full my-auto"
          src={token.logoURI}
          alt={`${token.name} image`}
        />
        <h1
          id={`${cardTitleId}`}
          className="text-xl text-black dark:text-white"
        >
          {token.name}
        </h1>
      </div>
      <Expandable isOpen={showDetails}>
        <div className="flex flex-col space-y-2">
          <p className="text-lg text-gray-700 dark:text-gray-200 mt-4">
            {token.description}
          </p>

          {/* UNCOMMENT below for displaying icons of supported networks */}
          {supportedNetworks.length != 0 && (
            <div>
              <h2 className="text-md text-gray-500 dark:text-gray-400 my-2">
                Supported Networks
              </h2>
              <div className={`${supportedNetworks.length > 1 && "ml-2"}`}>
                <IconSneakPeek
                  icons={networkIconsToShow}
                  groupTotal={supportedNetworks.length}
                />
              </div>
            </div>
          )}
        </div>
      </Expandable>
    </div>
  );
};

export default TokenCard;
