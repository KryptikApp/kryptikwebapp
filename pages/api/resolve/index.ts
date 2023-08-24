import { NextApiRequest, NextApiResponse } from "next";
import { IResolvedAccount } from "../../../src/helpers/resolvers/accountResolver";
import { KryptikFetch } from "../../../src/kryptikFetch";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<IResolvedAccount>
) {
  try {
    const body = req.body;
    const account = body.account;
    const reqURL = `https://api.ensideas.com/ens/resolve/${account}`;
    const result = await KryptikFetch(reqURL, {});
    const data = await result.data;
    let resolvedAccount: IResolvedAccount = {
      address: data.address,
      isResolved: true,
      avatarPath: data.avatar ? data.avatar : undefined,
      names: data.name ? [data.name] : undefined,
    };
    return res.status(200).json(resolvedAccount);
  } catch (e) {
    return res.status(400);
  }
}
