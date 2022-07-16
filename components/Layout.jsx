import Head from "next/head";
import { useKryptikThemeContext } from "./ThemeProvider";
import Navbar from "./navbars/Navbar";

// TODO: Update to support dynamic headers
export default function Layout({children}) {
  const {isDark} = useKryptikThemeContext();
    return (
        <div className={`min-h-screen bg-white dark:bg-black`}>
        <Head>
          <title>Kryptik Wallet</title>
          <meta name="description" content="Crypto made simple." />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        
      <main className={`container px-4 mx-auto `}>
          <Navbar></Navbar>
        {children}
          
       </main>
  
    </div>
    );
  }