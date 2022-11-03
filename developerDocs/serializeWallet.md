---
title: "Serialize Wallet"
oneLiner: "Serialize and deserialize your Kryptik wallet."
lastUpdate: "2022-11-2"
category: "guides"
---

Serialization compresses the Kryptik seedloop into a simple data object which is ideal for [persisting](./persistWallet) wallet state across user sessions.

```typescript
const seedloop = new HDSeedLoop();
// serialize
const serializedloop: SerializedSeedLoop = seedloop.serialize();
// deserialize
const recoveredSeedloop: HDSeedLoop = HDSeedLoop.deserialize(serializedloop);
```

You can view the _SerializedSeedLoop_ type definition [here](https://github.com/KryptikApp/kryptik-seedloop/blob/main/src/index.ts#L63).
