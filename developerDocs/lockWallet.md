---
title: "Lock Wallet"
oneLiner: "Encrypt your wallet with a custom password."
lastUpdate: "2022-10-29"
category: "guides"
---

You can use a password to lock your wallet. When locked, your seed is encrypted and stored as ciphertext.

While locked, the Kryptik wallet cannot:

- sign transactions
- generate new accounts
- fetch mnemonic
- add a new password

```typescript
const passphrase: string = "yourpassword";
seedloop.addPassword(passphrase);
seedloop.lock();
```

The _addPassword_ method only needs to be ran once. To relock your wallet with the original password, just call the _lock_ method.
