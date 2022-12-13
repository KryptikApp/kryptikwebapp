import { NextPage } from "next";
import { useState } from "react";
import { useKryptikTheme } from "../../src/helpers/kryptikThemeHelper";

import { ColorEnum } from "../../src/helpers/utils";
import Button from "../buttons/Button";
import Modal from "../modals/modal";
import LockWalletCard from "./LockWalletCard";

const LockWalletModal: NextPage = () => {
  const { isDark } = useKryptikTheme();
  // modal state
  const [showModal, setShowModal] = useState(false);

  const closeModal = function () {
    setShowModal(false);
  };

  const openModal = function () {
    console.log("Showing modal....");
    setShowModal(true);
  };

  return (
    <div>
      <Button
        color={ColorEnum.red}
        clickHandler={openModal}
        text={"Lock Wallet"}
      />
      <Modal isOpen={showModal} onRequestClose={closeModal} dark={isDark}>
        <LockWalletCard />
      </Modal>
    </div>
  );
};

export default LockWalletModal;
