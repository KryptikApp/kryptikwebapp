import Head from "next/head";

import Navbar from "./Navbar";

// TODO: Update to support dynamic headers
export default function Layout({children}) {
    return (
        <div className="h-screen">
        <Head>
          <title>Kryptik Wallet</title>
          <meta name="description" content="Crypto made simple." />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        
      <main className="container px-4 mx-auto ">
          <Navbar></Navbar>
        {children}
          
       </main>
  
    </div>
    );
  }