import { TempSyncKey } from "@prisma/client";
import HDSeedLoop, { NetworkFromTicker } from "hdseedloop";
import { createShareOnDb, getRemoteShare } from "../../helpers/shares";
import { createTempSyncKey, getTempSyncKey } from "../../helpers/sync";
import { splitString } from "../../helpers/utils";
import { IWallet } from "../../models/KryptikWallet";
import { UserDB } from "../../models/user";
import { decryptText, encryptText } from "../crypto";
import {
  createVault,
  createVaultName,
  unlockVault,
  updateVaultName,
  VaultAndShares,
  VaultContents,
  vaultExists,
} from "../wallet/vaultHandler";
import { ISyncPiece, stringifySyncPiece } from "./types";

export async function createVaultPieces(
  user: UserDB
): Promise<string[] | null> {
  // migrate legacy vault versions
  updateVaultName(user);
  const uid: string = user.uid;
  // fetch and unlock vault
  const remoteShare: string | null = await getRemoteShare();
  if (!remoteShare) {
    console.warn("Unable to get remote share when creating pieces for sync.");
    return null;
  }
  // fetch local vault
  const seedloop: HDSeedLoop | null = unlockVault(uid, remoteShare);
  if (!seedloop) {
    console.warn("Unable to fetch local vault.");
    return null;
  }
  // replace old vault with new
  let vaultContents: VaultAndShares | null = null;
  try {
    vaultContents = createVault(seedloop, uid);
    if (!vaultContents) {
      console.warn("no vault contentsss");
      throw new Error("No object returned by create vault.");
    }
  } catch (e) {
    console.warn(e);
    console.warn("Unable to create new vault.");
    return null;
  }
  // update server share
  await createShareOnDb(vaultContents.remoteShare1);
  const piecesToReturn: string[] = [];

  const maxStringSize: number = 200;
  const seedloopString: string = vaultContents.vault.seedloopSerlializedCipher;
  const shareString: string = vaultContents.remoteShare2;
  // compute number of peces from each string
  const numSharePieces: number = Math.ceil(shareString.length / maxStringSize);
  const numSeedloopPieces: number = Math.ceil(
    seedloopString.length / maxStringSize
  );
  // create encryption key
  const totalToPair: number = numSharePieces + numSeedloopPieces;
  const tempKey: TempSyncKey | null = await createTempSyncKey(totalToPair);
  if (!tempKey) {
    console.warn("Unable to create temp sync key with the given id.");
    return null;
  }

  const shareStrings: string[] = splitString(shareString, maxStringSize);
  const seedloopStrings: string[] = splitString(seedloopString, maxStringSize);

  let index: number = 0;
  // encrypt share pieces
  for (const shareSubString of shareStrings) {
    const sharePiece: ISyncPiece = {
      data: shareSubString,
      order: index,
      type: "share",
    };
    // encrypt share
    const sharePieceEncrypted: string = encryptText(
      tempKey,
      stringifySyncPiece(sharePiece)
    ).ciphertext;
    index += 1;
    // add to result
    piecesToReturn.push(sharePieceEncrypted);
  }
  // encrypt seedloop pieces
  for (const seedloopSubString of seedloopStrings) {
    const seedloopPiece: ISyncPiece = {
      data: seedloopSubString,
      order: index,
      type: "seedloopSerializedCipher",
    };
    // encrypt share
    const sharePieceEncrypted: string = encryptText(
      tempKey,
      stringifySyncPiece(seedloopPiece)
    ).ciphertext;
    index += 1;
    // add to result
    piecesToReturn.push(sharePieceEncrypted);
  }
  // ensure return array length matches expected length
  if (piecesToReturn.length != totalToPair) {
    throw new Error(
      `Expected ${totalToPair} pair pieces. Generated ${piecesToReturn.length}.`
    );
  }
  //return pieces
  return piecesToReturn;
}
/** Creates and save a wallet vault from provided sync pieces. Returns the reassembled seedloop. */
export async function assembleVault(
  user: UserDB,
  stringPieces: string[]
): Promise<HDSeedLoop> {
  const uid: string = user.uid;
  if (vaultExists(uid)) {
    throw new Error("Vault already exists on device.");
  }
  const syncPieces: ISyncPiece[] = stringPieces.map((p) => JSON.parse(p));
  if (
    syncPieces.length == 0 ||
    !syncPieces[0].data ||
    typeof syncPieces[0].data != "string"
  ) {
    throw new Error("Unable to parse sync pieces.");
  }
  let shareCypherText: string = "";
  let seedloopCypherText: string = "";
  let lastSharePieceIndex: number = 0;
  let lastSeedloopPieceIndex: number = 0;
  // ensure pieces are sorted in ascending order
  syncPieces.sort((a, b) => {
    if (a.order < b.order) {
      return -1;
    }
    if (a.order > b.order) {
      return 1;
    }
    return 0;
  });
  // match pieces
  for (const piece of syncPieces) {
    switch (piece.type) {
      case "share": {
        // ensure order safety
        if (piece.order < lastSharePieceIndex) {
          throw new Error("Share sync pieces out of order.");
        }
        shareCypherText.concat(piece.data);
        lastSharePieceIndex += 1;
        break;
      }
      case "seedloopSerializedCipher": {
        // ensure order safety
        if (piece.order < lastSeedloopPieceIndex) {
          throw new Error("Seedloop sync pieces out of order.");
        }
        seedloopCypherText.concat(piece.data);
        lastSeedloopPieceIndex += 1;
        break;
      }
      default: {
        throw new Error("Unexpected sync piece type.");
      }
    }
  }
  // get decryption key
  const decryptionKey: TempSyncKey | null = await getTempSyncKey();
  if (!decryptionKey) {
    throw new Error("Unable to fetch decryption key.");
  }
  let seedloopPlainText = "";
  let sharePlainText = "";
  try {
    // decrypt seedloop ciphertext piece
    seedloopPlainText = decryptText(
      decryptionKey,
      seedloopCypherText
    ).plaintext;
    // decrypt seedloop piece
    sharePlainText = decryptText(decryptionKey, shareCypherText).plaintext;
  } catch (e) {
    throw new Error("Unable to decrypt sync strings");
  }
  // create vault
  const remoteShare: string | null = await getRemoteShare();
  // TODO: add ability to fetch share directly from distributor
  if (!remoteShare) {
    throw new Error("Unable to fetch remote share.");
  }
  //create vault
  const vaultName = createVaultName(uid);
  const newVault: VaultContents = {
    seedloopSerlializedCipher: seedloopPlainText,
    vaultVersion: 0,
    localShare: sharePlainText,
    createdTime: Date.now(),
    lastUnlockTime: 0,
    uid: uid,
    check: "valid",
  };
  // save vault
  localStorage.setItem(vaultName, JSON.stringify(newVault));
  try {
    const seedloop: HDSeedLoop | null = unlockVault(uid, remoteShare);
    if (!seedloop) throw new Error();
    return seedloop;
  } catch (e) {
    throw new Error("Unable to recover seedloop from vault.");
  }
}

export function createValidationCode(seedLoop: HDSeedLoop): string {
  const ethNetwork = NetworkFromTicker("eth");
  return seedLoop.getAddresses(ethNetwork)[0].slice(-5);
}
