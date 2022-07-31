import { TokenAndNetwork } from "../services/models/token"

export interface ISwapSource{
    name:string,
    proportion:string
}

export interface ISwapData{
    buyAmount:string
    buyTokenAddress: string
    chainId: number,
    data: string,
    gas: string,
    guaranteedPrice: string
    estimatedGas: string,
    gasPrice: string,
    minimumProtocolFee: number,
    price: string
    protocolFee: string
    sellAmount: string
    sellTokenAddress: string
    sellTokenToEthRate: string
    sources: ISwapSource[]
    to: string
    value: string
}

export interface IKryptikSwapData extends ISwapData{
    buyTokenAndNetwork:TokenAndNetwork
    sellTokenAndNetwork:TokenAndNetwork
}

export function parse0xdata(data:any):ISwapData{
    let dataToReturn:ISwapData = {...data};
    return dataToReturn;
}