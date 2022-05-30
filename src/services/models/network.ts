// data model for cryptocurrency networks (blockchains) pulled from firebase

export interface NetworkDb {
    fullName: string,
    ticker: string,
    iconPath: string,
    isSupported: boolean,
    about: string,
    whitePaperPath: string,
    chainId: number,
    hexColor: string,
    dateCreated: Date,
    provider:string,
    coingeckoId:string
}