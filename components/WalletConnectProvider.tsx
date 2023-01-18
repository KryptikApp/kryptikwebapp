import { SignClient } from "@walletconnect/sign-client/dist/types/client";
import { createContext, useContext } from "react";
import useWalletConnectEventsManager, {
  createSignClient,
} from "../src/handlers/connect/walletConnect";

interface ConnectProps {
  initialized: boolean;
  signClient: SignClient | undefined;
  resetConnection: () => any;
}
const kryptikWalletConnectContext = createContext<ConnectProps>({
  initialized: false,
  signClient: undefined,
  resetConnection: async () => {},
});

export function KryptikWalletConnectProvider(props: any) {
  const { value, children } = props;
  createSignClient().then((sc) => {
    const walletConnect = useWalletConnectEventsManager(sc);
    const { resetConnection } = walletConnect;
    // runn connect method on first load...
    resetConnection().then(() => {
      console.log("WAHHHHH");
    });
    return (
      <kryptikWalletConnectContext.Provider value={walletConnect}>
        {children}
      </kryptikWalletConnectContext.Provider>
    );
  });
}
// custom hook to use the authUserContext and access authUser and loading
export const useKryptikWalletConnectContext = () =>
  useContext(kryptikWalletConnectContext);
