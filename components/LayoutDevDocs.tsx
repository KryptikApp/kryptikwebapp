import Head from "next/head";
import { useKryptikThemeContext } from "./ThemeProvider";
import NavbarDevDocs from "./navbars/NavbarDevDocs";
import Image from "next/image";
import Link from "next/link";
import { RiMoonFill, RiSunFill } from "react-icons/ri";
import { useKryptikAuthContext } from "./KryptikAuthProvider";
import { Toaster } from "react-hot-toast";

type Props = {
  children: any;
};
// TODO: Update to support dynamic headers
export default function Layout(props: Props) {
  const { children } = { ...props };
  const { isDark, themeLoading, updateIsDark } = useKryptikThemeContext();
  const { authUser } = useKryptikAuthContext();

  function handleDarkToggle() {
    // uid to update theme for if persisting
    const uid: string = authUser ? authUser.uid : "default";
    updateIsDark(!isDark, uid, false);
  }
  return (
    <div
      className={`min-h-screen ${themeLoading || isDark ? "dark" : ""} ${
        themeLoading || isDark ? "bg-black" : "bg-white"
      }`}
    >
      <Head>
        <title>Kryptik Wallet</title>
        <meta name="description" content="Crypto made simple." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Toaster />
      <main>
        <div className="w-full h-[8vh] shadow-sm shadow-slate-500 z-10">
          <div className="flex flex-row space-x-2 px-4 py-3">
            <Link href={"/developer"}>
              <Image
                className="object-cover rounded-md hover:cursor-pointer"
                src="/kryptikBrand/kryptikKGradient.png"
                alt="Kryptik logo"
                width="34"
                height="20"
              ></Image>
            </Link>
            <Link href={"/developer"}>
              <h1 className="text-black dark:text-white text-xl font-bold my-auto hover:cursor-pointer">
                Kryptik Dev Docs
              </h1>
            </Link>

            <div className="flex-grow flex flex-row-reverse">
              <Link href="/">
                <div className="bg-gray-100 dark:bg-gray-800 hover:text-green-400 hover:dark:text-green-400 float-right p-2 rounded-md text-gray-700 dark:text-gray-300 hover:cursor-pointer md:ml-6">
                  Back to Wallet
                </div>
              </Link>
              <div
                className="invisible md:visible my-auto float-right w-fit h-fit p-1 hover:outline hover:outline-1 hover:outline-black hover:dark:outline-white rounded-full text-slate-400 dark:text-white"
                onClick={() => handleDarkToggle()}
              >
                {isDark ? <RiMoonFill size={20} /> : <RiSunFill size={20} />}
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col px-4 md:px-0 md:flex-row">
          <NavbarDevDocs />
          <div className="flex-grow">{children}</div>
        </div>
      </main>
    </div>
  );
}
