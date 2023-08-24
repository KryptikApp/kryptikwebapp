import { NextApiRequest, NextApiResponse } from "next";
import { IContract, contractFromDb } from "../../../src/contracts/types";
import { getAllAppContracts } from "../../../prisma/script";

type Data = {
  contracts: IContract[] | null;
  msg?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    const contracts = await getAllFormattedContracts();
    return res
      .status(200)
      .json({ contracts: contracts, msg: "Contracts have been updated." });
  } catch (e: any) {
    return res.status(400).json({ contracts: null, msg: `${e.message}` });
  }
}

export async function getAllFormattedContracts() {
  const allContracts = await getAllAppContracts();
  // convert to ICOntract
  const contracts: IContract[] = [];
  for (const contract of allContracts) {
    contracts.push(contractFromDb(contract));
  }
  return contracts;
}
