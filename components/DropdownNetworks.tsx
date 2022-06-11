import { NextPage } from "next";
import { useEffect, useState } from "react";
import { ERC20Db } from "../src/services/models/erc20";
import { NetworkBalanceParameters, NetworkDb } from "../src/services/models/network";
import { CreateEVMContractParameters, TokenAndNetwork, TokenBalanceParameters, TokenDataEVM } from "../src/services/models/token";
import { useKryptikAuthContext } from "./KryptikAuthProvider";
import ListItemDropdown from "./lists/ListItemDropwdown";
import { Contract } from "ethers";
import { IBalance } from "../src/services/Web3Service";
import { title } from "process";

interface Props{
    onlyWithValue?:boolean
    selectedTokenAndNetwork:TokenAndNetwork
    selectFunction:any
    onLoadedFunction?:any
}
const DropdownNetworks:NextPage<Props> = (props) => {
    const {selectedTokenAndNetwork, selectFunction, onlyWithValue, onLoadedFunction} = props;
    const {kryptikService, authUser, kryptikWallet} = useKryptikAuthContext();
    const[networkAndTokens, setNetworkAndTokens] = useState<TokenAndNetwork[]>([]);
    const[isFetched, setIsFetched] = useState(false);
    const[showOptions, setShowOptions] = useState(false);



    // retrieves wallet balances
    const fetchTokenAndNetworks = async() =>{
        // ensure kryptik service is started
        await kryptikService.StartSevice();
        // get supported networks
        let networks:NetworkDb[] = kryptikService.getSupportedNetworkDbs();
        let tokensAndNetworks:TokenAndNetwork[] = [];
        let tickerToNetworkBalance:{ [ticker: string]: IBalance } = {};
        // add networks
        for(const nw of networks){
            let networkBalance:IBalance|undefined = undefined;
            if(onlyWithValue){
                let accountAddress:string = await kryptikService.getAddressForNetworkDb(kryptikWallet, nw);
                let NetworkBalanceParams:NetworkBalanceParameters = {
                    accountAddress: accountAddress,
                    networkDb: nw
                }
                let nwBalance = await kryptikService.getBalanceNetwork(NetworkBalanceParams);
                tickerToNetworkBalance[nw.ticker] == nwBalance;
                if(nwBalance) networkBalance = nwBalance;
                // exclude networks with zero balance
                if(networkBalance?.amountCrypto == "0") continue;
            }
            let tokenAndNetworkToAdd:TokenAndNetwork = {
                baseNetworkDb: nw,
                networkBalance: networkBalance
            };
            tokensAndNetworks.push(tokenAndNetworkToAdd);
            // make eth network default option
            if(nw.ticker == "eth") selectFunction(tokenAndNetworkToAdd);
        }
        // add all tokens
        let erc20Dbs:ERC20Db[] = kryptikService.erc20Dbs;
        for(const erc20Db of erc20Dbs){
            for(const chainInfo of erc20Db.chainData){
                let networkDb = kryptikService.getNetworkDbByTicker(chainInfo.ticker);
                if(!networkDb) continue;
                let erc20ContractParams:CreateEVMContractParameters = {
                    wallet: kryptikWallet,
                    networkDb: networkDb,
                    erc20Db: erc20Db
                }
                let erc20Contract:Contract|null = await kryptikService.createERC20Contract(erc20ContractParams);
                if(!erc20Contract) return;
                let tokenBalance:IBalance|undefined = undefined;
                if(onlyWithValue){
                    let accountAddress = await kryptikService.getAddressForNetworkDb(kryptikWallet, networkDb);
                    // get balance for contract
                    let tokenBalanceParams:TokenBalanceParameters = {
                        erc20Contract: erc20Contract,
                        erc20Db: erc20Db,
                        accountAddress: accountAddress,
                        networkDb: networkDb
                    }
                    tokenBalance = await kryptikService.getBalanceErc20Token(tokenBalanceParams);
                    // exclude tokens with zero balance
                    if(tokenBalance.amountCrypto == "0") continue;
                }
                let tokenDataToAdd:TokenDataEVM = {
                    tokenContractConnected: erc20Contract,
                    tokenBalance: tokenBalance,
                    erc20Db: erc20Db
                }
                let tokenAndNetworkToAdd:TokenAndNetwork = {
                    baseNetworkDb: networkDb,
                    networkBalance: tickerToNetworkBalance[networkDb.ticker],
                    tokenData:tokenDataToAdd
                };
                tokensAndNetworks.push(tokenAndNetworkToAdd);
            }
        }
        setNetworkAndTokens(tokensAndNetworks);
        setIsFetched(true);
        if(onLoadedFunction){
            onLoadedFunction();
        }
    }

    const toggleShowOptions = async() =>{
        setShowOptions(!showOptions);
    }

    const handleOptionClick = function(tokenAndNetwork:TokenAndNetwork){
        selectFunction(tokenAndNetwork);
        toggleShowOptions();
    }

    useEffect(() => {
        fetchTokenAndNetworks();
    }, []);
    
    return(
        <div>

        {!isFetched?
        <div>
            <label id="listbox-label" className="block text-sm font-medium text-gray-700 text-left">Token</label>
            {/* skeleton loader */}
            <div className="mt-1 relative">
                <div className="relative w-full bg-gray-400 border border-gray-300 rounded-md shadow-sm pl-3 pr-10 h-8 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-sky-500 sm:text-sm animate-pulse"/>
            </div>
        </div>
        :
        <div>
            <label id="listbox-label" className="block text-sm font-medium text-gray-700 text-left">Token</label>
            <div className="mt-1 relative" onClick={()=>toggleShowOptions()}>
                <button type="button" className="relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-sky-500 sm:text-sm" aria-haspopup="listbox" aria-expanded="true" aria-labelledby="listbox-label">
                <span className="flex items-center">
                    {
                        selectedTokenAndNetwork.tokenData?
                        <div className="py-1">
                            <img src={selectedTokenAndNetwork.tokenData.erc20Db.logoURI} alt={`${title} icon`} className="flex-shrink-0 h-6 w-6 rounded-full inline"/>
                            <img className="w-4 h-4 -ml-2 drop-shadow-lg mt-4 rounded-full inline" src={selectedTokenAndNetwork.baseNetworkDb.iconPath} alt={`${title} secondary image`}/>
                            <span className="ml-3 block truncate inline"> {selectedTokenAndNetwork.tokenData.erc20Db.name}</span>
                        </div>:
                        <div className="py-1">
                            <img src={selectedTokenAndNetwork.baseNetworkDb.iconPath} alt={`${title} icon`} className="flex-shrink-0 h-6 w-6 rounded-full inline"/>
                            <span className="ml-3 block truncate inline"> {selectedTokenAndNetwork.baseNetworkDb.fullName}</span>
                        </div>
                    }
                    
                </span>
                <span className="ml-3 absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    {/* selector icon solid */}
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                </span>
                </button>

                <ul className="absolute z-10 mt-1 w-full bg-white opacity-95 shadow-lg max-h-56 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm" tabIndex={-1} role="listbox" aria-labelledby="listbox-label" aria-activedescendant="listbox-option-3" hidden={!showOptions}>
                {networkAndTokens.map((nt:TokenAndNetwork) => (
                  (!(nt.baseNetworkDb.isTestnet&&!authUser.isAdvanced)) &&
                  <ListItemDropdown selectedTokenAndNetwork={selectedTokenAndNetwork} selectFunction={handleOptionClick} tokenAndNetwork={nt}/>
                ))}
                </ul>
            </div>
            </div>
            
        }
        </div>
    )   
}

export default DropdownNetworks;