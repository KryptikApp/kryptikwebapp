import HDSeedLoop from "hdseedloop";
import { IAccountResolverParams, IResolvedAccount } from "../helpers/resolvers/accountResolver";
import { resolveEVMAccount } from "../helpers/resolvers/evmResolver";
import { defaultNetworkDb } from "../services/models/network";
import { KryptikProvider } from "../services/models/provider";

// adapted from https://github.com/acclrate/cronos-dapp-basic-3/blob/main/src/store/interfaces.tsx
export interface IWalletParams {
    walletProviderName: string; // could be "metamask", "coinbasewallet", "kryptik", "etc."
    balance: number; // user balance
    connected: boolean; // is the wallet connected to the Dapp, or not?
    seedLoop: HDSeedLoop;
    resolvedEthAccount:IResolvedAccount; // eth address + primary ens name 
    uid: string;
}

export class IWallet {
    public walletProviderName: string; // could be "metamask", "coinbasewallet", "kryptik" "etc."
    public balance: number; // user balance
    public connected: boolean; // is the wallet connected to the Dapp, or not?
    public seedLoop: HDSeedLoop;
    public resolvedEthAccount:IResolvedAccount; // eth address + primary ens name 
    public uid: string;

    constructor(params:IWalletParams) {
        const {walletProviderName, balance, connected, seedLoop, resolvedEthAccount, uid} = {...params};
        this.walletProviderName = walletProviderName;
        this.balance = balance;
        this.connected = connected;
        this.seedLoop = seedLoop;
        this.resolvedEthAccount = resolvedEthAccount;
        this.uid = uid;
    }

    // tries to resolve eth account if niot yet resolved
    async getResolvedAccount(kryptikProvider:KryptikProvider){
        if(this.resolvedEthAccount.isResolved) return this.resolvedEthAccount;
        // note default networkdb should be eth
        let resolverParams:IAccountResolverParams = {
            account: this.resolvedEthAccount.address,
            kryptikProvider: kryptikProvider,
            networkDB: defaultNetworkDb
        }
        let newResolvedAccount:IResolvedAccount|null = await resolveEVMAccount(resolverParams);
        if(!newResolvedAccount) return this.resolvedEthAccount;
        return newResolvedAccount;
    }
}
