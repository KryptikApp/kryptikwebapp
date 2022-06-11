import { Contract } from "ethers";
import { IWallet } from "../../models/IWallet";
import { IBalance } from "../Web3Service";
import { ERC20Db } from "./erc20";
import { NetworkDb } from "./network";

export interface TokenDataEVM{
    tokenContractConnected: Contract,
    tokenBalance?:IBalance
    erc20Db: ERC20Db
}

// TODO: Update so this is a class with get balance method
export interface TokenAndNetwork{
    // contract on the underlying blockchain network
    // TO DO: Add non-evm token contracts
    tokenData?:TokenDataEVM,
    networkBalance?:IBalance,
    // blockchain network the token resides on
    baseNetworkDb: NetworkDb
}

export interface TokenBalanceParameters{
    erc20Db:ERC20Db, 
    erc20Contract:Contract, 
    accountAddress:string, 
    networkDb:NetworkDb
}

export interface CreateEVMContractParameters{
    erc20Db:ERC20Db,
    networkDb:NetworkDb,
    wallet:IWallet
}

