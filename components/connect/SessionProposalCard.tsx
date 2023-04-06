import { CoreTypes, SessionTypes, SignClientTypes } from "@walletconnect/types";
import { NextPage } from "next";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { IConnectCardProps } from "../../src/handlers/connect/types";
import ModalStore from "../../src/handlers/store/ModalStore";
import { getAddressForNetworkDb } from "../../src/helpers/utils/accountUtils";
import { NetworkDb } from "../../src/services/models/network";
import { useKryptikAuthContext } from "../KryptikAuthProvider";
import AppDetails from "./AppDetails";
import ConnectionCard from "./ConnectionCard";

const SessionProposalCard: NextPage<IConnectCardProps> = (props) => {
  const { signClient, legacySignClient, kryptikWallet, kryptikService } =
    useKryptikAuthContext();
  const { onRequestClose } = { ...props };
  const [isLegacy, setIsLegacy] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [proposal, setProposal] = useState<
    SignClientTypes.EventArguments["session_proposal"] | null
  >(null);
  const [proposer, setProposer] = useState<{
    publicKey: string;
    metadata: CoreTypes.Metadata;
  } | null>(null);
  useEffect(() => {
    // Get proposal data and wallet address from store
    if (ModalStore.state.data?.isLegacy) {
      const newLegacyProposal = ModalStore.state.data.legacyProposal;
      if (!newLegacyProposal) {
        return;
      }
      const { id, params } = newLegacyProposal;
      const [{ chainId, peerMeta }] = params;
      console.log("legacy proposal:");
      console.log(newLegacyProposal);
      // translate to modern proposal structure
      const newProposal: SignClientTypes.EventArguments["session_proposal"] = {
        id: id,
        params: {
          id: id,
          expiry: 0,
          relays: [],
          proposer: { publicKey: "", metadata: peerMeta },
          requiredNamespaces: {
            eip155: {
              // TODO: ensure proper blockchain id formatting
              chains: [`eip155:${chainId || 1}`],
              methods: [],
              events: [],
            },
          },
        },
      };
      setIsLegacy(true);
      setProposal(newProposal);
    } else {
      setIsLegacy(false);
      const newProposal = ModalStore.state.data?.proposal;
      setProposal(newProposal || null);
    }
  }, []);

  const handleAccept = async function () {
    console.log("RUNNING ACCEPT CONNECTION!");
    if (!proposal) {
      toast.error(" No proposal to approve.");
      return;
    }
    // Get required proposal data
    const { id, params } = proposal;
    const { proposer, requiredNamespaces, relays } = params;
    try {
      if (proposal) {
        const namespaces: SessionTypes.Namespaces = {};
        //TODO
        // format response
        Object.keys(requiredNamespaces).forEach((key) => {
          const accounts: string[] = [];
          requiredNamespaces[key].chains.map((chainId) => {
            console.log("CHAIN ID:");
            console.log(chainId);
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
        if (isLegacy) {
          if (!legacySignClient) {
            toast.error(
              "Unable to establish connection. Please try again later."
            );
            return;
          }
          const chainId = Number(
            requiredNamespaces.eip155.chains[0].split(":")[1]
          );
          const addy: string = namespaces.eip155.accounts[0].split(":")[2];
          console.log("Approving legacysession with:");
          console.log(chainId);
          console.log(addy);
          legacySignClient.approveSession({
            accounts: [addy],
            chainId: chainId ?? 1,
          });
        } else {
          if (!signClient) {
            toast.error(
              "Unable to establish connection. Please try again later."
            );
            return;
          }
          const { acknowledged } = await signClient.approve({
            id,
            relayProtocol: relays[0].protocol,
            namespaces,
          });
          await acknowledged();
        }
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
    if (isLegacy) {
      legacySignClient?.rejectSession();
    } else {
      signClient?.reject({
        id: proposal?.id || 0,
        reason: { code: 5000, message: "User rejected." },
      });
    }
    onRequestClose();
    toast("Connection rejected.");
  }

  return (
    <ConnectionCard
      title={"Review Connection"}
      onAccept={handleAccept}
      onReject={handleRejection}
    >
      {proposal && (
        <div>
          <AppDetails
            name={proposal.params.proposer.metadata.name}
            icon={proposal.params.proposer.metadata.icons[0]}
            description={proposal.params.proposer.metadata.description}
            url={proposal.params.proposer.metadata.url}
          />
          <p className="mt-6 text-xl font-semibold">
            No funds will leave your wallet without your permission.
          </p>
        </div>
      )}
      {!proposal && (
        <p className="text-xl text-red-500 font-semibold mt-6 mb-8">
          No proposal to approve.
        </p>
      )}
      <div></div>
    </ConnectionCard>
  );
};

export default SessionProposalCard;
