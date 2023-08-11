import { useEffect, useState } from "react";

import { DocType } from "../../src/helpers/docs/types";
import { KryptikFetch } from "../../src/kryptikFetch";
import DocDevCategoryPreview from "../docs/docDevCategoryPreview";
import { MenuItem } from "../menu/menu";
import { SidebarProfile } from "../profiles/SidebarProfile";
import { WalletStatus } from "../../src/models/KryptikWallet";
import { ServiceState } from "../../src/services/types";
import { useKryptikAuthContext } from "../KryptikAuthProvider";
import ActionBar from "../wallet/ActionBar";

export default function NavbarSideActions() {
  const [showMenu, setShowMenu] = useState(false);
  const { walletStatus, kryptikService } = useKryptikAuthContext();
  const [progressionValid, setProgressionValid] = useState(false);
  useEffect(() => {
    if (
      walletStatus == WalletStatus.Connected &&
      kryptikService.serviceState == ServiceState.started
    ) {
      setProgressionValid(true);
    } else {
      setProgressionValid(false);
    }
  }, [walletStatus]);

  return (
    <nav className="h-full md:bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-300/30 to-white dark:from-green-900/30 dark:to-[#0c0c0c] background-animate-slow -ml-2">
      {/* navbar button */}
      <button
        id="nav-icon"
        onClick={() => setShowMenu(!showMenu)}
        type="button"
        className={`inline-flex ${
          showMenu && "open"
        } items-center mt-2 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:hover:bg-gray-700 dark:focus:ring-gray-600`}
        aria-controls="mobile-menu"
        aria-expanded="false"
      >
        <span className="bg-gray-500 dark:bg-gray-400"></span>
        <span className="bg-gray-500 dark:bg-gray-400"></span>
        <span className="bg-gray-500 dark:bg-gray-400"></span>
      </button>
      {/* note: height is dependent on layout top bar */}
      <div
        onClick={() => setShowMenu(false)}
        className={`${
          !showMenu && "hidden"
        } flex-col md:flex px-8 md:py-4 h-[92vh] md:w-[14vw] md:min-w-[250px] text-black dark:text-white`}
      >
        <MenuItem>
          <SidebarProfile />
          <ActionBar
            active={progressionValid}
            asVertical={true}
            hideBorder={true}
          />
        </MenuItem>
      </div>
    </nav>
  );
}
