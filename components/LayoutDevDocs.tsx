import Head from "next/head";
import { useKryptikThemeContext } from "./ThemeProvider";
import NavbarDevDocs from "./navbars/NavbarDevDocs";
import Image from "next/image"
import { DocType } from "../src/helpers/docs/types";
import { getAllDocs } from "../src/helpers/docs";

type Props = {
  children:any
}
// TODO: Update to support dynamic headers
export default function Layout(props:Props) {
  const {children} = {...props};
  const {isDark, themeLoading} = useKryptikThemeContext();
    return (
        <div className={`min-h-screen ${(themeLoading || isDark)?"dark":""} ${(themeLoading || isDark)?"bg-black":"bg-white"}`}>
        <Head>
          <title>Kryptik Wallet</title>
          <meta name="description" content="Crypto made simple." />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        
      <main>
        <div className="w-full h-[8vh] dark:bg-sky-400 shadow-sm shadow-slate-500 z-10">
              <div className="flex flex-row space-x-2 px-4 py-3">
                    <Image src="/kryptikBrand/kryptikKGradient.png" width="28" height="28"></Image>
                    <h1 className="text-black dark:text-white text-xl font-bold">Kryptik Dev Docs</h1>
              </div>
        </div>
        <div className="flex flex-col px-4 md:px-0 md:flex-row">
          <NavbarDevDocs/>
          <div className="flex-grow">
              {children}
          </div>
        </div> 
       </main>
  
    </div>
    );
}
