import { BigNumber, ethers } from "ethers"; 
import { Web3Provider } from "@ethersproject/providers";
import HDSeedLoop, { HDKeyring } from "hdseedloop";
import Web3Service from "./../services/Web3Service";
import { Network } from "hdseedloop";
import {} from "hdseedloop"


export const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));


export const hexToInt = (s: string) => {
    const bn = ethers.BigNumber.from(s);
    return parseInt(bn.toString());
  };

// reloads app window
export const reloadApp = () => {
  window.location.reload();
};



export const getSeedLoopBalanceAllNetworks = async(seedLoop:HDSeedLoop):Promise<{ [ticker: string]: number }> =>{
  let web3Service = await new Web3Service().StartSevice();
  let networksFromDb = (await web3Service).getSupportedNetworks();
  let balance:number = 0;
  // initialize return dict.
  let balanceDict: { [ticker: string]: number } = {};
  networksFromDb.forEach(async nw => {
    let network:Network = new Network(nw.fullName, nw.ticker);
    let keyring:HDKeyring = await seedLoop.getKeyRing(network);
    // gets all addresses for network
    let allAddys:string[] = await keyring.getAddressesSync();
    // gets first address for network
    let firstAddy:string = allAddys[0];
    // get provider for network
    let networkProvider = await web3Service.getProviderForNetwork(nw);
    let networkBalance = await networkProvider.getBalance(firstAddy);
    // add network balance to dict. with network ticker as key
    balanceDict[network.ticker] = networkBalance.toNumber();
  });
  // return (
  //   ethers.BigNumber.from(balance)
  //     .div(ethers.BigNumber.from("10000000000000000"))
  //     .toNumber() / 100
  // );
  return balanceDict;
}