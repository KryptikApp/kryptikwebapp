import { RealtimeChannel } from "@supabase/supabase-js";
import { NextPage } from "next";
import { useQRCode } from "next-qrcode";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  createValidationCode,
  createVaultPieces,
} from "../../src/handlers/sync";
import { supabase } from "../../src/helpers/supabaseHelper";
import { ColorEnum } from "../../src/helpers/utils";
import { WalletStatus } from "../../src/models/KryptikWallet";
import ButtonSync from "../buttons/ButtonSync";
import { useKryptikAuthContext } from "../KryptikAuthProvider";
import SyncCard from "./SyncCard";

enum EnumProgress {
  Start = 0,
  ShowCode = 1,
  Validate = 2,
  Done = 3,
  Error = 4,
}

type RealTimePayload = {
  [key: string]: any;
  type: "broadcast";
  event: string;
};

const Distributor: NextPage = () => {
  const router = useRouter();
  const { walletStatus, authUser, kryptikWallet } = useKryptikAuthContext();
  const [progressPercent, setProgressPercent] = useState(0);
  const [progressEnum, setProgressEnum] = useState(EnumProgress.Start);
  const [buttonText, setButtonText] = useState("Start");
  const [buttonColor, setButtonColor] = useState(ColorEnum.blue);
  const [errorText, setErrorText] = useState("Unable to sync.");
  const [syncPieces, setSyncPieces] = useState<string[] | null>(null);
  const [syncPieceIndex, setSyncPieceIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [totalSteps, setTotalSteps] = useState(0);
  const [validationCode, setValidationCode] = useState("");
  const [mostRecentPayload, setMostRecentPayload] =
    useState<RealTimePayload | null>(null);
  const [qrText, setQrText] = useState("");
  const { Canvas } = useQRCode();
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  /** Ensure sync action is allowed. */
  function isSyncSafe(): boolean {
    if (walletStatus != WalletStatus.Connected) {
      setErrorText(
        "Unable to sync. Please ensure you have a wallet on this device."
      );
      return false;
    }
    if (
      progressEnum != EnumProgress.Start &&
      progressEnum != EnumProgress.Done &&
      !syncPieces
    ) {
      setErrorText("Unable to sync. Failed to generate sync pieces.");
      return false;
    }
    if (
      progressEnum != EnumProgress.Start &&
      progressEnum != EnumProgress.Done &&
      totalSteps == 0
    ) {
      setErrorText("Unable to sync. Zero steps available.");
      return false;
    }
    return true;
  }

  function cancelSync() {
    console.log("canceling sync. User initiated.");
    setSyncPieces([]);
    setButtonText("Start");
    setSyncPieceIndex(0);
    setProgressEnum(EnumProgress.Start);
    setTotalSteps(0);
  }
  function incrementProgress() {
    const isSafe: boolean = isSyncSafe();
    if (!isSafe) {
      setProgressEnum(EnumProgress.Error);
      setProgressPercent(0);
      return;
    }
    console.log("running switch statement with enum and text:");
    console.log(progressEnum);
    console.log(buttonText);
    switch (progressEnum) {
      case EnumProgress.Start: {
        console.log("STAGE 0");
        if (!syncPieces) {
          // gnerate sync pieces
          generateSyncPieces();
        }
        break;
      }
      case EnumProgress.ShowCode: {
        console.log("STAGE 1");
        console.log("INDEX:");
        console.log(syncPieceIndex);
        const newIndex = syncPieceIndex;
        // ensure sync pieces are available
        if (!syncPieces) {
          setProgressEnum(EnumProgress.Error);
          setProgressPercent(0);
          return;
        }
        if (newIndex == syncPieces.length) {
          if (!channel) {
            setProgressEnum(EnumProgress.Error);
            setErrorText("Unable to sync. Message channel not available.");
            return;
          }
          console.log("matched!!!");
          // move onto validation
          setProgressEnum(EnumProgress.Validate);
          // generate validation code
          const newValidationCode = createValidationCode(
            kryptikWallet.seedLoop
          );
          setValidationCode(newValidationCode);
          setButtonText("Validate");
          channel
            .send({
              type: "broadcast",
              event: "stopScanning",
              payload: { stopScanning: true },
            })
            .then((e) => console.log("Stop scanning message sent."));
        } else {
          setProgressEnum(EnumProgress.ShowCode);
          console.log("hereee");
          console.log("new qr code:");
          const newQrText = syncPieces[newIndex];
          console.log(newQrText);
          // ensure new code has text
          if (newQrText == "") {
            console.warn("empty qr text.");
            setProgressEnum(EnumProgress.Error);
            setErrorText("Unable to sync. Empty qr code text.");
            return;
          }
          setQrText(newQrText);
          // button should display 'next'
          setButtonText("Next");
        }
        setSyncPieceIndex(newIndex);
        setProgressPercent(newIndex + 1 / totalSteps);
        break;
      }
      case EnumProgress.Validate: {
        if (!channel) {
          setProgressEnum(EnumProgress.Error);
          setErrorText("Unable to sync. Message channel not available.");
          return;
        }
        // indicate done
        channel
          .send({
            type: "broadcast",
            event: "validation",
            payload: { isValidated: true },
          })
          .then((e) => console.log("validation broadcast sent."));
        setProgressPercent(100);
        setProgressEnum(EnumProgress.Done);
        setButtonText("Back to Wallet");
        channel.unsubscribe();
        setSyncPieces(null);
        setTotalSteps(0);
        break;
      }
      case EnumProgress.Done: {
        router.push("../wallet");
        break;
      }
      default: {
        break;
      }
    }
  }

  async function generateSyncPieces(): Promise<string[] | null> {
    console.log("Starting sync generator....");
    if (!authUser) return null;
    console.log("Generating sync pieces....");
    setIsLoading(true);
    const newPieces = await createVaultPieces(authUser);
    // ensure sync pieces are available
    if (!newPieces) {
      setProgressEnum(EnumProgress.Error);
      setProgressPercent(0);
      return null;
    }
    // update progress state
    const newProgressPercent = 1 / (newPieces.length + 2);
    setProgressPercent(newProgressPercent);
    setProgressEnum(EnumProgress.ShowCode);
    // set initial qr code
    setQrText(newPieces[0]);
    setButtonText("Next");
    setIsLoading(false);
    setSyncPieces(newPieces);
    return newPieces;
  }

  useEffect(() => {
    if (!syncPieces) {
      setTotalSteps(0);
      return;
    }
    // total steps = number of sync pieces + 1 for start + 1 for validation
    setTotalSteps(syncPieces.length + 1 + 1);
  }, [syncPieces]);

  useEffect(() => {
    // Create channels with the same name for both the broadcasting and receiving clients.
    const newChannel = supabase.channel(`sync:${authUser?.uid}`);
    // Register your client with the server
    newChannel
      // subscribe to scan messages
      .on("broadcast", { event: "scan" }, (data) => {
        console.log("Scan channel payload:");
        console.log(data);
        console.log("setting index....");
        setMostRecentPayload(data);
        setSyncPieceIndex(data.payload.newScanIndex);
      })
      .subscribe((status) => {
        console.log("subscription status distributor::");
        console.log(status);
        if (status === "SUBSCRIBED") {
          // console.log("Subscribed to sync channel.");
        }
      });
    setChannel(newChannel);
  }, []);

  useEffect(() => {
    if (progressEnum == EnumProgress.ShowCode) {
      console.log("RUNNING USE EFFECT BASED ON INDEX");
      incrementProgress();
    }
  }, [syncPieceIndex]);

  return (
    <SyncCard
      title={"Add New Device"}
      progressPercent={progressPercent}
      isLoading={isLoading}
    >
      <div className="text-gray-800 dark:text-gray-200 text-xl">
        {/* start */}
        {progressEnum == EnumProgress.Start && (
          <div className="flex flex-col">
            <p>
              Add your wallet to a new device. This will take around 60 seconds.
            </p>
          </div>
        )}
        {/* qr code */}
        {progressEnum == EnumProgress.ShowCode && (
          <div className="flex flex-col space-y-2">
            <div className="flex">
              <div className="flex-1" />
              <div className="flex-2 mx-auto">
                <Canvas
                  text={qrText}
                  options={{
                    level: "L",
                    margin: 2,
                    scale: 5,
                    width: 300,
                    color: {
                      dark: "#000000",
                      light: "#FFFFFF",
                    },
                  }}
                />
                <p className="text-sm text-blue-500 mt-4">
                  Scanned {syncPieceIndex} codes.
                </p>
              </div>
              <div className="flex-1" />
            </div>
            <p className="text-lg">Scan with new device.</p>
          </div>
        )}
        {/* validate */}
        {progressEnum == EnumProgress.Validate && (
          <div className="flex flex-col space-y-2">
            <p className="font-bold text-2xl">Validate</p>
            <p>Ensure code matches on both devices.</p>
            <p className="text-sky-400 font-bold text-3xl text-center">
              {validationCode}
            </p>
          </div>
        )}
        {/* done */}
        {progressEnum == EnumProgress.Done && (
          <div className="flex flex-col">
            <p className="text-green-500">Sync completed!</p>
            <p>You can now use your wallet from both devices.</p>
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
        {progressEnum != EnumProgress.ShowCode && (
          <div className="mt-8">
            <ButtonSync
              clickHandler={incrementProgress}
              text={buttonText}
              color={buttonColor}
              isDisabled={isLoading}
              isLoading={isLoading}
            />
          </div>
        )}
      </div>
    </SyncCard>
  );
};

export default Distributor;
