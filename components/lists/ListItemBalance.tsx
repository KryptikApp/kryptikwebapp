import { add } from "lodash";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { formatTicker } from "../../src/helpers/utils/networkUtils";
import { roundCryptoAmount, roundUsdAmount } from "../../src/helpers/utils/numberUtils";
import { TokenAndNetwork } from "../../src/services/models/token";
import { useKryptikThemeContext } from "../ThemeProvider";

interface Props{
    tokenAndNetwork:TokenAndNetwork
    // used for headers to asset
    addInfoLink?:boolean,
    htmlKey:number
}


const ListItemBalance:NextPage<Props> = (props) => {
    const router = useRouter();
    const {addInfoLink=true, tokenAndNetwork, htmlKey} = props;
    const {hideBalances} = useKryptikThemeContext();
    const title = tokenAndNetwork.tokenData?tokenAndNetwork.tokenData.tokenDb.name:tokenAndNetwork.baseNetworkDb.fullName;
    const imgSrcPrimary = tokenAndNetwork.tokenData?tokenAndNetwork.tokenData.tokenDb.logoURI:tokenAndNetwork.baseNetworkDb.iconPath;
    const imgSrcSecondary = tokenAndNetwork.tokenData?tokenAndNetwork.baseNetworkDb.iconPath:null;
    const subtitle = tokenAndNetwork.tokenData?formatTicker(tokenAndNetwork.tokenData.tokenDb.symbol):formatTicker(formatTicker(tokenAndNetwork.baseNetworkDb.ticker));
    let amount = null;
    let amountFiat = null;
    if(tokenAndNetwork.tokenData?.tokenBalance){

        amount = roundCryptoAmount(Number(tokenAndNetwork.tokenData.tokenBalance.amountCrypto));
        amountFiat = roundUsdAmount(Number(tokenAndNetwork.tokenData.tokenBalance.amountUSD));
    }
    else{
        if(tokenAndNetwork.networkBalance){
            amount = roundCryptoAmount(Number(tokenAndNetwork.networkBalance.amountCrypto));
            amountFiat = roundUsdAmount(Number(tokenAndNetwork.networkBalance.amountUSD));
        }
    }

    // redirect to asset info page if infolink provided
    const handleOnClick = function(){
        if(addInfoLink){
            if(tokenAndNetwork.tokenData){
                router.push( { pathname: '../coins/coinInfo', query:{networkTicker:tokenAndNetwork.baseNetworkDb.ticker, tokenTicker:tokenAndNetwork.tokenData.tokenDb.symbol}} );
            }
            else{
                router.push( { pathname: '../coins/coinInfo', query:{networkTicker:tokenAndNetwork.baseNetworkDb.ticker} } );
            }
        }
    }
    return(
      <div>
      {
        (amount && amountFiat) &&
        <li key={`${htmlKey}`} className="py-3 sm:py-4 hover:cursor-pointer rounded hover:gray-100 hover:dark:bg-[#141414]" onClick={()=>handleOnClick()}>
          <div className="flex space-x-2 px-2">
              <div className="flex-shrink-0 min-w-[48px]">
                  <img className="w-8 h-8 rounded-full inline" src={imgSrcPrimary} alt={`${title} image`}/>
                  {
                    imgSrcSecondary &&
                    <img className="w-4 h-4 -ml-2 drop-shadow-lg mt-4 rounded-full inline" src={imgSrcSecondary} alt={`${title} secondary image`}/>
                  }
              </div>
              <div className="text-left flex-1 min-w-0">

                    <div>
                        <p className="text-md font-medium text-gray-900 truncate dark:text-gray-100">
                            {title}
                        </p>
                    </div>
              
                  <p className="text-sm text-gray-500 truncate dark:text-gray-400">
                      {subtitle}
                  </p>
              </div>
              <div className="flex-grow text-right min-w-0">
                  <p className={`text-lg font-medium text-gray-900 truncate dark:text-gray-200 ${hideBalances?"font-bold blur-sm":""}`}>
                      $
                      {amountFiat}
                  </p>
                  <p className={`text-sm text-gray-500 truncate dark:text-gray-400 ${hideBalances?"font-bold blur-sm":""}`}>
                      {amount}
                  </p>
              </div>
          </div>
      </li>
      }
      </div>
      
    )   
}

export default ListItemBalance;