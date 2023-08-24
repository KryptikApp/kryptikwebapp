import { NextApiRequest, NextApiResponse } from "next";
import { ETHERSCAN_API_URL } from "../../../src/constants/explorers";
import { defaultKryptikProvider } from "../../../src/services/models/provider";
import { ETH_NUM_BLOCKS_PER_HOUR } from "../../../src/constants/evmConstants";
import { KryptikFetch } from "../../../src/kryptikFetch";
import { updateAllAppContracts } from "../../../prisma/script";
import { getAllFormattedContracts } from "./all";

type Data = {
  msg?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    const apiKey = process.env.ETHERSCAN_API_KEY;
    const ethProvider = defaultKryptikProvider.ethProvider;
    if (!ethProvider) throw new Error("No ethProvider found.");
    const allContracts = await getAllFormattedContracts();
    const currBlock = await ethProvider.getBlockNumber();
    const startBlock = currBlock - ETH_NUM_BLOCKS_PER_HOUR;
    for (const contract of allContracts) {
      const apiURL = `${ETHERSCAN_API_URL}?module=account&action=txlist&address=${contract.address}&page=1&offset=300&startblock=${startBlock}&endblock=${currBlock}&sort=desc&apikey=${apiKey}`;
      const response = await KryptikFetch(apiURL, {});
      const data = await response.data.result;
      // check if data is string and includes error
      if (typeof data === "string" && data.includes("Error")) {
        throw new Error(data);
      }
      let txCount = 0;
      for (const tx of data) {
        txCount++;
      }
      // update contracts in place
      contract.stats = {
        totalTransactionsLastHour: txCount,
        lastBlockChecked: currBlock,
        updatedAt: Date.now(),
      };
    }
    // UPDATE DB STORE
    await updateAllAppContracts(allContracts);
    return res.status(200).json({ msg: "Contracts have been updated." });
  } catch (e: any) {
    return res.status(400).json({ msg: `${e.message}` });
  }
}

export async function getNumTxLastHour() {}
