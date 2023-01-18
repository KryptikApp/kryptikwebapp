import { NextPage } from "next";
import { useState } from "react";
import { useSnapshot } from "valtio";
import ModalStore from "../../src/handlers/store/ModalStore";
import { useKryptikTheme } from "../../src/helpers/kryptikThemeHelper";
import Modal from "../modals/modal";
import SessionProposalCard from "./SessionProposalCard";

const ConnectModal: NextPage = () => {
  const { isDark } = useKryptikTheme();
  const { open, view } = useSnapshot(ModalStore.state);
  const closeModal = function () {
    // will automatically update 'open' value
    ModalStore.close();
  };
  return (
    <div>
      <Modal isOpen={open} onRequestClose={closeModal} dark={isDark}>
        {view === "SessionProposalModal" && (
          <SessionProposalCard onRequestClose={closeModal} />
        )}
      </Modal>
    </div>
  );
};

export default ConnectModal;
