---
title: "Creating a Wallet"
oneLiner: "Initialize a multichain wallet using the Kryptik seedloop."
emoji: "🗝️"
lastUpdate: "2022-10-27"
category: "guides"
---

Before you begin signing transactions, you need to initialize the Kryptik Seedloop. Once initialized, the Kryptik seedloop will allow you to interact across multiple networks.

## Initialize With Mnemonic

Kryptik seedloop accepts 12 or 24 word mnemonic phrases that conform to the BIP32 specification. Mnemonics are used as a seed to generate accounts and sign transactions.

```typescript
const seedLoop = new HDSeedLoop({ mnemonic: m });
```

## Autogenerate Mnemonic

If no mnemonic is provided, a random mnemonic phrase will be generated using local entropy.

```typescript
// mnemonic will be automatically generated
const seedLoop = new HDSeedLoop();
```
