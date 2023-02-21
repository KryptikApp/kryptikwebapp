import HDSeedLoop from "hdseedloop";
import { NextPage } from "next";
import { useQRCode } from "next-qrcode";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  assembleVault,
  createValidationCode,
  createVaultPieces,
} from "../../src/handlers/sync";
import { supabase } from "../../src/helpers/supabaseHelper";
import { ColorEnum } from "../../src/helpers/utils";
import { WalletStatus } from "../../src/models/KryptikWallet";
import ButtonSync from "../buttons/ButtonSync";
import { useKryptikAuthContext } from "../KryptikAuthProvider";
import KryptikScanner from "../kryptikScanner";
import SyncCard from "./SyncCard";

enum EnumProgress {
  Start = 0,
  ShowCode = 1,
  Validate = 2,
  Done = 3,
  Error = 4,
}

const Reciever: NextPage = () => {
  const router = useRouter();
  const { walletStatus, authUser, kryptikWallet, updateWallet } =
    useKryptikAuthContext();
  const [progressEnum, setProgressEnum] = useState(EnumProgress.Start);
  const [buttonText, setButtonText] = useState("Start");
  const [buttonColor, setButtonColor] = useState(ColorEnum.blue);
  const [errorText, setErrorText] = useState("Unable to sync.");
  const [syncPieces, setSyncPieces] = useState<string[] | null>(null);
  const [syncPieceIndex, setSyncPieceIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [totalSteps, setTotalSteps] = useState(0);
  const [validationCode, setValidationCode] = useState("");
  const [recoveredSeedloop, setRecoveredSeedloop] =
    useState<HDSeedLoop | null>();

  // Create channels with the same name for both the broadcasting and receiving clients.
  const channel = supabase.channel(`sync:${authUser?.uid}`);
  // Subscribe registers your client with the server
  channel
    // Listen to validation messages.
    .on("broadcast", { event: "validation" }, (payload) => {
      if (payload.isValidated == true) {
        incrementProgress();
      }
    })
    // Listen to stop scanning messages.
    .on("broadcast", { event: "stopScanning" }, (payload) => {
      setProgressEnum(EnumProgress.Validate);
      assembleWallet();
      setButtonText("Validate");
    })
    .subscribe((status) => {
      if (status === "SUBSCRIBED") {
        // console.log("Subscribed to sync channel.");
      }
    });

  /** Ensure sync action is allowed. */
  function isSyncSafe(): boolean {
    if (walletStatus == WalletStatus.OutOfSync) {
      return true;
    }
    return false;
  }

  async function assembleWallet() {
    setIsLoading(true);
    if (!authUser) {
      setIsLoading(false);
      setProgressEnum(EnumProgress.Error);
      setErrorText("User not available. Unable to complete sync.");
      return;
    }
    if (!syncPieces) {
      setIsLoading(false);
      setProgressEnum(EnumProgress.Error);
      setErrorText("Sync pieces not available. Unable to complete sync.");
      return;
    }
    try {
      const newSeedloop = await assembleVault(authUser, syncPieces);
      setRecoveredSeedloop(newSeedloop);
      const newValidationCode: string = createValidationCode(newSeedloop);
      setValidationCode(newValidationCode);
      setIsLoading(false);
    } catch (e) {
      setProgressEnum(EnumProgress.Error);
      setErrorText("Failed to assemble wallet vault. Unable to complete sync.");
      setIsLoading(false);
      return;
    }
  }

  function incrementProgress(uri?: string) {
    const isSafe: boolean = isSyncSafe();
    if (!isSafe) {
      setProgressEnum(EnumProgress.Error);
      return;
    }
    switch (progressEnum) {
      case EnumProgress.Start: {
        setProgressEnum(EnumProgress.ShowCode);
        break;
      }
      case EnumProgress.ShowCode: {
        const newIndex = syncPieceIndex + 1;
        // indicate we can show new code
        channel.send({
          type: "broadcast",
          event: "scan",
          payload: { newScanIndex: newIndex },
        });
        setSyncPieceIndex(newIndex);
        break;
      }
      case EnumProgress.Validate: {
        if (!recoveredSeedloop) {
          setProgressEnum(EnumProgress.Error);
          setErrorText("Unable to update wallet. Seedloop missing.");
          return;
        }
        updateWallet(recoveredSeedloop);
        setProgressEnum(EnumProgress.Done);
        setButtonText("Go to Wallet");
        // clean up state
        setRecoveredSeedloop(null);
        setSyncPieces(null);
        setTotalSteps(0);
        break;
      }
      case EnumProgress.Done: {
        //TODO: CLEAN UP STATE
        router.push("../wallet");
        break;
      }
      default: {
        break;
      }
    }
  }

  function cancelSync() {
    setSyncPieces([]);
    setButtonText("Start");
    setSyncPieceIndex(0);
    setProgressEnum(EnumProgress.Start);
    setRecoveredSeedloop(null);
    setTotalSteps(0);
  }

  useEffect(() => {
    if (!syncPieces) {
      setTotalSteps(0);
      return;
    }
    // total steps = number of sync pieces + 1 for start + 1 for validation
    setTotalSteps(syncPieces.length + 1 + 1);
  }, [syncPieces]);

  useEffect(() => {}, []);

  return (
    <SyncCard
      title={"Sync New Device"}
      // dummy progress value
      progressPercent={0}
      isLoading={isLoading}
      showProgress={false}
    >
      <div className="text-gray-800 dark:text-gray-200 text-xl">
        {/* start */}
        {progressEnum == EnumProgress.Start && (
          <div className="flex flex-col">
            <p>Sync your wallet. This will take around 60 seconds.</p>
          </div>
        )}
        {/* scan */}
        {progressEnum == EnumProgress.ShowCode && (
          <div className="flex">
            <div className="flex-1" />
            <div className="flex-2">
              <KryptikScanner
                show={progressEnum == EnumProgress.ShowCode}
                onScan={incrementProgress}
              />
            </div>
            <div className="flex-1" />
          </div>
        )}
        {/* validate */}
        {progressEnum == EnumProgress.Validate && (
          <div>
            <p className="font-bold text-2xl">Validate</p>
            {isLoading ? (
              <div>
                <p>
                  Assembling wallet on device. This may take a few seconds....
                </p>
                <div className="mx-auto bg-gray-400 animate-pulse rounded w-12 h-8"></div>
              </div>
            ) : (
              <div className="flex flex-col space-y-2">
                <p>Ensure code matches on both devices.</p>
                <p className="text-sky-400 text-3xl fontbold">
                  {validationCode}
                </p>
              </div>
            )}
          </div>
        )}

        {/* error */}
        {progressEnum == EnumProgress.Error && (
          <div className="flex flex-col">
            <p className="text-red-500">{errorText}</p>
            <p>If the error persists, contact support.</p>
          </div>
        )}
        {progressEnum == EnumProgress.ShowCode && (
          <div>
            <p
              className="text-center text-md hover:cursor-pointer text-gray-400 dark:text-gray-500"
              onClick={cancelSync}
            >
              Exit
            </p>
          </div>
        )}
        {(progressEnum == EnumProgress.Start ||
          progressEnum == EnumProgress.Done) && (
          <ButtonSync
            clickHandler={incrementProgress}
            text={buttonText}
            color={buttonColor}
            isDisabled={isLoading}
          />
        )}
      </div>
    </SyncCard>
  );
};

export default Reciever;
