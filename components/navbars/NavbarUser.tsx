import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { WalletStatus } from "../../src/models/KryptikWallet";
import { ServiceState } from "../../src/services/types";
import { useKryptikAuthContext } from "../KryptikAuthProvider";
import { MenuItem } from "../menu/menu";
import { SidebarProfile } from "../profiles/SidebarProfile";
import ActionBar from "../wallet/ActionBar";
import { getUserPhotoPath } from "../../src/helpers/auth";
import { defaultUser } from "../../src/models/user";
import AvatarSmall from "../profiles/AvatarSmall";
import ProfileName from "../profiles/ProfileName";

export default function NavbarUser() {
  const [showMenu, setShowMenu] = useState(false);
  const { walletStatus, kryptikService, authUser } = useKryptikAuthContext();
  const [progressionValid, setProgressionValid] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    // Handler to call on window resize
    function handleResize() {
      if (window.innerWidth < 778) {
        setIsSmallScreen(true);
      } else {
        setIsSmallScreen(false);
      }
    }
    // Add event listener
    window.addEventListener("resize", handleResize);
    handleResize();
  }, []);
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
  const showMenuStyles =
    "bg-sky-50 dark:bg-sky-900 pb-20 rounded-br-lg rounded-tr-lg fixed top-20 l-0 -ml-4";
  const mainButtonClassName =
    "p-2 lg:px-4 md:mx-2 md:text-center md:border md:border-solid border-gray-300 dark:border-gray-600 dark:hover:border-sky-200 rounded-full hover:cursor-pointer hover:bg-green-400 text-black dark:text-white transition-colors duration-300 mt-1 md:mt-0 md:ml-1";
  return (
    <div className="w-full">
      <div
        className={`flex flex-col space-y-4 h-20 mt-6 ${
          isSmallScreen && "hidden"
        }`}
      >
        <div className="w-full  flex flex-row text-xl items-center">
          <Link href="../docs">
            <h1 className="text-left text-xl text-gray-500 dark:text-gray-400">
              Learn
            </h1>
          </Link>
          <div className="flex-grow">
            <div className="float-right">
              <Link href="../explore">
                <div className={mainButtonClassName}>Explore</div>
              </Link>
            </div>
          </div>
        </div>
        <div className="h-[1px] w-full bg-gray-500/70" />
      </div>
      <div className="md:hidden flex flex-row pt-4 items-center">
        {/* navbar button */}
        <button
          id="nav-icon"
          onClick={() => setShowMenu(!showMenu)}
          type="button"
          className={`inline-flex ${
            showMenu && "open"
          } items-center rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:hover:bg-gray-700 dark:focus:ring-gray-600 ml-4`}
          aria-controls="mobile-menu"
          aria-expanded="false"
        >
          <span className="bg-gray-500 dark:bg-gray-400"></span>
          <span className="bg-gray-500 dark:bg-gray-400"></span>
          <span className="bg-gray-500 dark:bg-gray-400"></span>
        </button>
        <div className="flex-grow">
          <div className="flex flex-row space-x-2 float-right text-sm">
            <ProfileName isSmallText={true} />
            <AvatarSmall
              photoPath={getUserPhotoPath(authUser ? authUser : defaultUser)}
            />
          </div>
        </div>
        {/* note: height is dependent on layout top bar */}
        <div
          onClick={() => setShowMenu(false)}
          className={`${
            !showMenu ? "hidden" : showMenuStyles
          } flex-col md:flex px-8 md:pt-6 text-black dark:text-white z-20 w-[90%]`}
        >
          <div className="mt-2  mr-2 mb-12">
            <div className="flex flex-row space-x-2">
              <p className="text-xl font-bold text-gray-500">Kryptik</p>
              <div className="flex-grow my-auto">
                <Image
                  src="/kryptikBrand/kryptikEyez.png"
                  width={30}
                  height={30}
                  alt="logo"
                  className=""
                />
              </div>
            </div>
          </div>

          <MenuItem>
            <SidebarProfile />
            <ActionBar
              active={progressionValid}
              asVertical={true}
              hideBorder={true}
            />
          </MenuItem>
          <div className="absolute bottom-2">
            <div className="flex flex-row space-x-4">
              <Link href="/profile/settings">
                <p className="font-semibold text-gray-400 dark:text-gray-500 text-center w-fit hover:cursor-point hover:text-green-400 transition-colors duration-200">
                  Settings
                </p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
