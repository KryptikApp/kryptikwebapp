import { numberToBN } from "../helpers/utils";
// Default amount of gas to be sent with the function calls. Used to pay for the fees
// incurred while running the contract execution. The unused amount will be refunded back to
// the originator.
// Due to protocol changes that charge upfront for the maximum possible gas price inflation due to
// full blocks, the price of max_prepaid_gas is decreased to `300 * 10**12`.

// For discussion see https://github.com/nearprotocol/NEPs/issues/67
export const DEFAULT_NEAR_FUNCTION_CALL_GAS = numberToBN("30000000000000");
export const NEAR_INDEXER_URL = "https://api.kitwallet.app";

export const TOKEN_TRANSFER_DEPOSIT = "1";
export const FT_TRANSFER_GAS = "15000000000000";
export const FT_STORAGE_DEPOSIT_GAS = "30000000000000";
export const FT_MINIMUM_STORAGE_BALANCE = "1250000000000000000000";
export const FT_MINIMUM_STORAGE_BALANCE_LARGE = "12500000000000000000000";
