import Head from "next/head";
import Navbar from "./navbars/Navbar";
import { Toaster } from "react-hot-toast";
import { useKryptikThemeContext } from "./ThemeProvider";

// TODO: Update to support dynamic headers
export default function Layout({ children }) {
  const { isDark } = useKryptikThemeContext();
  return (
    <>
      <Head>
        <title>Kryptik Wallet</title>
        <meta name="description" content="Crypto made simple." />
        <link rel="icon" href="/icon.ico" />
      </Head>
      {/* almost black background if dark mode, almost white if light mode */}
      <Toaster
        toastOptions={{
          style: {
            backgroundColor: isDark
              ? "rgba(25, 25, 25, 1)"
              : "rgba(242, 242, 242, 1)",
            color: isDark ? "#fff" : "#000",
            border: "1px solid rgba(36, 165, 247, 0.53)",
          },
        }}
      />

      <main
        className={`min-h-screen dark:bg-[#0c0c0c] bg-white
        px-2`}
      >
        <Navbar />
        {children}
        <div className="min-h-[10vh] md:min-h-0"></div>
      </main>
    </>
  );
}
