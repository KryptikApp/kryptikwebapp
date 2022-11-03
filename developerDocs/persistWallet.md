---
title: "Persist Wallet"
oneLiner: "Persist your Kryptik wallet across user sessions."
lastUpdate: "2022-11-2"
category: "guides"
---

[Serialized](./serializeWallet) wallets can easily be persisted in local storage as a JSON string and deserialized to restore the complete wallet.

## Serialize and Persist

When stored in memory, the wallet should be [locked](./lockWallet.md) or the serialized seedloop string should be encrypted. The following example locks the wallet before storage.

```typescript
const seedloop = new HDSeedLoop();
// lock
const passphrase: string = "yourpassword";
seedloop.addPassword(passphrase);
seedloop.lock();
// serialize
const serializedloop: SerializedSeedLoop = seedloop.serialize();
// convert to JSON string
const seedloopString: string = JSON.stringify(seedloopSerialized);
// save in local storage
localStorage.setItem("kryptikWallet", seedloopString);
```

## Deserialize

This example retrieves and deserializes a wallet from local storage. If the deserialized seedloop is locked, you must unlock the wallet before signing transactions.

```typescript
// retrieve
const seedloopStringRecovered: string | null =
  localStorage.getItem("kryptikWallet");
// ensure local storage returned a value
if (seedloopStringRecovered == null) {
  throw new Error(`Unable to fetch serialized seedloop from storage.`);
}
// parse
const serializedloopRecovered: SerializedSeedLoop = JSON.parse(
  seedloopStringRecovered
);
// deserialize
const recoveredSeedloop: HDSeedLoop = HDSeedLoop.deserialize(
  serializedloopRecovered
);
// unlock
const passphrase: string = "yourpassword";
recoveredSeedloop.unlock(passphrase);
```
