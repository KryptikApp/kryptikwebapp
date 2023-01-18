import { useState, useRef, useCallback, useEffect } from "react";
import { createSignClient } from "./walletConnect";

export default function useWalletConnectInitialization() {
  const [initialized, setInitialized] = useState(false);
  const prevRelayerURLValue = useRef<string>("");

  const relayerRegionURL = process.env.NEXT_PUBLIC_RELAY_URL || "";

  const onInitialize = useCallback(async () => {
    console.log("Initializing wallet connect.....");
    try {
      await createSignClient();
      prevRelayerURLValue.current = relayerRegionURL;
      setInitialized(true);
    } catch (err: unknown) {
      alert(err);
    }
  }, [relayerRegionURL]);

  useEffect(() => {
    if (!initialized) {
      onInitialize();
    }
    if (prevRelayerURLValue.current !== relayerRegionURL) {
      setInitialized(false);
      onInitialize();
    }
  }, [initialized, onInitialize, relayerRegionURL]);

  return initialized;
}

export interface IConnectCardProps {
  onRequestClose: () => any;
}
