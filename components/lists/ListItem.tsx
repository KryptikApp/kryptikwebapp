import { NextPage } from "next";
import { useRouter } from "next/router";

interface Props{
    title:string,
    subtitle:string,
    imgSrc:string,
    imgSrcSecondary?:string,
    amount:string,
    amountUSD:string,
    coinGeckoId: string,
    // used for headers to asset
    infoLink?:boolean,
    networkTicker?:string,
    tokenTicker?:string
}


const ListItem:NextPage<Props> = (props) => {
    
    const router = useRouter();
    const {title, subtitle, imgSrc, amount, amountUSD, infoLink, imgSrcSecondary, networkTicker, tokenTicker} = props;
    // redirect to asset info page if infolink provided
    const handleOnClick = function(){
        if(infoLink){
            router.push({ pathname: '../coins/coinInfo', query:{networkTicker:networkTicker, tokenTicker:tokenTicker?tokenTicker:undefined} })
        }
    }
    return(
      <li key={`${title} ${Math.random()}`} className="py-3 sm:py-4 hover:cursor-pointer" onClick={()=>handleOnClick()}>
          <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                  <img className="w-8 h-8 rounded-full inline" src={imgSrc} alt={`${title} image`}/>
                  {
                    imgSrcSecondary &&
                    <img className="w-4 h-4 -ml-2 drop-shadow-lg mt-4 rounded-full inline" src={imgSrcSecondary} alt={`${title} secondary image`}/>
                  }
              </div>
              <div className="flex-1 min-w-0">

                    <div>
                        <p className="text-sm font-medium text-gray-900 truncate">
                            {title}
                        </p>
                    </div>
              
                  <p className="text-sm text-gray-500 truncate dark:text-gray-400">
                      {subtitle}
                  </p>
              </div>
              <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                      {amount}
                  </p>
                  <p className="text-sm text-gray-500 truncate dark:text-gray-400">
                      $
                      {amountUSD}
                  </p>
              </div>
          </div>
      </li>
    )   
}

export default ListItem;