import { NextPage } from "next";
import { useEffect } from "react";
import { useSnapshot } from "valtio";
import ModalStore from "../../src/handlers/store/ModalStore";
import Modal from "../modals/modal";
import { useKryptikThemeContext } from "../ThemeProvider";
import SessionProposalCard from "./SessionProposalCard";
import SignCard from "./SignCard";

const ConnectModal: NextPage = () => {
  const { isDark } = useKryptikThemeContext();
  const { open, view } = useSnapshot(ModalStore.state);
  const closeModal = function () {
    // will automatically update 'open' value
    ModalStore.close();
  };
  useEffect(() => {
    console.log("VIEW:");
    console.log(view);
  }, [view]);
  return (
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
  );
};

export default ConnectModal;
