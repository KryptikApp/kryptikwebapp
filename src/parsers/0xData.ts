import { TokenAndNetwork } from "../services/models/token"

export interface ISwapSource{
    name:string,
    proportion:string
}

export interface EVMSwapdata{
    gas: string
    estimatedGas: string
    gasPrice: string
    sellTokenToEthRate: string
    to: string
    value: string
    data: string
    allowanceTarget:string
}

export interface ISwapData{
    buyAmount:string
    buyTokenAddress: string
    chainId: number
    minimumProtocolFee: number
    price: string
    guaranteedPrice: string
    protocolFee: string
    sellAmount: string
    sellTokenAddress: string
    sources: ISwapSource[]
    // evm specific data
    evmData?:EVMSwapdata
}

export interface IKryptikSwapData extends ISwapData{
    buyTokenAndNetwork:TokenAndNetwork
    sellTokenAndNetwork:TokenAndNetwork
}

export function parse0xdata(data:any):ISwapData{
    let evmSwapData:EVMSwapdata = {...data};
    let dataToReturn:ISwapData = {...data};
    dataToReturn.evmData = evmSwapData;
    return dataToReturn;
}