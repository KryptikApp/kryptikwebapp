---
title: "Sign Ethereum Transaction"
oneLiner: "Sign an Ethereum transfer transaction with the Kryptik seedloop."
lastUpdate: "2022-11-1"
category: "guides"
tags: ["Ethereum"]
---

Ethereum transactions interact with contracts that run on the Ethereum Virtual Machine (EVM). The Kryptik seedloop signs EVM compatible transactions with the SECP256K1 signature scheme.

### Transaction Example

This example builds and signs a simple Ethereum transfer transaction.

```typescript
import { TransactionRequest } from "@ethersproject/abstract-provider";
import HDSeedLoop, { Network, SignedTransaction } from "hdseedloop";

const seedloop = new HDSeedLoop();
const networkEth: Network = NetworkFromTicker("eth");
seedloop.addAddresses(networkEth, 1);
// default to first address as 'from address'
const address = seedloop.getAddresses(networkEth)[0];
// fill in tx with arbitrary values
const tx: TransactionRequest = {
  to: "0x0000000000000000000000000000000000000000",
  from: address,
  value: 300000,
  gasLimit: 300000,
  gasPrice: 300000,
  nonce: 300000,
  type: 1,
};
const signedTx = await seedloop.signTransaction(
  address,
  { evmTransaction: tx },
  networkEth
);
// ensure signature was created
if (!signature.evmFamilyTx) {
  throw new Error(
    `Error: Unable to create signature for ${network.fullName} transaction`
  );
}
// signed tx can now be posted to the blockchain
const txEth: string = signature.evmFamilyTx;
```
