---
title: "Create a Wallet"
oneLiner: "Initialize a multichain wallet using the Kryptik seedloop."
lastUpdate: "2022-10-27"
category: "guides"
---

Before you begin signing transactions, you need to initialize the Kryptik Seedloop. Once initialized, the Kryptik seedloop will allow you to interact across multiple networks.

### Initialize With Mnemonic

Kryptik seedloop accepts 12 or 24 word mnemonic phrases that conform to the [BIP39](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki) specification. Valid mnemonic phrases are used as a [seed](./seed) to generate accounts and sign transactions.

```typescript
// replace with your mnemonic phrase
const m: string =
  "brain surround have swap horror body response double fire dumb bring hazard";
const seedLoop: HDSeedLoop = new HDSeedLoop({ mnemonic: m });
```

### Autogenerate Mnemonic

If no mnemonic is provided, a random mnemonic phrase will be generated using local entropy.

```typescript
// mnemonic will be automatically generated
const seedLoop: HDSeedLoop = new HDSeedLoop();
```
