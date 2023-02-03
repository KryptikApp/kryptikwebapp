import HDSeedLoop, { Network, NetworkFromTicker, Options } from "hdseedloop";
import {
  unlockVault,
  VaultAndShares,
  createVault,
  updateVaultSeedloop,
  vaultExists,
} from "../../handlers/wallet/vaultHandler";
import { defaultWallet } from "../../models/defaultWallet";
import { IWallet, WalletStatus } from "../../models/KryptikWallet";
import { NetworkDb } from "../../services/models/network";
import { IConnectWalletReturn } from "../../services/Web3Service";
import { createShareOnDb, getRemoteShare } from "../shares";
import { networkFromNetworkDb } from "../utils/networkUtils";

export function createSeedloop(
  networkDbsToAdd: NetworkDb[],
  seed?: string
): HDSeedLoop {
  let seedloopKryptik: HDSeedLoop;
  let networksFormatted: Network[] = [];
  // create list of seedloop conforming networks
  for (const nw of networkDbsToAdd) {
    const network: Network = networkFromNetworkDb(nw);
    networksFormatted.push(network);
  }
  let seedloopOptions: Options = {};
  if (seed) {
    // create new seedloop from imported seed
    seedloopOptions.mnemonic = seed;
    seedloopKryptik = new HDSeedLoop(seedloopOptions, networksFormatted);
  } else {
    seedloopKryptik = new HDSeedLoop(seedloopOptions, networksFormatted);
  }
  let ethNetwork = NetworkFromTicker("eth");
  let addy = seedloopKryptik.getAddresses(ethNetwork);
  return seedloopKryptik;
}

interface ConnectParams {
  uid: string;
  networksToAdd: NetworkDb[];
  seed?: string;
}

interface ConnectKryptikParams extends ConnectParams {
  remoteShare?: string;
}

// TODO: ENSURE NEW WALLET IS NOT CREATED IF VAULT EXISTS, BUT MISSING SHARE
/** connects wallet with local service and updates remote share on server if necessary */
export async function ConnectWalletLocalandRemote(
  params: ConnectParams
): Promise<IConnectWalletReturn> {
  const { networksToAdd, uid, seed } = { ...params };
  console.log("running kryptik connect method...");
  // fetch remote share from server if not provided
  const remoteShareToUse: string | null = await getRemoteShare();
  let kryptikConnectionObject: IConnectWalletReturn =
    await connectKryptikWallet({
      uid: uid,
      networksToAdd: networksToAdd,
      remoteShare: remoteShareToUse || undefined,
      seed: seed,
    });
  console.log("finished kryptik connect!");
  // update remote share on db if undefined or value generated on local computer is different
  if (!remoteShareToUse && kryptikConnectionObject.remoteShare) {
    console.log("UPDATING REMOTE SHARE ON DB");
    // update extra user data to reflect updated remote share
    try {
      // write updated extra user data to DB
      await createShareOnDb(kryptikConnectionObject.remoteShare);
    } catch (err) {
      throw new Error(
        "Error writing extra user data to database. Check firestore connection."
      );
    }
  }
  return kryptikConnectionObject;
}

export async function connectKryptikWallet(
  params: ConnectKryptikParams
): Promise<IConnectWalletReturn> {
  let seedloopKryptik: HDSeedLoop;
  let remoteShareReturn: string;
  let updateNetworks: Boolean = false;
  const { networksToAdd, uid, remoteShare, seed } = { ...params };
  if (remoteShare) {
    remoteShareReturn = remoteShare;
    // access existing wallet from local storage vault
    console.log("Unlocking vault...");
    let vaultSeedloop: HDSeedLoop | null = unlockVault(uid, remoteShare);
    console.log("vault unlocked!");
    // if there is already a seedloop available... use it!
    if (vaultSeedloop) {
      seedloopKryptik = vaultSeedloop;
      updateNetworks = true;
    }
    // Remote share provided, but there is no corresponding seed loop on the client for given uid
    else {
      const walletToReturn: IWallet = new IWallet({
        ...defaultWallet,
        walletProviderName: "kryptik",
        status: WalletStatus.OutOfSync,
      });
      return { wallet: walletToReturn, remoteShare: remoteShare };
    }
  }
  // CASE: Remote share not provided...create new seedloop
  else {
    // no remote share, but there is a local vault
    if (vaultExists(uid)) {
      const walletToReturn: IWallet = new IWallet({
        ...defaultWallet,
        walletProviderName: "kryptik",
        status: WalletStatus.OutOfSync,
      });
      return { wallet: walletToReturn };
    }
    // create new vault for seedloop
    seedloopKryptik = createSeedloop(networksToAdd, seed);
    let newVaultandShare: VaultAndShares = createVault(seedloopKryptik, uid);
    remoteShareReturn = newVaultandShare.remoteShare;
  }

  // get primary ethereum addreses for kryptik wallet
  let ethNetwork = NetworkFromTicker("eth");
  let etheAddysAll = seedloopKryptik.getAddresses(ethNetwork);
  let ethAddyFirst = etheAddysAll[0];

  let newWalletStatus: WalletStatus = seedloopKryptik.getIsLocked()
    ? WalletStatus.Locked
    : WalletStatus.Connected;

  // set values for new wallet
  let newKryptikWallet: IWallet = new IWallet({
    ...defaultWallet,
    walletProviderName: "kryptik",
    status: newWalletStatus,
    seedLoop: seedloopKryptik,
    resolvedEthAccount: { address: ethAddyFirst, isResolved: false },
    uid: uid,
  });

  // update wallet networks if necessesary
  if (updateNetworks) {
    try {
      console.log("Updating wallet networks:");
      newKryptikWallet = updateWalletNetworks(
        uid,
        newKryptikWallet,
        networksToAdd,
        remoteShareReturn
      );
      // UPDATE: TO DO if wallet is set as visible update remote addresses
      console.log("Wallet up to date.");
    } catch (e) {
      throw new Error("Error: unable to synchronize remote networks.");
    }
  }
  console.log("returning....");
  // set return values
  const connectionReturnObject: IConnectWalletReturn = {
    wallet: newKryptikWallet,
    remoteShare: remoteShareReturn,
  };
  return connectionReturnObject;
}

export function getSeedPhrase(wallet: IWallet): string | null {
  let seedPhrase: string | null = wallet.seedLoop.getSeedPhrase();
  return seedPhrase;
}

/** update wallets on local seedloop to match networks supported by app. */
function updateWalletNetworks(
  uid: string,
  wallet: IWallet,
  networksToAdd: NetworkDb[],
  remoteShare: string
): IWallet {
  // flag for if networks are added to seedloop
  let isUpdated: boolean = false;
  for (const networkDb of networksToAdd) {
    let network = networkFromNetworkDb(networkDb);
    if (!wallet.seedLoop.networkOnSeedloop(network)) {
      isUpdated = true;
      wallet.seedLoop.addKeyRingByNetwork(network);
    }
  }
  // save updated seedloop in local vault
  if (isUpdated) {
    try {
      console.log(`Updating kryptik vault with id: ${uid}`);
      updateVaultSeedloop(uid, remoteShare, wallet);
      console.log("Vault updated");
    } catch (e) {
      console.warn(
        "Error: Unable to update vault with network synchronized seedloop"
      );
      // throw(new Error("Error: Unable to update vault with network synchronized seedloop"));
    }
  }
  return wallet;
}
