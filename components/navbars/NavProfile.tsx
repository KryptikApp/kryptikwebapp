import { NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  AiOutlineSetting,
  AiOutlineUser,
  AiOutlineLock,
  AiOutlineWallet,
  AiOutlineCamera,
} from "react-icons/ai";

const NavProfile: NextPage = () => {
  const router = useRouter();

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-slate-50 dark:bg-[#171717] dark:text-sky-400 opacity-80 flex flex-row justify-between text-sm text-sky-600 hover:cursor-pointer">
      <Link
        href="../profile/security"
        className="flex-grow py-5 px-3 text-center hover:bg-slate-200 hover:text-sky-800 dark:hover:bg-[#171717] dark:hover:text-green-400 transition-colors duration-800"
      >
        <AiOutlineLock className="w-6 h-6 mb-2 mx-auto" size="20" />
        <span
          className={`${
            router.pathname == "/profile/security" ? "font-bold" : ""
          }`}
        >
          Security
        </span>
      </Link>
      <Link
        href="../profile/settings"
        className="flex-grow py-5 px-3 text-center hover:bg-slate-200 hover:text-sky-800 dark:hover:bg-[#171717] dark:hover:text-green-400 transition-colors duration-800"
      >
        <AiOutlineSetting className="w-6 h-6 mb-2 mx-auto" size="20" />
        <span
          className={`${
            router.pathname == "/profile/settings" ? "font-bold" : ""
          }`}
        >
          Settings
        </span>
      </Link>
    </nav>
  );
};

export default NavProfile;
