import { BigNumber, ethers } from "ethers"; 
import { Web3Provider } from "@ethersproject/providers";
import HDSeedLoop, { HDKeyring, Network, NetworkFamily} from "hdseedloop"
import Web3Service from "./../services/Web3Service";




export const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));


export const hexToInt = (s: string) => {
    const bn = ethers.BigNumber.from(s);
    return parseInt(bn.toString());
  };

// reloads app window
export const reloadApp = () => {
  window.location.reload();
};


