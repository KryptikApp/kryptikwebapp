import { NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { RiEyeCloseLine, RiEyeLine } from "react-icons/ri";

// wallet SDK helpers
import { useKryptikAuthContext } from "../KryptikAuthProvider";
import { useKryptikThemeContext } from "../ThemeProvider";
import toast from "react-hot-toast";
import { WalletStatus } from "../../src/models/KryptikWallet";
import { getUserPhotoPath } from "../../src/helpers/auth";
import Menu, { MenuItem } from "../menu/menu";

const NavbarProduction: NextPage = () => {
  const { authUser, walletStatus } = useKryptikAuthContext();
  const { hideBalances, updateHideBalances } = useKryptikThemeContext();
  const router = useRouter();

  const handleHideBalances = function (isHideBalances: boolean) {
    if (!authUser) {
      toast.error("Please login before updating your preferences");
      return;
    }
    updateHideBalances(isHideBalances, authUser.uid);
    if (isHideBalances) {
      toast("Your balances will now be hidden while browsing");
    } else {
      toast("Your balances will now be visible while browsing");
    }
  };

  const mainButtonClassName =
    "p-2 lg:px-4 md:mx-2 md:text-center md:border md:border-solid border-gray-300 dark:border-gray-600 dark:hover:border-sky-200 rounded-full bg-green-400 hover:cursor-pointer text-white transition-colors duration-300 mt-1 md:mt-0 md:ml-1";

  return (
    <Menu>
      {authUser && (
        <MenuItem>
          <div className="ml-2 md:ml-0 md:mr-2 mt-1 text-gray-400">
            {hideBalances ? (
              <RiEyeCloseLine
                className="dark:text-white hover:cursor-pointer hover:animate-pulse"
                size="28"
                onClick={() => handleHideBalances(false)}
              />
            ) : (
              <RiEyeLine
                className="dark:text-white hover:cursor-pointer hover:animate-pulse"
                size="28"
                onClick={() => handleHideBalances(true)}
              />
            )}
          </div>
        </MenuItem>
      )}

      {authUser && (
        <MenuItem>
          <Link href="../profile/security">
            <span
              className={`p-2 lg:px-4 md:mx-2 text-gray-400 rounded hover:bg-gray-200 hover:cursor-pointer hover:text-gray-700 dark:hover:bg-gray-100 dark:hover:text-black transition-colors duration-300 ${
                router.pathname == "/profile" ? "font-bold" : ""
              } `}
            >
              Security
            </span>
          </Link>
        </MenuItem>
      )}

      <MenuItem>
        <Link href="../docs">
          <span
            className={`p-2 lg:px-4 md:mx-2 text-gray-400 rounded hover:bg-gray-200 hover:cursor-pointer hover:text-gray-700 dark:hover:bg-gray-100 dark:hover:text-black transition-colors duration-300 ${
              router.pathname.startsWith("/docs") ? "font-bold" : ""
            } `}
          >
            Learn
          </span>
        </Link>
      </MenuItem>

      <MenuItem>
        <Link href="../explore">
          <span
            className={`p-2 lg:px-4 md:mx-2 text-sky-400 md:text-center border border-transparent rounded hover:text-white hover:cursor-pointer hover:bg-sky-400 dark:hover:text-black transition-colors duration-300 ${
              router.pathname == "/explore" ? "font-bold" : ""
            }`}
          >
            Explore
          </span>
        </Link>
      </MenuItem>
      <div className="">
        {/* show disconnect button if connected and vise versa */}
        {authUser ? (
          walletStatus == WalletStatus.Connected ? (
            <MenuItem>
              <Link href="../wallet">
                <span
                  className={`p-2 lg:px-4 md:mx-2 text-green-400 md:text-center md:border md:border-solid border-gray-300 dark:border-gray-600 dark:hover:border-sky-200 rounded hover:bg-green-400 hover:cursor-pointer hover:text-white transition-colors duration-300 mt-1 md:mt-0 md:ml-1`}
                >
                  Wallet{" "}
                  <img
                    src={getUserPhotoPath(authUser)}
                    alt="Profile Image"
                    className="inline object-cover w-5 h-5 rounded-full ml-2 md:mb-1"
                  />
                </span>
              </Link>
            </MenuItem>
          ) : (
            <MenuItem>
              <Link href="../sync">
                <span className={mainButtonClassName}>Sync Wallet</span>
              </Link>
            </MenuItem>
          )
        ) : (
          <MenuItem>
            <Link href="../wallet/create">
              <span className={mainButtonClassName}>Connect</span>
            </Link>
          </MenuItem>
        )}
      </div>
    </Menu>
  );
};

export default NavbarProduction;
