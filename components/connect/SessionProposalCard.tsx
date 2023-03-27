import { SessionTypes } from "@walletconnect/types";
import { NextPage } from "next";
import { useState } from "react";
import toast from "react-hot-toast";

import { IConnectCardProps } from "../../src/handlers/connect/types";
import ModalStore from "../../src/handlers/store/ModalStore";
import { getAddressForNetworkDb } from "../../src/helpers/utils/accountUtils";
import { NetworkDb } from "../../src/services/models/network";
import { useKryptikAuthContext } from "../KryptikAuthProvider";
import AppDetails from "./AppDetails";
import ConnectionCard from "./ConnectionCard";

const SessionProposalCard: NextPage<IConnectCardProps> = (props) => {
  const { signClient, kryptikWallet, kryptikService } = useKryptikAuthContext();
  const { onRequestClose } = { ...props };
  // Get proposal data and wallet address from store
  const proposal = ModalStore.state.data?.proposal;
  // Ensure proposal is defined
  if (!proposal) {
    return <p>Missing proposal data</p>;
  }
  const handleAccept = async function () {
    try {
      if (!signClient) {
        toast.error("Unable to establish connection. Please try again later.");
        return;
      }
      if (proposal) {
        const namespaces: SessionTypes.Namespaces = {};
        //TODO

        // format response
        Object.keys(requiredNamespaces).forEach((key) => {
          const accounts: string[] = [];
          requiredNamespaces[key].chains.map((chainId) => {
            const network: NetworkDb | null =
              kryptikService.getNetworkDbByBlockchainId(chainId);
            if (!network) {
              // TODO: update error message/handler
              toast.error("Unable to find network.");
              return;
            }
            // default to first address
            const addy: string = getAddressForNetworkDb(kryptikWallet, network);
            accounts.push(`${chainId}:${addy}`);
          });
          namespaces[key] = {
            accounts,
            methods: requiredNamespaces[key].methods,
            events: requiredNamespaces[key].events,
          };
        });
        const { acknowledged } = await signClient.approve({
          id,
          relayProtocol: relays[0].protocol,
          namespaces,
        });
        await acknowledged();
      } else {
        toast.error("No proposal to approve.");
      }
      toast.success("App connected.");
    } catch (e) {
      toast.error("Unable to approve connection.");
    }
    // close modal
    onRequestClose();
  };

  function handleRejection() {
    onRequestClose();
    toast("Connection rejected.");
  }

  // Get required proposal data
  const { id, params } = proposal;
  const { proposer, requiredNamespaces, relays } = params;
  return (
    <ConnectionCard
      title={"Review Connection"}
      onAccept={handleAccept}
      onReject={handleRejection}
    >
      <AppDetails
        name={proposal.params.proposer.metadata.name}
        icon={proposal.params.proposer.metadata.icons[0]}
        description={proposal.params.proposer.metadata.description}
        url={proposal.params.proposer.metadata.url}
      />
      <p className="mt-6 text-xl font-semibold">
        No funds will leave your wallet without your permission.
      </p>
      <div></div>
    </ConnectionCard>
  );
};

export default SessionProposalCard;
