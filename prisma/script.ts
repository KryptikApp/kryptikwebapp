import {
  Authenticator,
  AuthenticatorChallenge,
  BlockchainAccount,
  OneTimeToken,
  Price,
  PrismaClient,
  SyncSession,
  TempSyncKey,
  User,
} from "@prisma/client";
import { add } from "date-fns";
import { createAesKeyAndIv, IAesKey } from "../src/handlers/crypto";
import hashToken from "../src/helpers/auth/hashtoken";
import { generateCode } from "../src/helpers/auth/jwt";

const prisma = new PrismaClient();

const EmailTokenExpirationMinutes = 10;
const SyncKeyExpirationMinutes = 10;

export async function findUserByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({
    where: {
      email: email,
    },
  });
}

// save authentictor to db
export async function saveAuthenticator(
  authenticator: Authenticator
): Promise<Authenticator> {
  return prisma.authenticator.create({
    data: authenticator,
  });
}

export async function findAuthenticatorsByUserId(
  userId: string
): Promise<Authenticator[] | null> {
  return prisma.authenticator.findMany({
    where: {
      userId: userId,
    },
  });
}

export async function findAuthenticatorsByUserEmail(
  userId: string
): Promise<Authenticator[] | null> {
  return prisma.authenticator.findMany({
    where: {
      userId: userId,
    },
  });
}

export async function saveCurrentChallenge(
  challenge: string,
  userId: string
): Promise<AuthenticatorChallenge> {
  // upsert new challenege
  return prisma.authenticatorChallenge.upsert({
    where: {
      userId: userId,
    },
    update: {
      challenge: challenge,
    },
    create: {
      challenge: challenge,
      userId: userId,
    },
  });
}

export async function findCurrentChallenge(
  userId: string
): Promise<AuthenticatorChallenge | null> {
  return prisma.authenticatorChallenge.findUnique({
    where: {
      userId: userId,
    },
  });
}

export function findUserById(id: string) {
  return prisma.user.findUnique({
    where: {
      id,
    },
    include: {
      Profile: true,
      remoteShare: true,
    },
  });
}

export function findCodeByUserId(id: string) {
  //a
  return prisma.oneTimeToken.findFirst({
    where: {
      userId: id,
    },
  });
}

export async function findAuthenticatorById(authId: string) {
  return prisma.authenticator.findUnique({
    where: {
      credentialID: authId,
    },
    include: {
      User: true,
    },
  });
}

export async function validateUserOneTimeCode(id: string, code: string) {
  const tokens: OneTimeToken[] = await prisma.oneTimeToken.findMany({
    where: { userId: id },
  });
  const currentDate: Date = new Date();
  // TODO: UPDATE SO WE DON'T CYCLE THROUGH ALL CODES
  for (const token of tokens) {
    if (token.expiration > currentDate && code == token.code) {
      return true;
    }
  }
  return false;
}

/**
 * Create user with email
 */
export function createUserByEmail(email: string) {
  return prisma.user.create({
    data: { email: email },
  });
}

export function getShareByUserId(userId: string) {
  return prisma.remoteShare.findFirst({
    where: {
      userId: userId,
    },
  });
}

export function getAllNetworks() {
  return prisma.networkDb.findMany({});
}

export function getAllTokens() {
  return prisma.tokenDb.findMany({ include: { TokenContract: true } });
}

export function updateShareByUserId(newShare: string, userId: string) {
  return prisma.remoteShare.update({
    where: { userId: userId },
    data: { share: newShare },
  });
}

export function createShare(newShare: string, userId: string) {
  return prisma.remoteShare.upsert({
    where: { userId: userId },
    create: { share: newShare, userId: userId },
    update: { share: newShare, userId: userId },
  });
}
export type ProfileInfo = { name?: string; bio?: string; avatarPath?: string };
export async function updateProfileByUserId(
  newProfileInfo: ProfileInfo,
  userId: string
) {
  await prisma.profile.upsert({
    where: {
      userId: userId,
    },
    create: {
      name: newProfileInfo.name,
      bio: newProfileInfo.bio,
      avatarPath: newProfileInfo.avatarPath,
      userId: userId,
    },
    update: {
      name: newProfileInfo.name,
      bio: newProfileInfo.bio,
      avatarPath: newProfileInfo.avatarPath,
    },
  });
}

/**
 * Creates refresh token.
 */
export function addRefreshTokenToWhitelist(
  jti: any,
  refreshToken: any,
  userId: any
) {
  return prisma.refreshToken.create({
    data: {
      id: jti,
      hashedToken: hashToken(refreshToken),
      userId,
    },
  });
}

/**
 * Check if user is in db.
 */
export function findRefreshTokenById(id: string) {
  return prisma.refreshToken.findUnique({
    where: {
      id,
    },
  });
}

/**
 * Revoke refresh token.
 */
export function deleteRefreshToken(id: string) {
  return prisma.refreshToken.update({
    where: {
      id,
    },
    data: {
      revoked: true,
    },
  });
}

export function revokeTokens(userId: string) {
  return prisma.refreshToken.updateMany({
    where: {
      userId,
    },
    data: {
      revoked: true,
    },
  });
}

export async function createOneTimeToken(userId: string) {
  const tokenExpiration = add(new Date(), {
    minutes: EmailTokenExpirationMinutes,
  });
  const code: string = generateCode();
  // 👇 create a short lived token and update user or create if they don't exist
  const createdToken = await prisma.oneTimeToken.create({
    data: {
      code,
      expiration: tokenExpiration,
      userId: userId,
    },
  });
  return createdToken;
}

export async function findOrCreateUserByEmail(
  email: string
): Promise<User | null> {
  let existingUser: User | null = await findUserByEmail(email);
  // if user does not exist... create
  if (!existingUser) {
    existingUser = await createUserByEmail(email);
  }
  return existingUser;
}

/**Deletes user with the provided id. UIser must be loged in. Returns true if succesful. */
export async function deleteUserById(id: string): Promise<boolean> {
  try {
    await prisma.user.delete({ where: { id: id } });
    return true;
  } catch (e) {
    return false;
  }
}

export async function allPrices(): Promise<Price[]> {
  try {
    const prices: Price[] = await prisma.price.findMany();
    if (!prices) {
      throw new Error("unable to fetch prices.");
    }
    return prices;
  } catch (e) {
    return [];
  }
}

export type PriceToUpload = {
  ticker: string;
  coinGeckoId: string;
  price: number;
};

export async function updatePrices(prices: PriceToUpload[]) {
  for (const price of prices) {
    try {
      await prisma.price.upsert({
        where: { ticker: price.ticker },
        create: price,
        update: price,
      });
    } catch (e) {
      // if fail to upsert one price.. keep trying with rest
      continue;
    }
  }
}

/** Find the sync key for a given user id.*/
export async function findSyncKeyByUserId(
  id: string
): Promise<TempSyncKey | null> {
  const tempKey = prisma.tempSyncKey.findUnique({ where: { userId: id } });
  return tempKey;
}

/** Updates or creates sync key via upsert */
export async function createSyncKeyByUserId(id: string): Promise<TempSyncKey> {
  const keyExpiration = add(new Date(), {
    minutes: SyncKeyExpirationMinutes,
  });
  const aesKey: IAesKey = createAesKeyAndIv();
  const keyToStore = {
    userId: id,
    key: aesKey.keyString,
    iv: aesKey.ivString,
    expiration: keyExpiration,
  };
  // update or create
  const keyResult = await prisma.tempSyncKey.upsert({
    where: { userId: id },
    create: keyToStore,
    update: keyToStore,
  });
  return keyResult;
}

/** Find the sync session for a given user id.*/
export async function findSyncSessionByUserId(
  id: string
): Promise<SyncSession | null> {
  const session = prisma.syncSession.findUnique({ where: { userId: id } });
  return session;
}

/** Updates or creates sync session via upsert */
export async function createSyncSessionByUserId(
  id: string,
  totalToPair: number
): Promise<SyncSession> {
  // default expiration to that of sync key
  const keyExpiration = add(new Date(), {
    minutes: SyncKeyExpirationMinutes,
  });
  const sessionToStore = {
    userId: id,
    expiration: keyExpiration,
    pairIndex: 0,
    totalToPair: totalToPair,
  };
  // update or create
  const keyResult = await prisma.syncSession.upsert({
    where: { userId: id },
    create: sessionToStore,
    update: sessionToStore,
  });
  return keyResult;
}

/** Validates temporary sync key. */
export function validateSyncKey(key: TempSyncKey) {
  const currentDate: Date = new Date();
  // ensure key is still valid
  if (key.expiration > currentDate) {
    return true;
  }
  return false;
}
