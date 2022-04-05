import { Network } from "../models/network";
import {Status} from "../types/index"
import {
    Block,
    StaticJsonRpcProvider,
    TransactionRequest,
    TransactionResponse,
} from '@ethersproject/providers';


interface ItransactionBuilder{
    network:Network;
    // TODO add transaction type that can be used to type transaction property
    transaction:any;
    // itransactionbuilder constructor

    new(network:Network):ItransactionBuilder

    buildTransaction (  {
        addressFrom,
        addressTo,
        amount,
        network,
        gasLimit,
        recipient,
      }: {
        addressFrom: string;
        addressTo: string,
        recipient: string;
        amount: number;
        gasLimit?: string;
        network: Network
      },
      provider: StaticJsonRpcProvider | null,
      ):Promise<Status>
}




