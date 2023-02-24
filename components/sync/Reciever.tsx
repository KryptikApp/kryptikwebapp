import { RealtimeChannel } from "@supabase/supabase-js";
import HDSeedLoop from "hdseedloop";
import { NextPage } from "next";
import { toast } from "react-hot-toast";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { assembleVault, createValidationCode } from "../../src/handlers/sync";
import { supabase } from "../../src/helpers/supabaseHelper";
import { ColorEnum } from "../../src/helpers/utils";
import { WalletStatus } from "../../src/models/KryptikWallet";
import ButtonSync from "../buttons/ButtonSync";
import { useKryptikAuthContext } from "../KryptikAuthProvider";
import KryptikScanner from "../kryptikScanner";
import SyncCard from "./SyncCard";
import { createHashCode } from "../../src/handlers/crypto";

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
  const [isLoading, setIsLoading] = useState(false);
  const [totalSteps, setTotalSteps] = useState(0);
  const [validationCode, setValidationCode] = useState("");
  const [stopScanRequested, setStopScanRequested] = useState(false);
  const [validationDone, setValidationDone] = useState(false);
  const [recoveredSeedloop, setRecoveredSeedloop] =
    useState<HDSeedLoop | null>();
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [lastScanText, setLastScanText] = useState("");
  // const [indexToShow, setIndexToShow] = useState(0);

  // let syncPieceIndex = 0;

  /** Ensure sync action is allowed. */
  function isSyncSafe(): boolean {
    if (walletStatus == WalletStatus.OutOfSync) {
      return true;
    }
    return false;
  }

  async function broadcastScan(hashCode: number) {
    if (!channel) return;
    const res = await channel.send({
      type: "broadcast",
      event: "scan",
      payload: { hashCode: hashCode },
    });
  }

  async function assembleWallet() {
    setIsLoading(true);
    setProgressEnum(EnumProgress.Validate);
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
      console.error(e);
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
        setSyncPieces([]);
        break;
      }
      case EnumProgress.ShowCode: {
        if (syncPieces == null) {
          setProgressEnum(EnumProgress.Error);
          setErrorText("Unable to scan. Missing pieces array.");
          return;
        }
        if (uri === undefined) {
          setProgressEnum(EnumProgress.Error);
          setErrorText("Unable to scan. Expected uri on callback.");
          return;
        }
        if (uri == lastScanText) {
          return;
        }
        // const newIndex = syncPieceIndex + 1;
        const hashCode: number = createHashCode(uri);
        // indicate we can show new code
        syncPieces.push(uri);
        broadcastScan(hashCode).then(() => {
          console.log(`Scan message sent with hash code: ${hashCode}`);
        });
        setLastScanText(uri);
        // syncPieceIndex = newIndex;
        // setIndexToShow(syncPieceIndex);
        break;
      }
      case EnumProgress.Validate: {
        if (!recoveredSeedloop) {
          setProgressEnum(EnumProgress.Error);
          setErrorText("Unable to update wallet. Seedloop missing.");
          return;
        }
        updateWallet(recoveredSeedloop);
        toast.success("Sync completed.");
        router.push("../");
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
    console.log("Canceling sync. User initiated.");
    setSyncPieces([]);
    setButtonText("Start");
    // syncPieceIndex = 0;
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

  useEffect(() => {
    // Create channels with the same name for both the broadcasting and receiving clients.
    const newChannel = supabase.channel(`sync:${authUser?.uid}`);
    // Subscribe registers your client with the server
    newChannel
      // Listen to validation messages.
      .on("broadcast", { event: "validation" }, (data) => {
        if (data.payload.isValidated == true) {
          setValidationDone(true);
        }
      })
      // Listen to stop scanning messages.
      .on("broadcast", { event: "stopScanning" }, (data) => {
        console.log("Stop scanning message:");
        console.log(data);
        setStopScanRequested(true);
      })
      .subscribe((status) => {
        console.log("subscription status receiver:");
        console.log(status);
        if (status === "SUBSCRIBED") {
          // console.log("Subscribed to sync channel.");
        }
      });
    setChannel(newChannel);
  }, []);

  useEffect(() => {
    if (validationDone) {
      incrementProgress();
    }
  }, [validationDone]);
  useEffect(() => {
    if (stopScanRequested) {
      assembleWallet();
      setButtonText("Validate");
    }
  }, [stopScanRequested]);

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
          <div>
            <div className="flex">
              <div className="flex-1" />
              <div className="flex-2">
                <KryptikScanner
                  show={progressEnum == EnumProgress.ShowCode}
                  onScan={incrementProgress}
                />
                {/* <p className="text-sm text-sky-500 mt-4">
                  Scanned {indexToShow} codes.
                </p> */}
              </div>
              <div className="flex-1" />
            </div>
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
                <p className="text-sky-400 text-3xl fontbold text-center">
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
        {/* done */}
        {progressEnum == EnumProgress.Done && (
          <div className="flex flex-col">
            <p className="text-green-500">Sync completed!</p>
            <p>You can now use your wallet from this device.</p>
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
