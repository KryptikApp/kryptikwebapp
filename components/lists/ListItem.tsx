import { NextPage } from "next";
import Link from 'next/link';

interface Props{
    title:string,
    subtitle:string,
    imgSrc:string,
    imgSrcSecondary?:string,
    amount:string,
    amountUSD:string,
    networkCoinGecko: string
}

const ListItem:NextPage<Props> = (props) => {
    const {title, subtitle, imgSrc, amount, amountUSD, networkCoinGecko, imgSrcSecondary} = props;
    return(
      <li key={`${title} ${Math.random()}`} className="py-3 sm:py-4">
          <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                  <img className="w-8 h-8 rounded-full inline" src={imgSrc} alt={`${title} image`}/>
                  {
                    imgSrcSecondary &&
                    <img className="w-4 h-4 -ml-2 drop-shadow-lg mt-4 rounded-full inline" src={imgSrcSecondary} alt={`${title} secondary image`}/>
                  }
              </div>
              <div className="flex-1 min-w-0">
              <Link href={{ pathname: '../coins/coinInfo', query: { network:  networkCoinGecko} }}>
                  <p className="text-sm font-medium text-gray-900 truncate">
                      {title}
                  </p>
                </Link>
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