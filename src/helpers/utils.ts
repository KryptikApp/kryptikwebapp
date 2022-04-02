import { ethers } from "ethers"; 
import { Web3Provider } from "@ethersproject/providers";


export const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));


export const hexToInt = (s: string) => {
    const bn = ethers.BigNumber.from(s);
    return parseInt(bn.toString());
  };

export const reloadApp = () => {
  window.location.reload();
};

// Get balance on current chain for address
export const getCurrentChainBalance = async (
    web3Provider: Web3Provider,
    address: string
  ): Promise<number> => {
    const balance = await web3Provider.getBalance(address);
    // Balance is rounded at 2 decimals instead of 18, to simplify the UI
    return (
      ethers.BigNumber.from(balance)
        .div(ethers.BigNumber.from("10000000000000000"))
        .toNumber() / 100
    );
  };