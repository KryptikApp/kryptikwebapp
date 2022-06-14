import { NextPage } from "next";
import Link from 'next/link';


const ListItemLoading:NextPage = () => {
    return(
      <li className="py-3 sm:py-4">
          <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-gray-500 animate-pulse"/>
              </div>
              <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 w-20 w-60 mx-auto h-4 mb-2 truncate bg-gray-400 animate-pulse rounded">

                  </p>
                  <p className="text-sm text-gray-500 truncate dark:text-gray-400 w-20 mx-auto h-3 bg-gray-400 animate-pulse rounded">

                  </p>
              </div>
              <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate w-20 mx-auto mb-2 h-4 bg-gray-400 animate-pulse rounded">

                  </p>
                  <p className="text-sm text-gray-500 truncate dark:text-gray-400 w-5 h-3 mx-auto bg-gray-400 animate-pulse rounded">

                  </p>
              </div>
          </div>
      </li>
    )   
}

export default ListItemLoading;