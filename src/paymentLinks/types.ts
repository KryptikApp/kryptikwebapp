import { PaymentLink } from "@prisma/client";

export type IPaymentLink = {
  id: number;
  createdAt: number;
  updatedAt: number;
  done: boolean;
  amountPerClaim: number;
  amountPerClaimUsd: number;
  networkTicker: string;
  title: string;
  maxClaims: number;
  claimCount: number;
  blockList: string[];
  description: string;
  backgroundImagePath: string;
  tokenImagePath: string;
  name: string;
};

export function convertPaymentLinkType(toConvert: any): IPaymentLink {
  return {
    id: toConvert.id,
    createdAt: toConvert.createdAt.getTime(),
    updatedAt: toConvert.updatedAt.getTime(),
    done: toConvert.done,
    amountPerClaim: toConvert.amountPerClaim,
    amountPerClaimUsd: toConvert.amountPerClaimUsd,
    networkTicker: toConvert.networkTicker,
    title: toConvert.title,
    maxClaims: toConvert.maxClaims,
    claimCount: toConvert.claimCount,
    blockList: toConvert.blockList,
    description: toConvert.description,
    backgroundImagePath: toConvert.backgroundImagePath,
    tokenImagePath: toConvert.tokenImagePath,
    name: toConvert.name,
  };
}
