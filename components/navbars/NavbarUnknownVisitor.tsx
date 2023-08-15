import Link from "next/link";
import { useRouter } from "next/router";
import Menu, { MenuItem } from "../menu/menu";

export default function NavbarUnknownVisitor() {
  const mainButtonClassName =
    "p-2 lg:px-4 md:mx-2 md:text-center md:border md:border-solid border-gray-300 dark:border-gray-600 dark:hover:border-sky-200 rounded-full hover:cursor-pointer hover:bg-green-400 text-black dark:text-white transition-colors duration-300 mt-1 md:mt-0 md:ml-1";
  const router = useRouter();
  return (
    <Menu>
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
      <MenuItem>
        <Link href="../wallet/create">
          <span className={mainButtonClassName}>Connect</span>
        </Link>
      </MenuItem>
    </Menu>
  );
}
