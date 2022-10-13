---
title: "HD Wallets"
oneLiner: "The Hierarchical Deterministic key structure enables multi-currency wallets."
emoji: "🌲"
lastUpdate: "2022-10-12"
category: "getting started"
---

Hierarchical deterministic wallets can derive multiple accounts from a single seed. This allows Kryptik to offer multi-currency support and streamline the wallet experience.

## HD Tree Structure

Hierarchical deterministic keys are structured as a tree. A single master key is stored at the root and fresh child keys can be derived from a unique derivation path. The HD tree structure eliminates the need to store multiple unrelated key pairs. Instead, all Kryptik has to store is the wallet [seed](./seed) and an index for each account.

## HD Derivation Path

Each blockchain has a unique derivation path. The derivation path contains information about a key’s location within the tree structure. View [BIP44](https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki) for more information on formatting. Kryptik uses three different derivation paths which are shown below.

> ### Kryptik Derivation Paths
>
> **EVM Networks:** m/44'/60'/0'/0/0
>
> **NEAR Protocol:** m/44'/397'/0'
>
> **Solana:** m/44'/501'/0'/0'
