import { NextPage } from "next";
import { useEffect, useState } from "react";
import { defaultNetworkDb, NetworkDb } from "../src/services/models/network";
import { useKryptikAuthContext } from "./KryptikAuthProvider";
import ListItemDropdown from "./lists/ListItemDropwdown";

interface Props{
    selectedNetwork:NetworkDb
    selectFunction:any
}
const DropdownNetworks:NextPage<Props> = (props) => {
    const {selectedNetwork, selectFunction} = props;
    const {kryptikService} = useKryptikAuthContext();
    const[networks, setNetworks] = useState<NetworkDb[]>([]);

    const[isFetched, setIsFetched] = useState(false);
    const[showOptions, setShowOptions] = useState(false);



    // retrieves wallet balances
    const fetchNetworks = async() =>{
        await kryptikService.StartSevice();
        let networks:NetworkDb[] = kryptikService.getSupportedNetworkDbs();
        setNetworks(networks)
        setIsFetched(true);
    }

    const toggleShowOptions = async() =>{
        setShowOptions(!showOptions);
    }

    const handleOptionClick = function(network:NetworkDb){
        selectFunction(network);
        toggleShowOptions();
    }

    useEffect(() => {
        fetchNetworks();
    }, []);
    
    return(
        !isFetched?<p>Loading Networks.</p>:
        <div>
            <label id="listbox-label" className="block text-sm font-medium text-gray-700 text-left">Network </label>
            <div className="mt-1 relative" onClick={()=>toggleShowOptions()}>
                <button type="button" className="relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-sky-500 sm:text-sm" aria-haspopup="listbox" aria-expanded="true" aria-labelledby="listbox-label">
                <span className="flex items-center">
                    <img src={selectedNetwork.iconPath} alt="" className="flex-shrink-0 h-6 w-6 rounded-full"/>
                    <span className="ml-3 block truncate"> {selectedNetwork.fullName} </span>
                </span>
                <span className="ml-3 absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    {/* selector icon solid */}
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                </span>
                </button>

                <ul className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-56 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm" tabIndex={-1} role="listbox" aria-labelledby="listbox-label" aria-activedescendant="listbox-option-3" hidden={!showOptions}>
                {networks.map((nw:NetworkDb) => (
                  <ListItemDropdown selectedNetwork={selectedNetwork} selectFunction={handleOptionClick} network={nw}/>
                ))}
                </ul>
            </div>
            </div>
    )   
}

export default DropdownNetworks;