import { NextPage } from "next";
import { NetworkDb } from "../../src/services/models/network";

interface Props{
    selectedNetwork:NetworkDb
    network:NetworkDb
    selectFunction:any
}

const ListItemDropdown:NextPage<Props> = (props) => {
    const {network, selectFunction, selectedNetwork} = props;
    let title = network.fullName;
    let imgSrc = network.iconPath;
    return(
        <li className="text-gray-900 cursor-default select-none relative py-2 pl-3 pr-9" key={title} id={title} role="option" onClick={()=>selectFunction(network)}>
            <div className="flex items-center">
            <img src={imgSrc} alt="" className="flex-shrink-0 h-6 w-6 rounded-full"/>
            <span className="font-normal ml-3 block truncate"> {title} </span>
            </div>
            {
                selectedNetwork.fullName == network.fullName ?
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