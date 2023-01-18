import "../styles/globals.css";
import type { AppProps } from "next/app";
import Layout from "../components/Layout";
import { KryptikAuthProvider } from "../components/KryptikAuthProvider";
import { KryptikThemeProvider } from "../components/ThemeProvider";
import { useEffect } from "react";
import LayoutDevDocs from "../components/LayoutDevDocs";
import "highlight.js/styles/github-dark-dimmed.css";
import ConnectModal from "../components/connect/ConnectModal";

function MyApp({ Component, pageProps, router }: AppProps) {
  const handleOffline = function () {
    router.push("../status/offline");
  };

  const addOfflineHandler = function () {
    // handle if offline
    if (!window.navigator.onLine) {
      handleOffline();
    }
    // add connection handler
    window.addEventListener("offline", () => handleOffline());
  };
  // on page load... add offline handler to DOM
  useEffect(() => addOfflineHandler(), []);

  if (router.pathname.startsWith("/developer")) {
    return (
      <KryptikAuthProvider>
        <KryptikThemeProvider>
          <LayoutDevDocs>
            <Component {...pageProps} />
          </LayoutDevDocs>
        </KryptikThemeProvider>
      </KryptikAuthProvider>
    );
  } else {
    return (
      <KryptikAuthProvider>
        <KryptikThemeProvider>
          <Layout>
            <Component {...pageProps} />
            <ConnectModal />
          </Layout>
        </KryptikThemeProvider>
      </KryptikAuthProvider>
    );
  }
}

export default MyApp;
