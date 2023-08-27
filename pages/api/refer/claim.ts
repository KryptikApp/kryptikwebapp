import { NextApiRequest, NextApiResponse } from "next";

import { claimPaymentLink, getNetworkDbByTicker } from "../../../prisma/script";
import HDSeedLoop, { Network, defaultNetworks } from "hdseedloop";
import { IWallet, WalletStatus } from "../../../src/models/KryptikWallet";
import { defaultWallet } from "../../../src/models/defaultWallet";
import { BuildTransferTx } from "../../../src/handlers/wallet/transactions/transfer";
import {
  CreateTransferTransactionParameters,
  TransactionPublishedData,
} from "../../../src/services/models/transaction";
import {
  defaultBaseProvider,
  defaultKryptikProvider,
  defaultMaticProvider,
} from "../../../src/services/models/provider";

type Data = {
  msg?: string;
  txPubdata?: TransactionPublishedData;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const body = req.body;

  const claimCode: string = body.claimCode;
  let address: string = body.address;
  if (!claimCode || !address) {
    res.status(400).json({ msg: "Invalid request" });
    return;
  }
  try {
    const { paymentLink, success } = await claimPaymentLink(claimCode, address);
    if (!success || !paymentLink) {
      res.status(400).json({ msg: "Unable to claim payment link." });
      return;
    }
    const networkDb = await getNetworkDbByTicker(paymentLink.networkTicker);
    if (!networkDb) {
      res.status(400).json({ msg: "Unable to find network." });
      return;
    }
    const newSeedloop = new HDSeedLoop({
      mnemonic: process.env.KRYPTIK_SEED_1,
    });
    const newWallet: IWallet = {
      ...defaultWallet,
      seedLoop: newSeedloop,
      status: WalletStatus.Connected,
      getResolvedAccount: async () => {
        return {
          address: "",
          isResolved: false,
        };
      },
    };
    let provider = defaultKryptikProvider;
    if (networkDb.ticker == "eth(base)") {
      provider = defaultBaseProvider;
    }
    if (networkDb.ticker == "matic") {
      provider = defaultMaticProvider;
    }
    if (networkDb.ticker == "eth") {
      provider = defaultKryptikProvider;
    }
    const network: Network = defaultNetworks.eth;
    const sendAddress = newWallet.seedLoop.getAddresses(network)[0];

    const buildParams: CreateTransferTransactionParameters = {
      tokenAndNetwork: {
        baseNetworkDb: networkDb,
      },
      amountCrypto: paymentLink.amountPerClaim.toString(),
      kryptikProvider: provider,
      toAddress: address,
      fromAddress: sendAddress,
      tokenPriceUsd: paymentLink.amountPerClaimUsd / paymentLink.amountPerClaim,
      errorHandler: function (
        message: string,
        isFatal?: boolean | undefined
      ): void {
        console.warn(message);
      },
    };
    console.log("building tx..");
    const newTx = await BuildTransferTx(buildParams);
    if (!newTx) {
      console.warn("Exiting...");
      res.status(400).json({ msg: "Unable to build transaction." });
      return;
    }
    const result = await newTx.SignAndSend({
      kryptikWallet: newWallet,
      sendAccount: sendAddress,
      kryptikProvider: provider,
    });
    console.log(result);
    if (!result) {
      res.status(400).json({ msg: "Unable to sign and send transaction." });
      return;
    }
    res.status(200).json({ msg: "Payment link claimed.", txPubdata: result });
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: "Unable to get payment link." });
  }
}
