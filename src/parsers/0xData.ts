export interface IEVMSwapSource{
    name:string,
    proportion:string
}

export interface IEVMSwapData{
    buyTokenAddress: string
    chainId: 1,
    data: string,
    gas: string,
    guaranteedPrice: string
    estimatedGas: string,
    gasPrice: string,
    minimumProtocolFee: 0,
    price: string
    protocolFee: string
    sellAmount: string
    sellTokenAddress: string
    sellTokenToEthRate: string
    sources: IEVMSwapSource[]
    to: string
    value: string
}

export function parse0xdata(data:any):IEVMSwapData{
    let dataToReturn:IEVMSwapData = {...data};
    return dataToReturn;
}