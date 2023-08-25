import { KryptikFetch } from "../../kryptikFetch";
import { ISwapData, parse0xdata } from "../../parsers/0xData";

export interface zeroXParams {
  baseUrl: string;
  buyTokenId: string;
  sellTokenId: string;
  sellAmount: number;
  takerAddress?: string;
  slippagePercentage?: number;
}

export const fetch0xSwapOptions = async function (
  params: zeroXParams
): Promise<null | ISwapData> {
  const {
    baseUrl,
    buyTokenId,
    sellTokenId,
    sellAmount,
    takerAddress,
    slippagePercentage,
  } = { ...params };
  try {
    // add support for multiple pages
    let url: string;
    // add taker address if provide
    if (takerAddress) {
      url = `${baseUrl}swap/v1/quote?buyToken=${buyTokenId}&sellToken=${sellTokenId}&sellAmount=${sellAmount}&takerAddress=${takerAddress}`;
    } else {
      url = `${baseUrl}swap/v1/quote?buyToken=${buyTokenId}&sellToken=${sellTokenId}&sellAmount=${sellAmount}`;
    }
    if (slippagePercentage) {
      url.concat(`&slippagePercentage=${slippagePercentage}`);
    }
    // add api key
    const headers = {
      "0x-api-key": `${process.env.NEXT_PUBLIC_ZEROX_API_KEY}`,
    };

    const dataResponse = await KryptikFetch(url, {
      timeout: 10000, // 10 secs
      headers: headers,
    });
    if (!dataResponse || !dataResponse.data) return null;
    // parse api response and return
    const evmSwapData: ISwapData = parse0xdata(dataResponse.data);
    return evmSwapData;
  } catch (e) {
    console.log("Error while fetching 0x swap data");
    console.warn(e);
    return null;
  }
};
