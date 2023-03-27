import { SessionTypes } from "@walletconnect/types";
import { NextPage } from "next";
import toast from "react-hot-toast";

import { IConnectCardProps } from "../../src/handlers/connect/types";
import ModalStore from "../../src/handlers/store/ModalStore";
import { getAddressForNetworkDb } from "../../src/helpers/utils/accountUtils";
import { NetworkDb } from "../../src/services/models/network";
import { useKryptikAuthContext } from "../KryptikAuthProvider";
import AppDetails from "./AppDetails";
import ConnectionCard from "./ConnectionCard";

const SignCard: NextPage<IConnectCardProps> = (props) => {
  const { signClient, kryptikWallet, kryptikService } = useKryptikAuthContext();
  const { onRequestClose } = { ...props };
  // Get proposal data and wallet address from store
  const proposer = ModalStore.state.data?.requestSession?.peer;
  const { request, chainId } =
    ModalStore.state.data?.requestEvent?.params || {};
  const newTxData = request?.params[0];
  const network: NetworkDb | null = chainId
    ? kryptikService.getNetworkDbByBlockchainId(chainId)
    : null;

  const handleAccept = async function () {
    if (!signClient) {
      toast.error("Unable to establish connection. Please try again later.");
      return;
    }
    if (!proposer || !request) {
      return;
    }
    try {
      toast.success("Approved");
      // close modal
      onRequestClose();
    } catch (e) {
      toast.error("Unable to approve request.");
    }
  };

  function handleRejection() {
    onRequestClose();
    toast("Connection rejected.");
  }

  console.log("HEREEEEEEEEE!");

  return (
    <ConnectionCard
      title={"Review Transaction"}
      onAccept={handleAccept}
      onReject={handleRejection}
      acceptText="Approve"
    >
      {proposer && request && (
        <AppDetails
          name={proposer.metadata.name}
          icon={proposer.metadata.icons[0]}
          description={proposer.metadata.description}
          url={proposer.metadata.url}
        />
      )}
      <div className="mt-6">
        <p className="mb-2 font-semibold text-slate-900 dark:text-slate-100 text-lg">
          Tx Data
        </p>
        <div className="h-[30vh] p-2 max-h-[30vh] w-full overflow-y-hidden no-scrollbar bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-slate-600 text-xl dark:text-slate-300">
          {newTxData && (
            <p className="text-md">{JSON.stringify(newTxData, null, 6)}</p>
          )}
          {!newTxData && (
            <p className="font-semibold mt-20 text-center">
              No request data to display.
            </p>
          )}
        </div>
      </div>

      <p className="mt-4 mb-2 text-md text-slate-400 dark:text-slate-500">
        If approved, this transaction will be signed by your wallet.
      </p>
      <div></div>
    </ConnectionCard>
  );
};

export default SignCard;
