import Link from "next/link";
import { useRouter } from "next/router";
import Menu, { MenuItem } from "../menu/menu";

export default function NavbarUser() {
  const mainButtonClassName =
    "p-2 lg:px-4 md:mx-2 md:text-center md:border md:border-solid border-gray-300 dark:border-gray-600 dark:hover:border-sky-200 rounded-full hover:cursor-pointer hover:bg-green-400 text-white transition-colors duration-300 mt-1 md:mt-0 md:ml-1";
  const router = useRouter();
  return (
    <Menu>
      <MenuItem>
        <Link href="../wallet/create">
          <span className={mainButtonClassName}>Connect</span>
        </Link>
      </MenuItem>
    </Menu>
  );
}
