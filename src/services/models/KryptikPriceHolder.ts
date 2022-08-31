import { PricesDict } from "../../helpers/coinGeckoHelper";


export interface IKryptikPricesParams{
    prices:PricesDict
    // freshness window
    freshWindow?:number
}


// wrapper for priuces cache
export class KryptikPriceHolder{
    // number of seconds we consider these balances to be 'fresh'
    private freshWindow:number
    private lastUpdated:number
    prices:PricesDict

    constructor(params:IKryptikPricesParams) {
        const {prices, freshWindow} = {...params};
        this.prices = prices;
         // use provided number of seconds or default to five minutes
        this.freshWindow = freshWindow?freshWindow:300
        this.lastUpdated = Date.now();
    }

    // TODO: update so transaction is refreshed as well
    updatePrices(newPrices:PricesDict){
        this.prices = newPrices;
        this.lastUpdated = Date.now();
    }

    getPriceById(id:string):number|null{
        let priceToReturn = this.prices[id]
        if(!priceToReturn) return null;
        return priceToReturn
    }

    isFresh():boolean{
        // seconds since last update
        let secondsElapsed:number = (Date.now()-this.lastUpdated)/1000
        return secondsElapsed<this.freshWindow;
    }

}