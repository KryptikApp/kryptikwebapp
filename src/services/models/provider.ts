import {
    StaticJsonRpcProvider,
} from '@ethersproject/providers';
import {
    Connection,
  } from '@solana/web3.js';
  
import { Network, NetworkFamily } from 'hdseedloop';
import { Near } from 'near-api-js';
import { NearConfig } from 'near-api-js/lib/near';
import { networkFromNetworkDb } from '../../helpers/utils/networkUtils';
import { NetworkDb } from './network';

export class KryptikProvider{
    public ethProvider: StaticJsonRpcProvider|undefined;
    public solProvider: Connection|undefined;
    public nearProvider: Near|undefined;
    public network:Network;
    constructor(rpcEndpoint:string, networkDb:NetworkDb){
        let network = networkFromNetworkDb(networkDb);
        this.network = network;
        switch(this.network.networkFamily){
            case(NetworkFamily.Near):{
                // UPDATE: sonetwork id is flexible (testnet or mainnet, etc.)
                let nearConfig:NearConfig = {
                    networkId: "mainnet",
                    nodeUrl: rpcEndpoint,
                    headers: {}
                }
                this.nearProvider = new Near(nearConfig);
                break;
            }
            case(NetworkFamily.EVM):{
                this.ethProvider = new StaticJsonRpcProvider(rpcEndpoint, { name: networkDb.fullName.toLowerCase()=="ethereum"?"homestead":networkDb.fullName, chainId: networkDb.chainIdEVM });
                break;
            }
            case(NetworkFamily.Solana):{
                this.solProvider = new Connection(rpcEndpoint);
                break;
            }
            default:{
                throw(new Error(`Error: ${network.fullName} provider is not supported.`))
            }
        }
    }
}