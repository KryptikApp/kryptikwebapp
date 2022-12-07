---
title: "Digital Wallets"
oneLiner: "Digital wallets store sensitive secrets and billions of dollars. Threshold cryptography improves wallet security."
image: "/blog/kryptikShareholderRing.jpg"
lastUpdate: "2022-12-6"
category: "Technology"
contributorId: "jett"
tags: ["cryptography", "internet", "computers", "keys", "security"]
---

Digital wallets enable essential applications like encrypted messaging and online banking. However, digital wallets are vulnerable to loss and theft; compromised wallets are a severe issue, costing innocent people billions of dollars. Kryptik improves the security of digital wallets by distributing account recovery across a group of shareholders. In addition to removing a single point of failure, Kryptik simplifies the wallet experience by incorporating passwordless authentication. The Kryptik key management system has been adopted and is used in the open-source Kryptik wallet.

## Introduction

The internet relies on a peer-to-peer connection between computers, but the majority of services we use daily are centralized. While corporations like Chase and Facebook are easy to use, centralized convenience often comes at the cost of privacy and ownership.

Since the development of Bitcoin in 2009, there has been a significant push to make the internet more decentralized. Blockchains like Bitcoin and Ethereum promise to shift power from the few to the many, opening a new frontier of digital exploration.

A few examples of popular blockchain apps are shown below.

- **Augur.** A prediction market for betting on real world events like sports games and election outcomes.
- **Opensea.** A marketplace for digital collectibles.
- **Lens.** A user controlled social media platform. Developers can use a standard interface.
- **AAVE.** Lending and borrowing with over four billion dollars in assets.
- **SIWE.** One click login using an Ethereum account.
- **Uniswap.** A decentralized exchange for digital currencies.
- **IPFS.** Store files on a global network of computers.

Every blockchain application requires a digital wallet that can send and sign transactions. Since 2009, over one hundred million wallets have been created worldwide.

## Random Seeds

At the core of every wallet is a single seed: a string of randomness. As a seed grows in length, the less likely it is to be guessed by an attacker.

Most wallets use seeds with 256 bits of entropy. In practice, this looks like a long string of ones and zeros, with each character having two distinct possibilities. The number of possible seeds grows exponentially. For example, if a seed has 8 bits of entropy, there are $2^8$ (256) possibilities of what it could be. With 256 bits of entropy, there are 2^256 possible seeds, which is more than the number of atoms in the observable universe.

| **Entropy As an Image**                                                                                                  |
| :----------------------------------------------------------------------------------------------------------------------- |
| ![Entropy as an Image](/blog/entropyAsAnImage.jpg)                                                                       |
| _Entropy is a measure of randomness. The more entropy increases, the less likely a piece of information can be guessed._ |

Seeds are hard to guess and are an ideal source for generating public-private key pairs.

## Deterministic Wallets

Early Bitcoin clients used a random stash of keys once per transaction. Once the initial supply of keys was exhausted, the backup would be invalidated; this made key management complex and insecure.

Deterministic wallets simplify key management. A single seed can generate an unlimited number of keys. However, most deterministic wallets store keypairs on a single chain. Sharing a deterministic wallet is “all or nothing”: sharing a single key requires sharing all keys.

## Hierarchical Deterministic Wallets

Hierarchical deterministic wallets are structured as a tree of key pairs. A single master key is stored at the root, and fresh child keys are derived from a unique derivation path. Each path of the HD tree can be shared without exposing the complete tree.

| **HD Tree**                                                               |
| :------------------------------------------------------------------------ |
| ![Entropy as an Image](/blog/hdtree.jpg)                                  |
| _A tree of HD keypairs. Each branch represents a unique derivation path._ |

> For cryptocurrency wallets, each blockchain has a unique derivation path. The derivation path contains directions to a key’s location within the tree structure.

HD wallets provide several benefits. For example, HD Wallets permit an online shop to accept payments at a new address for each order without giving the server access to the corresponding private keys (required for spending the received funds).

## Wallets Are Hard to protect

One of the best parts of HD wallets is the ability to control your own money and data. Unlike traditional banks or third-party services, no third party holds assets on your behalf. However, with great power comes great responsibility.

> Over $100,000,000,000 worth of cryptocurrency has been permanently lost after users have lost access to their wallet.

Today, holding your own cryptographic keys requires memorizing long mnemonic phrases, trusting third-party custodians, or purchasing complicated hardware wallets. These solutions are insufficient for most internet users looking for a simple way to manage private keys.

## Standard Solutions

Noncustodial wallet management is an open problem, with an inherent tradeoff between security and ease of use. Standard solutions are shown below.

**Multisig Wallets.** A multi signature wallet requires multiple private keys to authorize transactions.

**Smart Contract Wallets.** Smart contract wallets are just a multisig with extra bells and whistles for recovery and permissions. For example, Argent— a smart contract wallet with over four million accounts— allows ‘guardians’ to replace the account owner and set permissions for value-subtracting transactions.

**Account Abstraction.** Account abstraction turns every blockchain account into a smart contract wallet. Account abstraction has not been implemented on major blockchains like Ethereum despite discussion since 2014.

Account abstraction and smart contract wallets have been described as a breakthrough in the security and usability of crypto wallets; However, smart contracts have significant drawbacks, explained below.

- **Network specific.** Smart contract wallets are implemented as code that runs on a single blockchain. This requires users to create a separate wallet for each blockchain which is a hassle and a security risk.
- **Time lag.** Adding guardians or transferring ownership requires a ‘security period’ that can last multiple days.
- **No UTXO support.** Smart contract wallets require turing-complete blockchains, so there is no support for transduction based networks like Bitcoin.
- **Variable fees.** Processing payments requires executing smart contract code, which can vary in cost for each wallet.
- **Upfront cost.** Smart contract wallets require an initial setup fee to pay for the creation of a new contract on the blockchain.

Large companies may benefit from the policies provided by smart contract wallets. However, smart contracts restrict wallets to a single blockchain and prevent users from accessing the full range of benefits provided by a personal public-private key pair.

## Distributed Key Management

To secure ownership and privacy across the web, we need a different way to back up asymmetric keys. Fortunately, threshold cryptography provides a neat solution. As a quick reminder, threshold cryptography protects information by splitting pieces of a secret between groups.

For the past year, I have been developing an open-source wallet (Kryptik) that uses encryption and secret sharing for authentication and account recovery.

**Kryptik Key Management.** Instead of relying on a smart contract with trusted guardians, Kryptik distributes shares of an encryption key to a group of shareholders; k of n shares are required to reconstruct the original secret. The encryption key creates an encrypted version of the wallet. Whenever a user wants to regain access to their wallet, the shares are reassembled, and the wallet is decrypted.

| **Kryptik Shareholders**                                                                                                                                                             |
| :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ![Kryptik Shareholders](/blog/kryptikShareholderRing.jpg)                                                                                                                            |
| _Kryptik key management splits a secret encryption key among n shareholders. Each share is represented as a coordinate point. K shares are required to recover the original secret._ |

The Kryptik key management has a number of positive properties:

- **Network Agnostic.** Kryptik is network agnostic. Use any blockchain you want.
- **Quick recovery.** Account recovery takes seconds instead of days. Just log in like you would for any other app. Creating a new shareholder is also fast.
- **Multi-factor Authentication.** Verify ownership of your account with a combination of any standard authentication scheme like 2fa.
- **Predictable Fees.** Transaction verification logic is unmodified and the cost can be hard coded by applications.
- **No setup cost.** No smart contracts need to be created or paid for.

In short, Kryptik key management addresses the complexity, fees, and time delay of smart contract wallets. Furthermore, shareholders can be used for wallet recovery and authentication.

## Challenges

While secret sharing improves the security of online wallets, there are several challenges. Each challenge presents tradeoffs between security and ease of use that must be addressed by Kryptik.

**Ciphertext Storage.** Ciphertext storage presents a tradeoff between security and convenience. By keeping ciphertext on the original device, shareholders function as gatekeepers, releasing shares when specific criteria have been met: for example, when a login link has been clicked, or security questions have been answered. Since the wallet owner is the only one with access to the ciphertext, shareholder collusion will not compromise the wallet. The secret encryption key may be recovered, but decrypting the wallet is impossible without the corresponding ciphertext (held in local storage).

> _Local Storage Drawback_
>
> Wallet recovery is no longer an option if the user's device is lost or stolen.

Cloud storage removes the user's device as a single point of failure. Anyone who has access to the remote database has access to the ciphertext. If the database is a blockchain like Ethereum, then the wallet ciphertext is public and viewable by anyone. In this case, shareholder collusion would compromise the wallet.

> _Cloud Storage Drawback_
>
> K of n shareholders can collude and decipher the public ciphertext.

Permissioned databases like AWS provide an alternative to public storage on a blockchain. Users can upload a copy of the ciphertext to a cloud provider like AWS and benefit from server-side access control. However, each shareholder would need access to the database to retain the benefits of cloud recovery. At this point, the security assumptions become identical to the public model.

| **Local Storage**                                          | **Cloud Storage**                                           |
| ---------------------------------------------------------- | ----------------------------------------------------------- |
| Keeps ciphertext on the same device that generates shares. | Keeps ciphertext on a remote database like AWS or Ethereum. |
| A single copy. Easy to lose.                               | Multiple copies. Hard to lose.                              |
| Recovery requires possession of the device.                | Recovery requires access to the database.                   |

**Denial of shares.** Shareholders may refuse to respond. K of N shares are required to reconstruct the original secret. If more than M-K shareholders refuse to respond, there is no way to reconstruct the original secret.

The wallet owner can keep k shares to avoid the ‘denial of shares’ attack, but this creates a single point of failure. Shares can be stored on separate devices, but there is still the underlying concern of a single person owning k shares.

**False shares.** Malicious shareholders may cheat and submit incorrect shares. Cheating does not compromise wallet security, but it does impair recovery. A single incorrect share is enough to invalidate reconstruction.

In the case of a cheater, the recovery protocol can cycle through k of m submitted shares to obtain a valid subset. Recovery is possible as long as k of m submitted shares are honest.

## Kryptik Implementation Details

The specific design decisions made by Kryptik are discussed below.

**Share Generation.** New wallets are encrypted and kept in local storage. The 256-bit encryption key is split into two shares. One share is held in local storage, and the other share is sent to a database. Shares are created using shamir secret sharing configured with a finite field in $Gf(2^8)$ and 128 bits of padding.

**Wallet Storage.** Local wallets are held in a software vault. Vaults are locked by default and can only be unlocked with a valid set of shares. The standard vault interface is shown below.

```typescript
interface VaultContents {
  // ciphertext of encrypted seedloop
  seedloopSerlializedCipher: string;
  // version: default is 0
  vaultVersion: number;
  // share of the encryption key
  localShare: string;
  // timestamps stored as...
  // number of milliseconds since the epoch
  lastUnlockTime: number;
  createdTime: number;
  // user id generated by wallet app
  uid: string;
  // if unlock correct, should read "valid"
  check: string;
}
```

**Authentication.** Kryptik uses an authentication provider to generate a decentralized identifier (DID) token, which is shared via email. After validation, the DID is exchanged with the database for an access token, and the user session begins. No passwords are required.

| **Kryptik Authentication Flow**                                                                                                                 |
| :---------------------------------------------------------------------------------------------------------------------------------------------- |
| ![Kryptik Authentication Flow](/blog/authenticationFlowPlain.png)                                                                               |
| _Kryptik’s passwordless authentication flow. The DID token is sent via email. After validation, the user can access the server’s secret share._ |

**Recovery.** When a new user session begins, Kryptik retrieves the database share and combines it locally to recover the original encryption secret. The wallet is then decrypted and made available for use. This arrangement results in a two-of-two security scheme, where an attacker must compromise both systems to obtain a user’s private seed.

**Synchronization.** The primary device displays two QR codes: one code for the local shamir share and one code for the wallet ciphertext. Both codes are protected by a temporary encryption key that can only be accessed by authenticated users.

After the QR codes have been scanned and decrypted, an identical wallet is created on the secondary device.

## Conclusion

Kryptik uses shamir secret sharing and symmetric encryption to improve wallet security. When implemented in software, the Kryptik key management system provides users with a simple wallet experience that does not require passwords or smart contracts.
