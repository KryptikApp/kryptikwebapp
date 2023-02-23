import { TempSyncKey } from "@prisma/client";
import crypto from "crypto";

const algo: string = "aes-256-gcm";

export function encryptText(
  syncKey: TempSyncKey,
  text: string
): {
  ciphertext: string;
} {
  // create iv and cipher object
  const iv = Buffer.from(syncKey.iv, "hex");
  const key = Buffer.from(syncKey.key, "hex");
  const cipher = crypto.createCipheriv(algo, key, iv);
  // encrypt text and save as hex string
  const ciphertextBuffer = cipher.update(text);
  const ciphertext: string = ciphertextBuffer.toString("hex");
  return { ciphertext: ciphertext };
}

export function decryptText(
  syncKey: TempSyncKey,
  ciphertext: string
): { plaintext: string } {
  // transform text, pword, and iv into buffers
  const iv = Buffer.from(syncKey.iv, "hex");
  const encryptedBuffer = Buffer.from(ciphertext, "hex");
  const key = Buffer.from(syncKey.key, "hex");
  const decipher = crypto.createDecipheriv(algo, key, iv);
  // decipher message
  const plaintextBuffer: Buffer = decipher.update(encryptedBuffer);
  // save as readable string
  const plaintext: string = plaintextBuffer.toString("utf-8");
  return { plaintext: plaintext };
}

export interface IAesKey {
  keyString: string;
  ivString: string;
}

export function createAesKeyAndIv(): IAesKey {
  const iv = crypto.randomBytes(16);
  const ivString = iv.toString("hex");
  const key = crypto.randomBytes(32);
  const keyString = key.toString("hex");
  const result: IAesKey = {
    keyString: keyString,
    ivString: ivString,
  };
  return result;
}
