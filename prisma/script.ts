import {
  BlockchainAccount,
  OneTimeToken,
  Price,
  PrismaClient,
  Profile,
  User,
} from "@prisma/client";
import { Console } from "console";
import { add } from "date-fns";
import { BlockchainAccountDb } from "../src/helpers/accounts";
import hashToken from "../src/helpers/auth/hashtoken";
import { generateCode } from "../src/helpers/auth/jwt";

const prisma = new PrismaClient();

export async function findUserByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({
    where: {
      email: email,
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

export async function validateUserOneTimeCode(id: string, code: string) {
  const tokens: OneTimeToken[] = await prisma.oneTimeToken.findMany({
    where: { userId: id },
  });
  console.log(tokens);
  console.log(id);
  console.log(code);
  const currentDate: Date = new Date();
  // TODO: UPDATE SO WE DON'T CYCLE THROUGH ALL CODES
  for (const token of tokens) {
    if (token.expiration > currentDate && code == token.code) {
      console.log("Heyyyy!");
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
  return prisma.remoteShare.create({
    data: { share: newShare, userId: userId },
  });
}
export type ProfileInfo = { name?: string; bio?: string; avatarPath?: string };
export function updateProfileByUserId(
  newProfileInfo: ProfileInfo,
  userId: string
) {
  prisma.profile.update({
    where: {
      userId: userId,
    },
    data: {
      name: newProfileInfo.name,
      bio: newProfileInfo.bio,
      avatarPath: newProfileInfo.avatarPath,
    },
  });
}

const EmailTokenExpirationMinutes = 10;

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

export async function deleteBlockChainAccountByUserId(
  userId: string
): Promise<boolean> {
  try {
    await prisma.blockchainAccount.delete({ where: { userId: userId } });
    return true;
  } catch (e) {
    return false;
  }
}

export async function addBlockChainAccountByUserId(
  blockchainAccount: BlockchainAccountDb,
  userId: string
): Promise<boolean> {
  try {
    const newAcccount: BlockchainAccount =
      await prisma.blockchainAccount.create({
        data: {
          evmAddress: blockchainAccount.evmAddress,
          nearAddress: blockchainAccount.nearAddress,
          solAddress: blockchainAccount.solAddress,
          userId: userId,
        },
      });
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
}

export async function getBlockchainAccountByEmail(
  email: string
): Promise<BlockchainAccount | null> {
  try {
    const res = await prisma.user.findFirst({
      where: { email: email },
      include: { blockchainAccount: true },
    });
    if (!res || !res.blockchainAccount) {
      throw new Error("unable to find blockchain account.");
    }
    return res.blockchainAccount;
  } catch (e) {
    return null;
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
