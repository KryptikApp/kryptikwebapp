import { CoreTypes } from "@walletconnect/types";
import { NextPage } from "next";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import {
  IConnectCardProps,
  IParsedWcRequest,
} from "../../src/handlers/connect/types";
import { isWalletConnectNetworkValid } from "../../src/handlers/connect/utils";
import { approveWcRequest } from "../../src/handlers/connect/walletConnect";
import ModalStore from "../../src/handlers/store/ModalStore";
import { getAddressForNetworkDb } from "../../src/helpers/utils/accountUtils";

import { parseWcRequest } from "../../src/parsers/txData";
import { NetworkDb } from "../../src/services/models/network";
import { KryptikProvider } from "../../src/services/models/provider";
import { useKryptikAuthContext } from "../KryptikAuthProvider";
import AppDetails from "./AppDetails";
import ConnectionCard from "./ConnectionCard";

const SignCard: NextPage<IConnectCardProps> = (props) => {
  const { signClient, kryptikWallet, kryptikService } = useKryptikAuthContext();
  const { onRequestClose } = { ...props };
  const [isValid, setIsValid] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [txData, setTxData] = useState<any>(null);
  const [parsedRequest, setParsedRequest] = useState<IParsedWcRequest | null>(
    null
  );
  const [networkDb, setNetworkDb] = useState<NetworkDb | null>(null);
  const [proposer, setProposer] = useState<{
    publicKey: string;
    metadata: CoreTypes.Metadata;
  } | null>(null);

  useEffect(() => {
    try {
      // Get proposal data from store
      const topic = ModalStore.state.data?.requestEvent?.topic || "";
      const newRequestSession = signClient
        ? signClient.session.get(topic)
        : null;
      const newProposer = newRequestSession?.peer || null;
      const { request, chainId } =
        ModalStore.state.data?.requestEvent?.params || {};
      if (!ModalStore.state.data?.requestEvent) {
        throw new Error("Request event not available.");
      }
      // extract network
      const newNetworkDb: NetworkDb | null = chainId
        ? kryptikService.getNetworkDbByBlockchainId(chainId)
        : null;
      // parse walet connect request
      const newParsedRequest = parseWcRequest(
        ModalStore.state.data.requestEvent,
        request?.method || null,
        newNetworkDb
      );
      // determine if data is valid
      const isValidNetwork: boolean = isWalletConnectNetworkValid(newNetworkDb);
      if (!newRequestSession || !newParsedRequest || !newNetworkDb) {
        setIsValid(false);
        setErrorMessage("Requested session unavailable.");
      }
      if (!isValidNetwork) {
        setIsValid(false);
        setErrorMessage(
          `${
            newNetworkDb ? newNetworkDb.fullName : "Unknown"
          } network connections are not yet supported.`
        );
      }
      // update page state
      setParsedRequest(newParsedRequest);
      setProposer(newProposer);
      setNetworkDb(newNetworkDb);
    } catch (e) {
      console.log("Sign card load error:");
      console.log(e);
      setIsValid(false);
      setErrorMessage("Unable to initiate request handler.");
    }
  }, []);

  const handleAccept = async function () {
    if (!signClient) {
      toast.error("Unable to establish connection. Please try again later.");
      return;
    }
    if (!isValid) {
      toast.error("Invalid request.");
      return;
    }
    if (!networkDb) {
      toast.error("Network is not available.");
      return;
    }
    if (!parsedRequest) {
      toast.error("Parsed request is not available.");
      return;
    }
    const addy = getAddressForNetworkDb(kryptikWallet, networkDb);
    const provider: KryptikProvider =
      kryptikService.getProviderForNetwork(networkDb);
    try {
      const response = await approveWcRequest({
        parsedRequest: parsedRequest,
        wallet: kryptikWallet,
        fromAddy: addy,
        provider: provider,
      });
      if (!response) {
        throw new Error("Approval method returned null.");
      }
      signClient.respond({ topic: parsedRequest.topic, response: response });
      toast.success("Approved");
      // close modal
      onRequestClose();
    } catch (e) {
      console.log(e);
      toast.error("Unable to approve request.");
    }
  };

  async function handleRejection() {
    try {
      // TODO: add better handler if id not available
      const requestId = ModalStore.state.data?.requestEvent?.id || 0;
      const requestTopic =
        ModalStore.state.data?.requestEvent?.topic || "Unknown";
      const response = {
        id: requestId,
        jsonrpc: "2.0",
        error: {
          code: 5000,
          message: "User rejected.",
        },
      };
      await signClient?.respond({
        topic: requestTopic,
        response: response,
      });
    } catch (e) {
      // pass for now
      console.warn(
        "Unable to respond with request rejection. Your funds are safe. No transaction has been approved without your consent."
      );
    }
    onRequestClose();
    toast("Connection rejected.");
  }

  return (
    <ConnectionCard
      title={"Review Transaction"}
      onAccept={handleAccept}
      onReject={handleRejection}
      acceptText="Approve"
    >
      {proposer && (
        <AppDetails
          name={proposer.metadata.name}
          icon={proposer.metadata.icons[0]}
          description={proposer.metadata.description}
          url={proposer.metadata.url}
        />
      )}
      {isValid && (
        <div>
          <div className="mt-6">
            <p className="mb-2 font-semibold text-slate-900 dark:text-slate-100 text-lg">
              Tx Info
            </p>
            <div className="h-[30vh] p-2 max-h-[30vh] overflow-y-hidden no-scrollbar bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-slate-600 text-xl dark:text-slate-300">
              <p className="text-md" style={{ whiteSpace: "pre-wrap" }}>
                {parsedRequest && parsedRequest.humanReadableString}
              </p>
            </div>
          </div>

          <p className="mt-4 mb-2 text-md text-slate-400 dark:text-slate-500">
            If approved, this transaction will be signed by your wallet.
          </p>
        </div>
      )}
      {!isValid && (
        <p className="text-xl text-red-500 font-semibold mt-6 mb-8">
          {errorMessage}
        </p>
      )}
      <div></div>
    </ConnectionCard>
  );
};

export default SignCard;
