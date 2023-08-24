import { NextApiRequest, NextApiResponse } from "next";
import { CONTRACT_LIST } from "../../../src/contracts/list";
import { AddAppContractsToDb } from "../../../prisma/script";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const contractsToAdd = CONTRACT_LIST;
    const result = await AddAppContractsToDb(contractsToAdd);
    return res.status(200).json({ msg: "Contracts have been added." });
  } catch (e: any) {
    return res.status(400).json({ msg: `${e.message}` });
  }
}
