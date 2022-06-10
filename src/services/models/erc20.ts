export interface ChainData{
    chainId: number,
    address: string,
    ticker:string
}

export interface ERC20Db{
    name: string,
    symbol: string,
    decimals: number,
    coingeckoId: string,
    chainData: ChainData[],
    logoURI: string,
    extensions: {
       link: string,
       description: string
    },
    tags:string[]
}