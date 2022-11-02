---
title: "Sign Solana Transaction"
oneLiner: "Sign a Solana transfer transaction with the Kryptik seedloop."
lastUpdate: "2022-11-1"
category: "guides"
---

A Solana transaction includes instructions that update the state of the Solana blockchain. Each Solana transaction is serialized and signed as a buffer before being submitted to a node.

### Transaction Example

This example builds and signs a simple Solana transfer transaction.

```typescript
import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import HDSeedLoop, { Network } from "hdseedloop";

const seedLoop: HDSeedLoop = new HDSeedLoop({ mnemonic: m });
const networkSol: Network = NetworkFromTicker("sol");

let fromPubKey: PublicKey = new PublicKey(fromAddress);
let toPubKey: PublicKey = new PublicKey(toAddress);
// add transfer instructions to transaction
let transaction: Transaction = new Transaction().add(
  SystemProgram.transfer({
    fromPubkey: fromPubKey,
    toPubkey: toPubKey,
    // send 1 sol to recipient
    lamports: 1000000000, //Remember 1 Lamport = 10^-9 SOL.
  })
);
// get most recent block hash
const lastBlockHash = await txIn.kryptikProvider.solProvider.getLatestBlockhash(
  "finalized"
);
transaction.recentBlockhash = lastBlockHash.blockhash;
transaction.feePayer = fromPubKey;
// sign transaction with seedloop
const kryptikTxParams: TransactionParameters = {
  transactionBuffer: transaction.serializeMessage(),
};
// sign sol transaction
const signature = await seedLoop.signTransaction(
  sendAccount,
  kryptikTxParams,
  network
);
// ensure signature was created
if (!signature.solanaFamilyTx) {
  throw new Error(
    `Error: Unable to create signature for ${network.fullName} transaction`
  );
}
let sigBuffer = Buffer.from(signature.solanaFamilyTx);
// add signature to transaction
txSol.addSignature(pubkey, sigBuffer);
```
