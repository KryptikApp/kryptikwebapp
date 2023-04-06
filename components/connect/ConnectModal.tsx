import { defaultNetworks } from "hdseedloop";
import { NextPage } from "next";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useSnapshot } from "valtio";
import { formatJsonRpcResult } from "../../src/handlers/connect/utils";
import ModalStore from "../../src/handlers/store/ModalStore";
import { hexToInt } from "../../src/helpers/utils";
import { getAddressForNetwork } from "../../src/helpers/utils/accountUtils";
import { useKryptikAuthContext } from "../KryptikAuthProvider";
import Modal from "../modals/modal";
import { useKryptikThemeContext } from "../ThemeProvider";
import SessionProposalCard from "./SessionProposalCard";
import SignCard from "./SignCard";

const ConnectModal: NextPage = () => {
  const { isDark } = useKryptikThemeContext();
  const { legacySignClient, kryptikWallet, kryptikService } =
    useKryptikAuthContext();
  const { open, view } = useSnapshot(ModalStore.state);
  const closeModal = function () {
    // will automatically update 'open' value
    ModalStore.close();
  };
  useEffect(() => {
    if (!open) return;
    if (view == "SwitchNetworkModal") {
      const legacyEvent = ModalStore.state.data?.legacyCallRequestEvent;
      const { chainId } = legacyEvent?.params[0];
      // get new chain id from request
      const newChainId: number | null = hexToInt(chainId);
      const blockchainId: string = `eip155:${newChainId}`;
      const isSupported: boolean =
        kryptikService.isChainIdSupported(blockchainId);
      if (!isSupported) {
        toast.error("Requested network not available. Rejected request.");
        // format rejection response
        const response = {
          id: legacyEvent?.id || 0,
          jsonrpc: "2.0",
          error: {
            code: 5000,
            message: "User rejected.",
          },
        };
        legacySignClient?.rejectRequest(response);
        closeModal();
        return;
      }
      if (!newChainId) {
        toast.error("Unable to switch networks. Invalid request.");
        return;
      }
      // format and return approval result
      const res = formatJsonRpcResult(legacyEvent?.id || 0, null);
      legacySignClient?.approveRequest(res);
      const ethAddy = getAddressForNetwork(
        kryptikWallet,
        defaultNetworks["eth"]
      );
      // update session
      legacySignClient?.updateSession({
        accounts: [ethAddy],
        chainId: newChainId,
      });
      console.log("Network switch approved");
      toast("Network switch request approved!");
      closeModal();
    }
  }, [view, open]);

  return (
    <>
      {view != "SwitchNetworkModal" && (
        <div>
          <Modal isOpen={open} onRequestClose={closeModal} dark={isDark}>
            {view === "SessionProposalModal" && (
              <SessionProposalCard onRequestClose={closeModal} />
            )}
            {view === "SessionSignModal" && (
              <SignCard onRequestClose={closeModal} />
            )}
          </Modal>
        </div>
      )}
    </>
  );
};

export default ConnectModal;
