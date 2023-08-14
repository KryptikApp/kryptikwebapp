import Head from "next/head";
import { Toaster } from "react-hot-toast";
import { useKryptikThemeContext } from "./ThemeProvider";
import { useKryptikAuthContext } from "./KryptikAuthProvider";
import { isClientUserValid } from "../src/helpers/auth";
import { useEffect, useState } from "react";
import NavbarUnknownVisitor from "./navbars/NavbarUnknownVisitor";
import NavbarUser from "./navbars/NavbarUser";
import SidebarUser from "./navbars/sidebar/SidebarUser";
import { useRouter } from "next/router";
import NavProfile from "./navbars/NavProfile";

// TODO: Update to support dynamic headers
export default function Layout({ children }) {
  const { isDark } = useKryptikThemeContext();
  const { authUser, loadingAuthUser } = useKryptikAuthContext();
  const [clientUserValid, setClientUserValid] = useState(false);
  useEffect(() => {
    if (loadingAuthUser || isClientUserValid(authUser)) {
      setClientUserValid(true);
      return;
    }
    setClientUserValid(false);
  }, [authUser, loadingAuthUser]);
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
  const [showProfileNav, setShowProfileNav] = useState(false);
  const router = useRouter();
  useEffect(() => {
    if (router.pathname.includes("/profile")) {
      setShowProfileNav(true);
      return;
    }
    setShowProfileNav(false);
  }, [router.pathname]);
  return (
    <body>
      <div className="relative">
        <SidebarUser />

        <div className="flex flex-col px-4 md:flex-row md:px-0">
          {/* side padding */}
          <div className="md:w-60 shrink-0" />
          <div className="flex-grow flex flex-col max-w-6xl mx-auto w-full relative">
            <NavbarUser />
            <div className="h-20" />
            <div className="">{children}</div>
            <div className="h-[7rem] md:h-0">
              {/* padding div for space between top and main elements */}
            </div>
          </div>
        </div>
        {showProfileNav && <NavProfile />}
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
      <div className="flex flex-col px-4 md:px-2">
        <div className="h-20" />
        <div className="flex-grow">{children}</div>
      </div>
    </body>
  );
}
