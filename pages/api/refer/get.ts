import { NextApiRequest, NextApiResponse } from "next";

import { createShare, getPaymentLinkById } from "../../../prisma/script";
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
  const id: string = body.id;
  if (!id) {
    res.status(400).json({ msg: "Invalid request" });
    return;
  }
  try {
    const idAsNumber = parseInt(id);
    if (isNaN(idAsNumber)) {
      res.status(400).json({ msg: "Invalid request" });
      return;
    }
    const newPaymentLink = await getPaymentLinkById(idAsNumber);
    if (!newPaymentLink) {
      res
        .status(400)
        .json({ msg: "Unable to find payment link with provided id." });
      return;
    }
    res
      .status(200)
      .json({ msg: "Payment link created", paymentLink: newPaymentLink });
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: "Unable to get payment link." });
  }
}
