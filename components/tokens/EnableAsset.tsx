import { NextPage } from "next";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import {
  checkAlgoApprovalStatus,
  createAlgoAprovalTransaction,
} from "../../src/handlers/assets/approve/algorandAssetApprover";
import { ColorEnum } from "../../src/helpers/utils";
import { getAddressForNetworkDb } from "../../src/helpers/utils/accountUtils";
import { NetworkDb } from "../../src/services/models/network";
import { TokenAndNetwork, TokenDb } from "../../src/services/models/token";
import {
  AlgoTransactionParams,
  defaultTransactionFeeData,
  defaultTxPublishedData,
  TransactionPublishedData,
} from "../../src/services/models/transaction";
import { TxProgress } from "../../src/services/types";
import Button from "../buttons/Button";
import { useKryptikAuthContext } from "../KryptikAuthProvider";
import LoadingSpinner from "../LoadingSpinner";
import Modal from "../modals/modal";
import { useKryptikThemeContext } from "../ThemeProvider";

interface Props {
  token: TokenDb;
  network?: NetworkDb;
}
const EnableAsset: NextPage<Props> = (props) => {
  const { isDark } = useKryptikThemeContext();
  const { kryptikService, kryptikWallet } = useKryptikAuthContext();
  const { token, network } = { ...props };
  const cardId = token.name;
  const cardTitleId = cardId + "Title";
  const cardDetailsId = cardId + "Details";
  const [showModal, setShowModal] = useState(false);
  const [loadingApprovalStatus, setLoadingApprovalStatus] = useState(false);
  const [sendingTransaction, setSendingTransaction] = useState(false);
  const [approved, setApproved] = useState(false);
  const [transactionFeeData, setTransactionFeedata] = useState(
    defaultTransactionFeeData
  );
  const [txPubData, setTxPubData] = useState<TransactionPublishedData>(
    defaultTxPublishedData
  );
  const [progress, setProgress] = useState<TxProgress>(TxProgress.Rewiew);
  // set token and network
  const tokenAndNetwork: TokenAndNetwork | null = network
    ? {
        baseNetworkDb: network,
        tokenData: {
          tokenDb: token,
          selectedAddress:
            token.contracts.find((c) => c.networkId == network.id)?.address ||
            "",
        },
      }
    : null;
  // fetch send account
  const sendAccount: string = tokenAndNetwork
    ? getAddressForNetworkDb(kryptikWallet, tokenAndNetwork.baseNetworkDb)
    : "";
  async function checkApprovalStatus() {
    setLoadingApprovalStatus(true);
    const assetId = tokenAndNetwork?.tokenData?.selectedAddress;
    if (!assetId || !tokenAndNetwork) {
      toast.error("Unable to check approval status.");
      setApproved(false);
      setLoadingApprovalStatus(false);
      return;
    }
    const provider = kryptikService.getProviderForNetwork(
      tokenAndNetwork.baseNetworkDb
    );
    try {
      const newApproved = await checkAlgoApprovalStatus({
        account: sendAccount,
        assetId: Number(assetId),
        provider: provider,
      });
      setApproved(newApproved);
      if (!newApproved) {
        setProgress(TxProgress.Rewiew);
      }
    } catch (e) {
      setApproved(false);
    }
    setLoadingApprovalStatus(false);
  }
  const openModal = function () {
    // start status check
    checkApprovalStatus();
    // reveal modal
    setShowModal(true);
  };
  const closeModal = function () {
    setShowModal(false);
    setProgress(TxProgress.Rewiew);
  };
  const handleEnable = async function () {
    const assetId = tokenAndNetwork?.tokenData?.selectedAddress;
    if (!assetId || !tokenAndNetwork) {
      toast.error("Unable to check approval status.");
      setApproved(false);
      setLoadingApprovalStatus(false);
      return;
    }
    const provider = kryptikService.getProviderForNetwork(
      tokenAndNetwork.baseNetworkDb
    );
    // sener and recipient are same for algorand approval transaction

    const txIn: AlgoTransactionParams = {
      decimals: 0,
      valueAlgo: 0,
      sendAccount: sendAccount,
      kryptikProvider: provider,
      tokenAndNetwork: tokenAndNetwork,
      toAddress: sendAccount,
      tokenPriceUsd: 0,
      tokenParamsAlgo: { contractAddress: assetId },
    };
    try {
      const approvalTransaction = await createAlgoAprovalTransaction(txIn);
      const newTxPubData = await approvalTransaction.SignAndSend({
        kryptikWallet: kryptikWallet,
        sendAccount: sendAccount,
      });
      if (!newTxPubData) {
        throw new Error("Unable to send approval.");
      }
      setTxPubData(newTxPubData);
      setSendingTransaction(false);
      setProgress(TxProgress.Complete);
      toast.success(`${token.name} approved!`);
      closeModal();
    } catch (e) {
      toast.error("Unable to publish approval");
      setSendingTransaction(false);
      setProgress(TxProgress.Failure);
    }
  };
  useEffect(() => {
    if (typeof document !== "undefined") {
      // change title color on hover
      document.getElementById(cardId)?.addEventListener("mouseover", () => {
        let cardTitle = document.getElementById(cardTitleId);
        if (!cardTitle) return;
        cardTitle.style.color = token.hexColor;
      });
      document.getElementById(cardId)?.addEventListener("mouseout", () => {
        let cardTitle = document.getElementById(cardTitleId);
        if (!cardTitle) return;
        if (isDark) {
          cardTitle.style.color = "white";
        } else {
          cardTitle.style.color = "black";
        }
      });
    }
    // expand to show token details when clicked
    const cardInfo = document.getElementById(cardDetailsId);
    if (cardInfo) {
      cardInfo.style.setProperty(
        "--originalHeight",
        `${cardInfo.scrollHeight}px`
      );
    }
  }, []);

  return (
    <div>
      <div
        id={`${cardId}`}
        className="border border-gray-100 dark:border-gray-800 rounded-lg px-2 py-4 hover:cursor-pointer"
        onClick={() => openModal()}
      >
        <div className="flex flex-row space-x-2">
          <img
            className="h-8 w-8rounded-full my-auto"
            src={token.logoURI}
            alt={`${token.name} image`}
          />
          <h1
            id={`${cardTitleId}`}
            className="text-xl text-black dark:text-white"
          >
            {token.name}
          </h1>
        </div>
      </div>
      <Modal isOpen={showModal} onRequestClose={closeModal} dark={isDark}>
        <div className="dark:text-white max-w-lg flex flex-col space-y-4 border border-gray-400 dark:border-gray-500 pt-6 pb-10 mx-auto my-auto px-4 rounded rounded-lg bg-gradient-to-r from-white to-gray-50 dark:from-black dark:to-gray-900">
          <div className="flex flex-row space-x-2">
            <img
              className="h-6 w-6 rounded-full my-auto"
              src={token.logoURI}
              alt={`${token.name} image`}
            />
            <h1
              id={`${cardTitleId}`}
              className="text-md text-black dark:text-white"
            >
              {token.name}
            </h1>
            {sendingTransaction && <LoadingSpinner />}
          </div>
          {/* loading approval status */}
          {loadingApprovalStatus && (
            <div className="flex flex-row text-center place-content-center mt-8">
              <p className="text-md text-gray-600 dark:text-gray-300">
                Loading Approval Status
              </p>
              {loadingApprovalStatus && <LoadingSpinner />}
            </div>
          )}
          {/* review approval transaction */}
          {!loadingApprovalStatus &&
            !approved &&
            progress == TxProgress.Rewiew && (
              <div className="w-full">
                <p className="mb-14 text-xl text-slate-900 dark:text-slate-100">
                  This transaction will allow you to send and receive{" "}
                  {token.name}.
                </p>
                <Button
                  color={ColorEnum.green}
                  text="Confirm"
                  expand={true}
                  clickHandler={handleEnable}
                />
              </div>
            )}
          {/* already approved */}
          {!loadingApprovalStatus &&
            approved &&
            progress == TxProgress.Rewiew && (
              <div className="w-full">
                <p className="mb-14 text-xl text-slate-900 dark:text-slate-100">
                  You are already approved to send and receive {token.name}.
                </p>
                <Button
                  color={ColorEnum.blue}
                  text="Close"
                  expand={true}
                  clickHandler={closeModal}
                />
              </div>
            )}
          {!sendingTransaction && progress == TxProgress.Failure && (
            <div className="w-full">
              <p className="mb-14 text-xl text-red-500 font-semibold">
                Unable to set approval for {token.name}.
              </p>
              <Button
                color={ColorEnum.red}
                text="Exit"
                expand={true}
                clickHandler={closeModal}
              />
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default EnableAsset;
