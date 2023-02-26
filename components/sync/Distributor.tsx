import { RealtimeChannel } from "@supabase/supabase-js";
import QRCodeStyling, { Options } from "qr-code-styling";
import { NextPage } from "next";
import { useQRCode } from "next-qrcode";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { createHashCode } from "../../src/handlers/crypto";
import {
  appendHashCode,
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
  const [newCodeRequested, setNewCodeRequested] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [totalSteps, setTotalSteps] = useState(0);
  const [validationCode, setValidationCode] = useState("");
  const [mostRecentPayload, setMostRecentPayload] =
    useState<RealTimePayload | null>(null);
  const [qrText, setQrText] = useState("");
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  const [qrOptions, setQrOptions] = useState<Options>({
    width: 300,
    height: 300,
    type: "svg",
    data: qrText,
    dotsOptions: {
      gradient: {
        type: "radial",
        colorStops: [
          { offset: 0, color: "#28C2F6" },
          { offset: 1, color: "#000000" },
        ],
      },
      type: "dots",
    },
    cornersSquareOptions: {
      color: "black",
      type: "extra-rounded",
    },
    backgroundOptions: {
      color: "#e9ebee",
    },
    imageOptions: {
      crossOrigin: "anonymous",
    },
  });

  const useQRCodeStyling = (options: Options): QRCodeStyling | null => {
    //Only do this on the client
    if (typeof window !== "undefined") {
      /* eslint-disable */
      const QRCodeStylingLib = require("qr-code-styling");
      /* eslint-disable */
      const qrCodeStyling: QRCodeStyling = new QRCodeStylingLib(options);
      return qrCodeStyling;
    }
    return null;
  };

  const [qrCode] = useState<QRCodeStyling | null>(useQRCodeStyling(qrOptions));
  const qrRef = useRef<HTMLDivElement>(null);

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
    setButtonText("Start");
    setSyncPieceIndex(0);
    setProgressEnum(EnumProgress.Start);
    setProgressPercent(0);
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
        // gnerate sync pieces
        generateSyncPieces();
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
          const newQrText = appendHashCode(syncPieces[newIndex]);
          console.log(newQrText);
          // ensure new code has text
          if (newQrText == "") {
            console.warn("empty qr text.");
            setProgressEnum(EnumProgress.Error);
            setErrorText("Unable to sync. Empty qr code text.");
            return;
          }
          qrCode?.update({ data: newQrText });
          setQrText(newQrText);
          // button should display 'next'
          setButtonText("Next");
        }
        setSyncPieceIndex(newIndex);
        setProgressPercent(((newIndex + 1) / totalSteps) * 100);
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

  /** Generates sync pieces and updates state. Reuses saved pieces if available. */
  async function generateSyncPieces(): Promise<string[] | null> {
    console.log("Starting sync generator....");
    if (!authUser) return null;
    console.log("Generating sync pieces....");
    setIsLoading(true);
    let newPieces;
    if (syncPieces) {
      newPieces = syncPieces;
    } else {
      newPieces = await createVaultPieces(authUser);
    }
    // ensure sync pieces are available
    if (!newPieces) {
      setProgressEnum(EnumProgress.Error);
      setProgressPercent(0);
      return null;
    }
    // update progress state
    const newProgressPercent = (1 / (newPieces.length + 2)) * 100;
    setProgressPercent(newProgressPercent);
    setProgressEnum(EnumProgress.ShowCode);
    // set initial qr code
    const newQrText = appendHashCode(newPieces[0]);
    qrCode?.update({ data: newQrText });
    setQrText(newQrText);
    setButtonText("Next");
    setIsLoading(false);
    if (!syncPieces) {
      setSyncPieces(newPieces);
    }
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
    if (qrRef.current) {
      qrCode?.append(qrRef.current);
    }
  }, [qrCode, qrRef]);

  useEffect(() => {
    if (progressEnum == EnumProgress.ShowCode) {
      incrementProgress();
    }
  }, [syncPieceIndex]);

  useEffect(() => {
    if (!mostRecentPayload || !syncPieces) return;
    const receiverHashCode = mostRecentPayload.payload.hashCode;
    const currHashCode = createHashCode(syncPieces[syncPieceIndex]);
    if (receiverHashCode == currHashCode) {
      console.log("Hash codes matched....");
      setSyncPieceIndex(syncPieceIndex + 1);
    } else {
      console.log("Hash codes did not match");
    }
  }, [mostRecentPayload]);

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
        <div
          className={`flex flex-col space-y-2 ${
            progressEnum == EnumProgress.ShowCode ? "" : "hidden"
          }`}
        >
          <div className="flex">
            <div className="flex-1" />
            <div className="flex-2 mx-auto">
              <div className="rounded rounded-lg bg-sky-400 p-2">
                <div ref={qrRef} />
              </div>

              <p className="text-sm text-sky-500 mt-4">
                Scanned {syncPieceIndex} codes.
              </p>
              <p className="text-lg">Scan with new device.</p>
            </div>
            <div className="flex-1" />
          </div>
        </div>
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
              className="text-center text-md hover:cursor-pointer text-gray-400 dark:text-gray-500 mt-4 hover:text-red-500 dark:hover:text-red-500"
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
