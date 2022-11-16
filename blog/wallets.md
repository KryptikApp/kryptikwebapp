---
title: "Digital Wallets"
oneLiner: "Digital wallets store sensitive secrets and billions of dollars. Threshold cryptography improves wallet security."
image: "/blog/kryptikShareholderRing.jpg"
lastUpdate: "2022-11-15"
category: "Technology"
contributorId: "jett"
tags: ["cryptography", "internet", "computers", "keys"]
---

The internet relies on a peer to peer connection between computers, but the majority of services we use everyday are centralized. While corporations like Chase and Facebook are easy to use, centralized convenience often comes at the cost of privacy and ownership.

Since the development of Bitcoin in 2009 there has been a major push to make the internet more decentralized. Blockchains like Bitcoin and Ethereum promise to shift power from the few to the many, opening a new frontier of digital exploration.

A few examples of popular blockchain apps are shown below:

- **Augur.** A prediction market for betting on real world events like sports games and election outcomes.
- **Opensea.** A marketplace for digital collectibles.
- **Lens.** A user controlled social media platform. Developers can use a common interface
- **AAVE.** Lending and borrowing with over four billion dollars in assets.
- **SIWE.** One click login using an Ethereum account.
- **Uniswap.** A decentralized exchange for digital currencies.
- **IPFS.** Store files on a global network of computers.

Each of these applications requires a digital wallet that can send and sign transactions. Since 2009, over one hundred million wallets have been created around the world.

## Random Seeds

At the core of every wallet is a single seed: a string of randomness. As a seed grows in length, the less likely it is to be guessed by an attacker.

Most wallets use seeds with 256 bits of entropy. In practice, this looks like a long string of ones and zeros, with each character having two distinct possibilities. The number of possible seeds grows exponentially. For example, if a seed has 8 bits of entropy, there are 2^8 (256) possibilities of what it could be. With 256 bits of entropy, there are 2^256 possible seeds, which is more than the number of atoms in the observable universe.

| **Entropy As an Image**                                                                                        |
| :------------------------------------------------------------------------------------------------------------- |
| ![Entropy as an Image](/blog/entropyAsAnImage.jpg)                                                             |
| _Entropy is a measure of randomness. The more entropy, the less likely a piece of information can be guessed._ |

Seeds are hard to guess and are an ideal source for generating public-private key pairs.

## Deterministic Wallets

Early Bitcoin clients used a random stash of keys that were used once per transaction. Once the initial supply of keys were exhausted, the backup would be invalidated; this made key management complex and insecure.

Deterministic wallets simplify key management. A single seed can generate an unlimited number of keys. However, most deterministic wallets store keypairs on a single chain. Sharing a deterministic wallet is ‘all or nothing’: sharing a single key requires sharing all keys.

## Hierarchical Deterministic Wallets

Hierarchical deterministic wallets are structured as a tree of keypairs. A single master key is stored at the root and fresh child keys are derived from a unique derivation path. Each path of the HD tree can be shared without exposing the complete tree.

| **HD Tree**                                                               |
| :------------------------------------------------------------------------ |
| ![Entropy as an Image](/blog/hdtree.jpg)                                  |
| _A tree of HD keypairs. Each branch represents a unique derivation path._ |

> For cryptocurrency wallets, each blockchain has a unique derivation path. The derivation path contains directions to a key’s location within the tree structure.

HD wallets provide a number of benefits. For example, HD Wallets permit an online shop to accept payments at a new address for each order, without giving the server access to the corresponding private keys (which are required for spending the received funds).

## Wallets Are Hard to protect

One of the best parts of HD wallets is the ability to control your own money and data. Unlike traditional banks or third party services, there is no third party holding assets on your behalf. However, with great power comes great responsibility.

> Over $100,000,000,000 worth of cryptocurrency has been permanently lost after users have lost access to their wallet.

Today, holding your own cryptographic keys requires memorizing long mnemonic phrases, trusting third party custodians, or purchasing complicated hardware wallets. These solutions are insufficient for the majority of internet users who are looking for a simple way to manage private keys.

## Common Solutions

Noncustodial wallet management is an open problem, with an inherent tradeoff between security and useability. Common solutions are shown below:

**Multisig Wallets.** A multi signature wallet requires multiple private keys to authorize transactions.

**Smart Contract Wallets.** Smart contract wallets are just a multisig with extra bells and whistles for recovery and permissions. For example, Argent— a smart contract wallet with over four million accounts— allows ‘guardians’ to replace the account owner and set permissions for value-subtracting transactions.

**Account Abstraction.** Account abstraction turns every blockchain account into a smart contract wallet. Account abstraction has yet to be implemented on major blockchains like Ethereum despite discussion since 2014.

Account abstraction and smart contract wallets have been described as a breakthrough in the security and usability of crypto wallets; However, smart contracts have significant drawbacks, explained below:

- **Network specific.** Smart contract wallets are implemented as code that runs on a single blockchain. This requires users to create a separate wallet for each blockchain which is a hassle and a security risk.
- **Time lag.** Adding guardians or transferring ownership requires a ‘security period’ that can last multiple days.
- **No UTXO support.** Smart contract wallets require turing-complete blockchains, so there is no support for transduction based networks like Bitcoin.
- **Variable fees.** Processing payments requires executing smart contract code, which can vary in cost for each wallet.
- **Upfront cost.** Smart contract wallets require an initial setup fee to pay for the creation of a new contract on the blockchain.

Large companies may benefit from the policies provided by smart contract wallets. However, smart contracts restrict wallets to a single blockchain and prevent users from accessing the full range of benefits provided by a personal public-private key pair.

## Distributed Key Management

To secure ownership and privacy across the web, we need a different way to backup asymmetric keys. Fortunately, threshold cryptography provides a neat solution. As a quick reminder, threshold cryptography protects information by splitting pieces of a secret between a group.

For the past year, I have been developing an open source wallet (Kryptik) that uses a combination of encryption and secret sharing for authentication and account recovery.

**Kryptik Key Management.** Instead of relying on a smart contract with trusted guardians, Kryptik distributes shares of an encryption key to a group of shareholders; k of n shares are required to reconstruct the original secret. The encryption key is used to create an encrypted version of the wallet, which can be stored locally or in the cloud. Whenever a user wants to regain access to their wallet, the shares are reassembled and the wallet is decrypted.

| **Kryptik Shareholders**                                                                                                                                                                    |
| :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| ![Kryptik Shareholders](/blog/kryptikShareholderRing.jpg)                                                                                                                                   |
| _Kryptik key management splits a secret encryption key among n shareholders. Each share can be represented as a coordinate point and k shares are required to recover the original secret._ |

The Kryptik key management has a number of positive properties:

- **Network Agnostic.** Kryptik is network agnostic. Use any blockchain you want.
- **Quick recovery.** Account recovery takes seconds instead of days. Just log in like you would for any other app. Creating a new shareholder is also fast.
- **Multi-factor Authentication.** Verify ownership of your account with a combination of any standard authentication scheme like 2fa.
- **Predictable Fees.** Transaction verification logic is unmodified and the cost can be hard coded by applications.
- **No setup cost.** No smart contracts need to be created or paid for.

In short, Kryptik key management addresses the complexity, fees, and time delay of smart contract wallets. Furthermore, shareholders can be used for wallet recovery and authentication.
