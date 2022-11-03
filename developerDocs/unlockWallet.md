---
title: "Unlock Wallet"
oneLiner: "Decrypt your wallet with a password. "
lastUpdate: "2022-11-2"
category: "guides"
---

When locked, your seed is encrypted and stored as ciphertext. To unlock your wallet you will need to provide the original password.

```typescript
const seedLoop: HDSeedLoop = new HDSeedLoop();
const passphrase: string = "yourpassword";
seedloop.addPassword(passphrase);
seedloop.lock();
// decrypts wallet in place
seedloop.unlock(passphrase);
```
