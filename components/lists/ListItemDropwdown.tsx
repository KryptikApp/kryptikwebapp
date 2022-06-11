import { NextPage } from "next";
import { TokenAndNetwork } from "../../src/services/models/token";

interface Props{
    selectedTokenAndNetwork:TokenAndNetwork
    tokenAndNetwork:TokenAndNetwork
    selectFunction:any
}

const ListItemDropdown:NextPage<Props> = (props) => {
    const {tokenAndNetwork, selectFunction, selectedTokenAndNetwork} = props;
    let title = tokenAndNetwork.tokenData?tokenAndNetwork.tokenData.erc20Db.name:tokenAndNetwork.baseNetworkDb.fullName;
    let imgSrc = tokenAndNetwork.tokenData?tokenAndNetwork.tokenData.erc20Db.logoURI:tokenAndNetwork.baseNetworkDb.iconPath;
    return(
        <li className="text-gray-900 select-none relative py-2 pl-3 pr-9 hover:bg-gray-100 cursor-pointer" key={title} id={title} role="option" onClick={()=>selectFunction(tokenAndNetwork)}>
            <div className="flex items-center">
            <img src={imgSrc} alt="" className="flex-shrink-0 h-6 w-6 rounded-full inline"/>
            {
                tokenAndNetwork.tokenData &&
                <img className="w-4 h-4 -ml-2 drop-shadow-lg mt-4 rounded-full inline" src={tokenAndNetwork.baseNetworkDb.iconPath} alt={`${title} secondary image`}/>
            }
            <span className="font-normal ml-3 block truncate"> {title} </span>
            </div>
            {
                (selectedTokenAndNetwork.baseNetworkDb.fullName == tokenAndNetwork.baseNetworkDb.fullName &&
                    selectedTokenAndNetwork.tokenData == tokenAndNetwork.tokenData
                ) ?
                <span className="text-sky-600 absolute inset-y-0 right-0 flex items-center pr-4">
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                </span>:
                <span></span>
            }
            
        </li>
    )   
}

export default ListItemDropdown;