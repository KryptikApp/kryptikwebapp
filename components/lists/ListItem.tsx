import { NextPage } from "next";

interface Props{
    title:string,
    subtitle:string,
    imgSrc:string,
    amount:string,
    amountUSD:string
}

const ListItem:NextPage<Props> = (props) => {
    const {title, subtitle, imgSrc, amount, amountUSD} = props;
    return(
      <li key={title} className="py-3 sm:py-4">
          <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                  <img className="w-8 h-8 rounded-full" src={imgSrc} alt="List Image"/>
              </div>
              <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                      {title}
                  </p>
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