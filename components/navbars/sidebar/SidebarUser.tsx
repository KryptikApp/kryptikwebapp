import { useEffect, useState } from "react";
import Image from "next/image";
import { WalletStatus } from "../../../src/models/KryptikWallet";
import { ServiceState } from "../../../src/services/types";
import { useKryptikAuthContext } from "../../KryptikAuthProvider";
import { MenuItem } from "../../menu/menu";
import { SidebarProfile } from "../../profiles/SidebarProfile";
import ActionBar from "../../wallet/ActionBar";
import Link from "next/link";

export default function SidebarUser() {
  const { walletStatus, kryptikService, authUser } = useKryptikAuthContext();
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
    <nav className="w-60 invisible md:visible fixed h-full md:border-r-2 border-gray-500/20 md:bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-300/30 to-white dark:from-green-900/30 dark:to-[#0c0c0c] background-animate-slow z-50">
      {/* note: height is dependent on layout top bar */}
      <div
        className={`flex-col md:flex px-8 mt-8 text-black dark:text-white z-20`}
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
      <div className="absolute bottom-5 pl-12">
        <div className="flex flex-col space-y-2">
          <Link href="/profile/settings">
            <p className="font-semibold text-gray-400 dark:text-gray-500 text-center w-fit hover:cursor-point hover:text-green-400 transition-colors duration-200">
              Settings
            </p>
          </Link>
          <hr />
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
      </div>
    </nav>
  );
}
