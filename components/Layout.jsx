import Head from "next/head";
import Navbar from "./navbars/Navbar";
import { Toaster } from "react-hot-toast";
import { useKryptikThemeContext } from "./ThemeProvider";
import NavbarSideActions from "./navbars/NavBarSideActions";
import { useKryptikAuthContext } from "./KryptikAuthProvider";
import { isClientUserValid } from "../src/helpers/auth";
import { useEffect, useState } from "react";
import NavbarUnknownVisitor from "./navbars/NavbarUnknownVisitor";
import NavbarUser from "./navbars/NavbarUser";

// TODO: Update to support dynamic headers
export default function Layout({ children }) {
  const { isDark } = useKryptikThemeContext();
  const { authUser, loadingAuthUser } = useKryptikAuthContext();
  const [clientUserValid, setClientUserValid] = useState(true);
  useEffect(() => {
    if (!loadingAuthUser && isClientUserValid(authUser)) {
      setClientUserValid(true);
    }
  }, [authUser]);
  return (
    <>
      <Head>
        <title>Kryptik Wallet</title>
        <meta
          name="description"
          content="A powerful web wallet with delightful design. Swap, save, and send from a single interface."
        />
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

      <main className={`min-h-screen dark:bg-[#0c0c0c] bg-white`}>
        {clientUserValid ? (
          <LayoutUser>{children}</LayoutUser>
        ) : (
          <LayoutUnknownGuest>{children}</LayoutUnknownGuest>
        )}
      </main>
    </>
  );
}

function LayoutUser({ children }) {
  return (
    <body>
      <div className="w-full h-20 fixed">
        <NavbarUser />
      </div>
      <div className="h-20" />
      <div className="flex flex-col px-4 md:flex-row md:px-2 md:divide-x-2 divide-gray-200 dark:divide-gray-800">
        <NavbarSideActions />
        <div>
          <div className="flex-grow">{children}</div>
          <div className="h-[7rem] md:h-0">
            {/* padding div for space between top and main elements */}
          </div>
        </div>
      </div>
    </body>
  );
}

function LayoutUnknownGuest({ children }) {
  return (
    <body>
      <div className="w-full h-20 fixed z-20">
        <NavbarUnknownVisitor />
      </div>
      <div className="h-20" />
      <div className="flex flex-col px-4 md:px-2">
        <div className="flex-grow">{children}</div>
      </div>
    </body>
  );
}
