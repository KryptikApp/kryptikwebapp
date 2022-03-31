// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { defaultUploadFileResult, IUploadResult, uploadJsonToIpfs, uploadStreamToIpfs } from "../../helpers/ipfs";

type Data = {
  name: string
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  console.log("HEYY!")
  console.log(req.body);
  res.status(200).json({ name: 'John Doe' })
}
