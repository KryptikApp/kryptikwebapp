import { CoreTypes, SignClientTypes } from "@walletconnect/types";
import { NextPage } from "next";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import {
  IConnectCardProps,
  IParsedWcRequest,
  WcRequestType,
} from "../../src/handlers/connect/types";
import { isWalletConnectNetworkValid } from "../../src/handlers/connect/utils";
import { approveWcRequest } from "../../src/handlers/connect/walletConnect";
import { getTransactionFeeDataEVM } from "../../src/handlers/fees/EVMFees";
import ModalStore from "../../src/handlers/store/ModalStore";
import { getAddressForNetworkDb } from "../../src/helpers/utils/accountUtils";

import { parseWcRequest } from "../../src/parsers/txData";
import { NetworkDb } from "../../src/services/models/network";
import { KryptikProvider } from "../../src/services/models/provider";
import TransactionFeeData from "../../src/services/models/transaction";
import { useKryptikAuthContext } from "../KryptikAuthProvider";
import TxFee from "../transactions/TxFee";
import AppDetails from "./AppDetails";
import ConnectionCard from "./ConnectionCard";

const SignCard: NextPage<IConnectCardProps> = (props) => {
  const { signClient, legacySignClient, kryptikWallet, kryptikService } =
    useKryptikAuthContext();
  const { onRequestClose } = { ...props };
  const [isValid, setIsValid] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [tokenPrice, setTokenPrice] = useState<number>(0);
  const [feeData, setFeeData] = useState<TransactionFeeData | null>(null);
  const [isFeeLoaded, setIsFeeLoaded] = useState(false);
  const [parsedRequest, setParsedRequest] = useState<IParsedWcRequest | null>(
    null
  );
  const [isLegacy, setIsLegacy] = useState(false);
  const [networkDb, setNetworkDb] = useState<NetworkDb | null>(null);
  const [proposer, setProposer] = useState<{
    publicKey: string;
    metadata: CoreTypes.Metadata;
  } | null>(null);
  async function initializeNetworkMeta(
    newNetworkDb: NetworkDb,
    newParsedRequest: IParsedWcRequest
  ) {
    const newTokenPrice: number = await kryptikService.getTokenPrice(
      newNetworkDb?.coingeckoId
    );
    if (
      (newParsedRequest.requestType == WcRequestType.signAndSendTx ||
        newParsedRequest.requestType == WcRequestType.sendTx) &&
      newParsedRequest.tx?.evmTx
    ) {
      const provider: KryptikProvider =
        kryptikService.getProviderForNetwork(newNetworkDb);
      const newFeeData = await getTransactionFeeDataEVM({
        tx: newParsedRequest.tx.evmTx,
        tokenPriceUsd: newTokenPrice,
        networkDb: newNetworkDb,
        kryptikProvider: provider,
      });
      setFeeData(newFeeData);
      setIsFeeLoaded(true);
    }
    setTokenPrice(newTokenPrice);
  }

  function clear() {
    setTokenPrice(0);
    setProposer(null);
    setParsedRequest(null);
    setIsFeeLoaded(false);
    setFeeData(null);
    setIsLegacy(false);
    setNetworkDb(null);
    setErrorMessage("");
    setIsValid(true);
  }

  useEffect(() => {
    if (
      !ModalStore.state.data?.requestEvent &&
      !ModalStore.state.data?.legacyCallRequestEvent
    ) {
      return;
    }
    try {
      let newProposer: {
        publicKey: string;
        metadata: CoreTypes.Metadata;
      } | null = null;
      let newNetworkDb: NetworkDb | null = null;
      let newParsedRequest: IParsedWcRequest | null = null;
      if (ModalStore.state.data?.isLegacy) {
        setIsLegacy(true);
        const legacyEvent = ModalStore.state.data?.legacyCallRequestEvent;
        const newRequestSession = legacySignClient?.session;
        const newChainId = `eip155:${newRequestSession?.chainId || 1}`;
        newNetworkDb = kryptikService.getNetworkDbByBlockchainId(newChainId);
        newProposer = {
          publicKey: newRequestSession?.key || "",
          metadata: newRequestSession?.peerMeta || {
            name: "Unknown",
            description: "",
            url: "",
            icons: [""],
          },
        };
        if (!legacyEvent?.id) {
          throw new Error("Undefined request id.");
        }
        const tempRequest: SignClientTypes.EventArguments["session_request"] = {
          id: legacyEvent.id,
          topic: "Unknown",
          params: {
            request: {
              method: legacyEvent?.method || "",
              params: legacyEvent?.params || [""],
            },
            chainId:
              `eip1559:${newRequestSession?.chainId.toString()}` || `eip1559:0`,
          },
        };
        newParsedRequest = parseWcRequest(
          tempRequest,
          legacyEvent?.method || "",
          newNetworkDb
        );
        console.log("New parsed request legacy:");
        console.log(newParsedRequest);
        if (newNetworkDb && newParsedRequest) {
          initializeNetworkMeta(newNetworkDb, newParsedRequest);
        }
      } else {
        // Get proposal data from store
        const topic = ModalStore.state.data?.requestEvent?.topic || "";
        const newRequestSession = signClient
          ? signClient.session.get(topic)
          : null;
        newProposer = newRequestSession?.peer || null;
        const { request, chainId } =
          ModalStore.state.data?.requestEvent?.params || {};
        if (!ModalStore.state.data?.requestEvent) {
          throw new Error("Request event not available.");
        }
        // extract network
        newNetworkDb = chainId
          ? kryptikService.getNetworkDbByBlockchainId(chainId)
          : null;
        // parse walet connect request
        newParsedRequest = parseWcRequest(
          ModalStore.state.data.requestEvent,
          request?.method || null,
          newNetworkDb
        );
      }

      // determine if data is valid
      const isValidNetwork: boolean = isWalletConnectNetworkValid(newNetworkDb);
      if (!newParsedRequest || !newNetworkDb) {
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
      setIsValid(true);
    } catch (e) {
      console.log("Sign card load error:");
      console.log(e);
      setIsValid(false);
      setErrorMessage("Unable to initiate request handler.");
    }
  }, [ModalStore.state.data]);

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
        tokenPrice: tokenPrice,
      });
      if (!response) {
        throw new Error("Approval method returned null.");
      }
      if (isLegacy) {
        if (!legacySignClient) {
          toast.error(
            "Legacy client not specified. Unable to approve request."
          );
          throw new Error(
            "Legacy client not specified. Unable to approve request."
          );
        }
        legacySignClient.approveRequest(response);
        console.log("Approved legacy request");
      } else {
        signClient.respond({ topic: parsedRequest.topic, response: response });
      }
      toast.success("Approved");
      // close modal
      onRequestClose();
      clear();
    } catch (e) {
      console.log(e);
      toast.error(
        errorMessage != "" ? errorMessage : "Unable to approve request."
      );
    }
  };

  async function handleRejection() {
    try {
      // TODO: add better handler if id not available
      const requestId = parsedRequest?.id;
      const requestTopic =
        ModalStore.state.data?.requestEvent?.topic || "Unknown";
      const response = {
        id: requestId || 0,
        jsonrpc: "2.0",
        error: {
          code: 5000,
          message: "User rejected.",
        },
      };
      if (isLegacy) {
        if (!legacySignClient) {
          toast.error("Rejected. No client specified.");
        }
        legacySignClient?.rejectRequest(response);
      } else {
        await signClient?.respond({
          topic: requestTopic,
          response: response,
        });
      }
    } catch (e) {
      // pass for now
      console.warn(
        "Unable to respond with request rejection. Your funds are safe. No transaction has been approved without your consent."
      );
    }
    onRequestClose();
    clear();
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
          network={networkDb || undefined}
        />
      )}
      {isValid && (
        <div>
          <div className="mt-6">
            <p className="mb-2 font-semibold text-slate-900 dark:text-slate-100 text-lg">
              Tx Info
            </p>
            <div className="h-fit p-2 max-h-[20vh] overflow-y-hidden no-scrollbar bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-slate-600 text-xl dark:text-slate-300">
              <p className="text-md" style={{ whiteSpace: "pre-wrap" }}>
                {parsedRequest && parsedRequest.humanReadableString}
              </p>
            </div>
          </div>
          <p className="mt-4 mb-2 text-md text-slate-400 dark:text-slate-500">
            If approved, this transaction will be signed by your wallet.
          </p>
          {feeData && networkDb && (
            <div>
              <div className="flex flex-row space-x-2">
                <p className="text-md text-slate-400 dark:text-slate-500">
                  Cost:{" "}
                </p>
                <TxFee
                  tokenAndNetwork={{ baseNetworkDb: networkDb }}
                  txFeeData={feeData}
                  feesLoaded={isFeeLoaded}
                />
              </div>
            </div>
          )}
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
