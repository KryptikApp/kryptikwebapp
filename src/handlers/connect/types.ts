import { TxFamilyWrapper } from "../wallet/transactions";

/**
 * Sign Methods
 */
export const signingMethods = {
  PERSONAL_SIGN: "personal_sign",
  ETH_SIGN: "eth_sign",
  ETH_SIGN_TRANSACTION: "eth_signTransaction",
  ETH_SIGN_TYPED_DATA: "eth_signTypedData",
  ETH_SIGN_TYPED_DATA_V3: "eth_signTypedData_v3",
  ETH_SIGN_TYPED_DATA_V4: "eth_signTypedData_v4",
  ETH_SEND_RAW_TRANSACTION: "eth_sendRawTransaction",
  ETH_SEND_TRANSACTION: "eth_sendTransaction",
  SOLANA_SIGN_TRANSACTION: "solana_signTransaction",
  SOLANA_SIGN_MESSAGE: "solana_signMessage",
  NEAR_SIGN_IN: "near_signIn",
  NEAR_SIGN_OUT: "near_signOut",
  NEAR_GET_ACCOUNTS: "near_getAccounts",
  NEAR_SIGN_TRANSACTION: "near_signTransaction",
  NEAR_SIGN_AND_SEND_TRANSACTION: "near_signAndSendTransaction",
  NEAR_SIGN_TRANSACTIONS: "near_signTransactions",
  NEAR_SIGN_AND_SEND_TRANSACTIONS: "near_signAndSendTransactions",
  NEAR_VERIFY_OWNER: "near_verifyOwner",
};

export interface JsonRpcResult<T = any> {
  id: number;
  jsonrpc: string;
  result: T;
}

export interface IConnectCardProps {
  onRequestClose: () => any;
}

export interface IParsedWcRequest {
  tx?: TxFamilyWrapper;
  message?: string;
  humanReadableString: string;
  requestType: WcRequestType;
  method: string;
  // blockchain id
  chainId: string;
  id: number;
  topic: string;
}

export enum WcRequestType {
  signMessage = 0,
  signTx = 1,
  signAndSendTx = 2,
  signTypedData = 3,
  sendTx = 4,
  unknown = 5,
}
