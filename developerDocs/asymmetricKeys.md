---
title: "Asymmetric Keys"
oneLiner: "Asymmetric key pairs power the decentralized internet."
emoji: "🗝️"
lastUpdate: "2022-10-8"
category: "core concepts"
---

Asymmetric cryptography refers to cryptographic systems that rely on key pairs. Each key pair contains a public and a private key. Public keys can be shared and are used to encrypt messages, but only those who know the private key can decrypt the incoming message. Private keys can also be used to create unique signatures that can verify the authenticity of messages.

Asymmetric cryptography has enabled encrypted communication and global computing protocols like Ethereum. But managing keys is hard. Existing noncustodial key management solutions require memorizing long mnemonic phrases, using network specific smart contracts, or purchasing complicated hardware wallets. These solutions are insufficient for the majority of users who are looking for a simple way to manage private keys.

The goal of Kryptik is to provide a simple asymmetric key management system for blockchain users. By default, a single private key can be used to generate signatures and transactions across multiple networks. In addition, Kryptik uses distributed secret sharing to make the wallet authentication process as simple and secure as possible. The rest of the docs dive deeper into how each of these methods are implemented.
