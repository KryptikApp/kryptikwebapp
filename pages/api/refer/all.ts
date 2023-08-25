import { NextApiRequest, NextApiResponse } from "next";

import { getAllPaymentLinks } from "../../../prisma/script";
import { PaymentLink } from "@prisma/client";

type Data = {
  msg?: string;
  paymentLinks?: PaymentLink[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    const newPaymentLinks = await getAllPaymentLinks();
    res
      .status(200)
      .json({ msg: "Payment link created", paymentLinks: newPaymentLinks });
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: "Unable to get payment link." });
  }
}
