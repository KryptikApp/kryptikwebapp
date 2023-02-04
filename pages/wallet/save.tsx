import type { NextPage } from "next";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import toast, { Toaster } from "react-hot-toast";
import { defaultTokenAndNetwork } from "../../src/services/models/network";
import { TxProgress, ServiceState } from "../../src/services/types";
import {
  AiFillCheckCircle,
  AiOutlineArrowDown,
  AiOutlineArrowLeft,
  AiOutlineCloseCircle,
  AiOutlineWallet,
  AiOutlineDollarCircle,
  AiFillInfoCircle,
} from "react-icons/ai";
import { RiSwapLine } from "react-icons/ri";
import {
  Network,
  NetworkFamily,
  NetworkFamilyFromFamilyName,
  truncateAddress,
} from "hdseedloop";

import { getPriceOfTicker } from "../../src/helpers/coinGeckoHelper";
import Divider from "../../components/Divider";
import { useKryptikAuthContext } from "../../components/KryptikAuthProvider";
import DropdownNetworks from "../../components/DropdownNetworks";
import {
  AmountTotalBounds,
  CreateTransferTransactionParameters,
  defaultAmountTotalBounds,
  defaultTransactionFeeData,
  defaultTxPublishedData,
  TransactionPublishedData,
} from "../../src/services/models/transaction";
import TxFee from "../../components/transactions/TxFee";
import {
  networkFromNetworkDb,
  formatTicker,
} from "../../src/helpers/utils/networkUtils";
import {
  roundUsdAmount,
  formatAmountUi,
  roundCryptoAmount,
} from "../../src/helpers/utils/numberUtils";
import {
  getAddressForNetwork,
  getAddressForNetworkDb,
} from "../../src/helpers/utils/accountUtils";
import {
  defaultResolvedAccount,
  IAccountResolverParams,
  resolveAccount,
} from "../../src/helpers/resolvers/accountResolver";
import { KryptikTransaction } from "../../src/models/transactions";
import { BuildTransferTx } from "../../src/handlers/wallet/transactions/transfer";
import { hexToBase58 } from "hdseedloop/dist/utils";
import { WalletStatus } from "../../src/models/KryptikWallet";
//import save from "./saveutil";

const Send: NextPage = () => {
  const {
    authUser,
    loadingAuthUser,
    kryptikWallet,
    kryptikService,
    walletStatus,
  } = useKryptikAuthContext();

  const [amountCrypto, setAmountCrypto] = useState("0");
  const [isInputCrypto, setIsInputCrypto] = useState(false);
  const [amountUSD, setAmountUSD] = useState("0");
  const [dropdownLoaded, setDropDownLoaded] = useState(false);
  const [feesLoaded, setFeesLoaded] = useState(true);
  const [amountTotalBounds, setAmountTotalbounds] = useState<AmountTotalBounds>(
    defaultAmountTotalBounds
  );
  const [transactionFeeData, setTransactionFeedata] = useState(
    defaultTransactionFeeData
  );
  // token price for currently selected token + network
  const [tokenPrice, setTokenPrice] = useState(0);
  const [earn, setEarn] = useState(2);
  const [lent, setLent] = useState(30);
  // token price for base network coin
  const [baseCoinPrice, setBaseCoinPrice] = useState(0);
  const [fromAddress, setFromAddress] = useState(
    kryptikWallet.resolvedEthAccount.address
  );
  const [selectedTokenAndNetwork, setSelectedTokenAndNetwork] = useState(
    defaultTokenAndNetwork
  );
  const [isLoading, setisLoading] = useState(false);
  const [readableFromAddress, setReadableFromAddress] = useState("");
  const [openModal, setOpenModal] = useState(0);

  const router = useRouter();
  // ROUTE PROTECTOR: Listen for changes on loading and authUser, redirect if needed
  useEffect(() => {
    if (walletStatus != WalletStatus.Connected) router.push("/");
    // ensure service is started
    if (kryptikService.serviceState != ServiceState.started) {
      router.push("/");
    }
  }, [authUser, loadingAuthUser]);

  // get data on token/network change
  useEffect(() => {
    fetchFromAddress();
    fetchTokenPrice();
    startSave();
  }, [selectedTokenAndNetwork]);

  // retrieves wallet balances
  const fetchFromAddress = async (): Promise<string> => {
    let accountAddress = await getAddressForNetworkDb(
      kryptikWallet,
      selectedTokenAndNetwork.baseNetworkDb
    );
    let network: Network = networkFromNetworkDb(
      selectedTokenAndNetwork.baseNetworkDb
    );
    // handle empty address
    if (accountAddress == "") {
      toast.error(
        `Error: no address found for ${selectedTokenAndNetwork.baseNetworkDb.fullName}. Please contact the Kryptik team or try refreshing your page.`
      );
      setFromAddress(kryptikWallet.resolvedEthAccount.address);
      setReadableFromAddress(
        truncateAddress(kryptikWallet.resolvedEthAccount.address, network)
      );
      setSelectedTokenAndNetwork(defaultTokenAndNetwork);
      return kryptikWallet.resolvedEthAccount.address;
    }
    setFromAddress(accountAddress);
    setReadableFromAddress(truncateAddress(accountAddress, network));

    return accountAddress;
  };

  const startSave = async () => {
    // get kryptik provider for network
    let networkDB = kryptikService.getNetworkDbByTicker("algo");
    if (!networkDB) throw new Error("Network not found");
    const krypticProvider = await kryptikService.getKryptikProviderForNetworkDb(
      networkDB
    );
    if (!krypticProvider) throw new Error("Provider not found");
    const algodClient = krypticProvider.algorandProvider;
    if (!algodClient) throw new Error("Algo provider not found");
    //const tokenAndNetwork =
    //const user = getAddressForNetworkDb(kryptikWallet, networkDB, krypticProvider);
    //save(algodClient, user);
  };

  // get price for selected token
  const fetchTokenPrice = async () => {
    let coingeckoId = selectedTokenAndNetwork.tokenData
      ? selectedTokenAndNetwork.tokenData.tokenDb.coingeckoId
      : selectedTokenAndNetwork.baseNetworkDb.coingeckoId;
    let tokenPriceCoinGecko: number = await kryptikService.getTokenPrice(
      coingeckoId
    );
    setTokenPrice(tokenPriceCoinGecko);
    if (coingeckoId != selectedTokenAndNetwork.baseNetworkDb.coingeckoId) {
      let networkCoinprice: number = await getPriceOfTicker(
        selectedTokenAndNetwork.baseNetworkDb.coingeckoId
      );
      setBaseCoinPrice(networkCoinprice);
    } else {
      setBaseCoinPrice(tokenPriceCoinGecko);
    }
  };

  const toUSD = (amount: number) => {
    const usd = amount * 0.27;
    return usd.toFixed(2);
  };

  const handleAmountChange = function (amountIn: string) {
    if (!isInputCrypto) amountIn = amountIn.slice(1);
    let formattedAmount = formatAmountUi(
      amountIn,
      selectedTokenAndNetwork,
      !isInputCrypto
    );
    if (!isInputCrypto) {
      // calcaulate token amount from usd input and token price
      let amountToken: string = (
        Number(formattedAmount) / tokenPrice
      ).toString();
      if (amountToken == "NaN") {
        amountToken = "0";
        formattedAmount = "0";
      }
      setAmountUSD(formattedAmount);
      setAmountCrypto(amountToken);
    }
    // case: user input is denominated in tokens
    else {
      let tokenNumericAmount = Number(formattedAmount);
      // calculate usd amount from token input and token price
      let amountUsd: number = tokenNumericAmount * tokenPrice;
      setAmountUSD(amountUsd.toString());
      setAmountCrypto(formattedAmount);
    }
  };

  const setMaxAmount = async () => {};
  function handleToggleIsCrypto() {
    setIsInputCrypto(!isInputCrypto);
  }
  const handleStartParameterSetting = async () => {};

  return (
    <div className="flex h-screen justify-center items-center">
      {openModal < 2 ? (
        <div className="w-3/4 bg-white p-4 shadow-lg">
          <div className="flex justify-between">
            <div className="text-left text-3xl moinline">
              <button
                onClick={() => {
                  setOpenModal(1);
                }}
              >
                <AiFillInfoCircle className="inline" />
              </button>
            </div>
            <div className="text-right text-lg inline">
              <span className="text-gray-500">4.34% APY</span>
            </div>
          </div>
          <div className="text-center text-3xl">
            {isInputCrypto ? earn + " ALGO" : toUSD(earn) + " USD"}
          </div>
          <div className="flex justify-between">
            <div className="text-right text-lg flex-grow inline">
              <span className="text-gray-500">Earned</span>
            </div>
          </div>
          <hr className="my-4" />
          <div className="text-left text-3xl inline">
            <button onClick={handleToggleIsCrypto}>
              <AiOutlineDollarCircle className="inline" />
            </button>
          </div>
          <div className="text-center text-5xl">
            {isInputCrypto ? lent + " ALGO" : toUSD(lent) + " USD"}
          </div>
          <div className="text-right text-lg">
            <span className="text-gray-500">Lent</span>
          </div>
          <hr className="my-4" />
          <div>
            <div className="grid grid-cols-2 divide-x">
              <button
                className="text-xl"
                onClick={() => {
                  setOpenModal(2);
                }}
              >
                Withdraw
              </button>
              <button
                className="text-xl"
                onClick={() => {
                  setOpenModal(3);
                }}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div className="h-[5rem]">
            {/* padding div for space between top and main elements */}
          </div>
          {/* amount input */}
          <div className="flex justify-start mt-5">
            <input
              className="w-full py-2 px-4 text-sky-400 leading-tight focus:outline-none text-8xl text-center bg-transparent"
              id="amount"
              placeholder="$0"
              autoComplete="off"
              required
              value={isInputCrypto ? `${amountCrypto} ALGO` : `$${amountUSD}`}
              onChange={(e) => handleAmountChange(e.target.value)}
            />
          </div>
          <br />
          <div className="w-max grid grid-cols-3 divide-x">
            <RiSwapLine
              className="hover:cursor-pointer inline text-slate-300 ml-2"
              onClick={() => handleToggleIsCrypto()}
              size="50"
            />
            <button
              onClick={() => handleStartParameterSetting()}
              className={`bg-transparent hover:bg-sky-400 text-sky-400 font-semibold hover:text-white text-2xl  inline ${
                isLoading ? "hover:cursor-not-allowed" : ""
              } border border-sky-400 hover:border-transparent rounded-lg my-5`}
              disabled={isLoading}
            >
              {openModal === 2 ? "Withdraw" : "Add"}
              {!isLoading ? (
                ""
              ) : (
                <svg
                  role="status"
                  className="inline w-4 h-4 ml-3 text-white animate-spin"
                  viewBox="0 0 100 101"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="#E5E7EB"
                  />
                  <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="currentColor"
                  />
                </svg>
              )}
            </button>
            <button
              onClick={() => {
                setOpenModal(1);
              }}
              className={`bg-transparent ml-5 hover:bg-sky-400 text-sky-400 font-semibold hover:text-white text-2xl py-2 px-20 inline ${
                isLoading ? "hover:cursor-not-allowed" : ""
              } border border-sky-400 hover:border-transparent rounded-lg my-5`}
              disabled={isLoading}
            >
              Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Send;
