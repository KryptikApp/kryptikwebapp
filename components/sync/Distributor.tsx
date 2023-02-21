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
  const [qrText, setQrText] = useState("");
  const { Canvas } = useQRCode();

  // Create channels with the same name for both the broadcasting and receiving clients.
  const channel = supabase.channel(`sync:${authUser?.uid}`);

  // Register your client with the server
  channel
    // subscribe to scan messages
    .on("broadcast", { event: "scan" }, (payload) => {
      if (payload.newScanIndex && typeof (payload.newScanIndex == "number")) {
        setSyncPieceIndex(payload.newScanIndex);
      }
    })
    .subscribe((status) => {
      if (status === "SUBSCRIBED") {
        // console.log("Subscribed to sync channel.");
      }
    });

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
      console.log("hereee");
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

  function incrementProgress() {
    const isSafe: boolean = isSyncSafe();
    if (!isSafe) {
      setProgressEnum(EnumProgress.Error);
      setProgressPercent(0);
      return;
    }
    switch (progressEnum) {
      case EnumProgress.Start: {
        generateSyncPieces();
        break;
      }
      case EnumProgress.ShowCode: {
        // ensure sync pieces are available
        if (!syncPieces) {
          setProgressEnum(EnumProgress.Error);
          setProgressPercent(0);
          return;
        }
        const newIndex = syncPieceIndex + 1;
        if (newIndex == syncPieces.length) {
          console.log("matched!!!");
          // move onto validation
          setProgressEnum(EnumProgress.Validate);
          // generate validation code
          const newValidationCode = createValidationCode(
            kryptikWallet.seedLoop
          );
          setValidationCode(newValidationCode);
          setButtonText("Validate");
          channel.send({
            type: "broadcast",
            event: "stopScanning",
            payload: { stopScanning: true },
          });
        } else {
          setProgressEnum(EnumProgress.ShowCode);
          console.log("hereee");
          setQrText(syncPieces[newIndex]);
          // show next code
          setButtonText("Next");
        }
        // update progress/step indicators
        const newProgressPercent = ((1 + newIndex) / totalSteps) * 100;
        setProgressPercent(newProgressPercent);
        setSyncPieceIndex(newIndex);
        break;
      }
      case EnumProgress.Validate: {
        // indicate done
        channel.send({
          type: "broadcast",
          event: "validation",
          payload: { isValidated: true },
        });
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
    // if error, progress should be zero
    if (progressEnum == EnumProgress.Error) {
      setProgressPercent(0);
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
      console.log("hereeee");
      setProgressEnum(EnumProgress.Error);
      setProgressPercent(0);
      return null;
    }
    // update progress state
    const newProgressPercent = (1 / newPieces.length) * 100;
    setProgressPercent(newProgressPercent);
    setProgressEnum(EnumProgress.ShowCode);
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
    console.log("TOTAL STEPS:");
    console.log(syncPieces.length + 1 + 1);
  }, [syncPieces]);

  useEffect(() => {
    // pass for now
  }, []);

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
        <div className="mt-8">
          <ButtonSync
            clickHandler={incrementProgress}
            text={buttonText}
            color={buttonColor}
            isDisabled={isLoading}
            isLoading={isLoading}
          />
        </div>
      </div>
    </SyncCard>
  );
};

export default Distributor;
