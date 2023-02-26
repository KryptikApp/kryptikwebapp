import { TempSyncKey } from "@prisma/client";
import HDSeedLoop, { NetworkFromTicker } from "hdseedloop";
import { createShareOnDb, getRemoteShare } from "../../helpers/shares";
import { createTempSyncKey, getTempSyncKey } from "../../helpers/sync";
import { splitString } from "../../helpers/utils";
import { IWallet } from "../../models/KryptikWallet";
import { UserDB } from "../../models/user";
import { createHashCode, decryptText, encryptText } from "../crypto";
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

  const maxStringSize: number = 50;
  const seedloopString: string = vaultContents.vault.seedloopSerlializedCipher;
  console.log("SEEDLOP STRING:");
  console.log(seedloopString);
  console.log("Share string unencrypted");
  console.log(vaultContents.remoteShare2);
  //create temporary encryption key
  const tempKey: TempSyncKey | null = await createTempSyncKey();
  if (!tempKey) {
    console.warn("Unable to create temp sync key with the given id.");
    return null;
  }
  // encrypt new share
  const shareString: string = encryptText(
    tempKey,
    vaultContents.remoteShare2
  ).ciphertext;
  const shareStringDecrypted: string = decryptText(
    tempKey,
    shareString
  ).plaintext;
  console.log("Share string decrypted on sync generate:");
  console.log(shareStringDecrypted);
  console.log("Share string encrypted on sync generate:");
  console.log(shareString);
  if (shareStringDecrypted != vaultContents.remoteShare2) {
    throw new Error("Decrypted share does not match plaintext.");
  }
  // compute number of peces from each string
  const numSharePieces: number = Math.ceil(shareString.length / maxStringSize);
  const numSeedloopPieces: number = Math.ceil(
    seedloopString.length / maxStringSize
  );
  const totalToPair: number = numSharePieces + numSeedloopPieces;
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
    index += 1;
    // add to result
    piecesToReturn.push(stringifySyncPiece(sharePiece));
  }
  // encrypt seedloop pieces
  for (const seedloopSubString of seedloopStrings) {
    const seedloopPiece: ISyncPiece = {
      data: seedloopSubString,
      order: index,
      type: "seedloopSerializedCipher",
    };
    // uncomment to encrypt data with temp sync key
    // seedloopPiece.data = encryptText(tempKey, seedloopSubString).ciphertext;
    index += 1;
    // add to result
    piecesToReturn.push(stringifySyncPiece(seedloopPiece));
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
  let lastSharePieceIndex: number = -1;
  let lastSeedloopPieceIndex: number = -1;
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
  console.log("Sync pieces:");
  console.log(syncPieces);
  // match pieces
  for (const piece of syncPieces) {
    console.log("processing");
    console.log(piece);
    switch (piece.type) {
      case "share": {
        // ensure order safety
        // if (piece.order < lastSharePieceIndex) {
        //   throw new Error("Share sync pieces out of order.");
        // }
        shareCypherText = shareCypherText.concat(piece.data);
        lastSharePieceIndex += 1;
        break;
      }
      case "seedloopSerializedCipher": {
        // ensure order safety
        // if (piece.order < lastSeedloopPieceIndex) {
        //   throw new Error("Seedloop sync pieces out of order.");
        // }
        seedloopCypherText = seedloopCypherText.concat(piece.data);
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
  let sharePlainText = "";
  try {
    // decrypt seedloop piece
    sharePlainText = decryptText(decryptionKey, shareCypherText).plaintext;
  } catch (e) {
    throw new Error("Unable to decrypt sync strings.");
  }
  // create vault
  const remoteShare: string | null = await getRemoteShare();
  // TODO: add ability to fetch share directly from distributor
  if (!remoteShare) {
    throw new Error("Unable to fetch remote share.");
  }
  //create vault
  const vaultName = createVaultName(uid);
  console.log("__________");
  console.log("seedloop string");
  console.log(seedloopCypherText);
  console.log("Share string unencrypted");
  console.log(sharePlainText);
  console.log("Share string encrypted");
  console.log(shareCypherText);
  console.log("__________");

  const newVault: VaultContents = {
    seedloopSerlializedCipher: seedloopCypherText,
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
    console.log(e);
    throw new Error("Unable to recover seedloop from vault.");
  }
}

export function createValidationCode(seedLoop: HDSeedLoop): string {
  const ethNetwork = NetworkFromTicker("eth");
  return seedLoop.getAddresses(ethNetwork)[0].slice(-5);
}

const HASHCODE_DELIMITER: string = "|HC|";

export function appendHashCode(str: string): string {
  const hashCode = createHashCode(str);
  return str + HASHCODE_DELIMITER + hashCode.toString();
}

interface IHahCodeParsed {
  data: string;
  hashCode: string;
}
export function parseHashCode(str: string): IHahCodeParsed | null {
  try {
    const splitString: string[] = str.split(HASHCODE_DELIMITER);
    return { hashCode: splitString[1], data: splitString[0] };
  } catch (e) {
    return null;
  }
}
