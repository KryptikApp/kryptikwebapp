import "../styles/globals.css";
import type { AppProps } from "next/app";
import "highlight.js/styles/github-dark-dimmed.css";
import { Router } from "next/router";
import { useEffect } from "react";

import { load, trackPageview } from "fathom-client";
import Layout from "../components/Layout";
import { KryptikAuthProvider } from "../components/KryptikAuthProvider";
import { KryptikThemeProvider } from "../components/ThemeProvider";

import LayoutDevDocs from "../components/LayoutDevDocs";
import ConnectModal from "../components/connect/ConnectModal";

// Record a pageview when route changes
Router.events.on("routeChangeComplete", (as, routeProps) => {
  if (!routeProps.shallow) {
    trackPageview();
  }
});

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

  useEffect(() => {
    // on page load... add offline handler to DOM
    addOfflineHandler();
    load("UECUDUKZ", {
      includedDomains: ["www.kryptik.app", "kryptik.app"],
    });
  }, []);

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
