import { NextApiRequest, NextApiResponse } from "next";

import {
  createShare,
  getPaymentLinkById,
  getPaymentLinkByName,
} from "../../../prisma/script";
import { PaymentLink } from "@prisma/client";

type Data = {
  msg?: string;
  paymentLink?: PaymentLink;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const body = req.body;
  const name: string = body.name;
  if (!name) {
    res.status(400).json({ msg: "Invalid request" });
    return;
  }
  try {
    const newPaymentLink = await getPaymentLinkByName(name);
    if (!newPaymentLink) {
      res
        .status(400)
        .json({ msg: "Unable to find payment link with provided id." });
      return;
    }
    res
      .status(200)
      .json({ msg: "Payment link retrieved.", paymentLink: newPaymentLink });
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: "Unable to get payment link." });
  }
}
