---
title: "Seeds"
oneLiner: "Public key cryptography grows from random seeds."
emoji: "🌱"
lastUpdate: "2022-10-11"
category: "getting started"
---

A seed is a string of randomness. As a seed grows in length and randomness, the less likely it is to be guessed by an attacker.

Most wallets use seeds with 256 bits of entropy. As a reminder, a bit refers to two distinct possibilities. When combined in a string, the number of possible seed permutations grows exponentially. For example, if a seed has 8 bits of entropy, there are 2^8 (256) possibilities of what it could be. With 256 bits of entropy, there are 2^256 possible seeds\*, which is way more than the number of atoms in the observable universe!

On a computer, seeds are stored as a long string of 1's and 0's: commonly referred to as bits. However, a seed can also be represented as a mnemonic phrase where each word represents a portion of randomness. The specification for mnemonic phrases, including the list of possible words, is described by [BIP39](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki).

\* Note: the effective number of seeds for protocols like Bitcoin and ethereum is less than 2^256. This is a result of a hash algorithm that reduces the number of bits to 160. Read [this article](http://www.talkcrypto.org/blog/2019/04/08/all-you-need-to-know-about-2256/) for a detailed explanation.

> Example Mnemonic Phrase
>
> more distance interest undo ball goddess bottom neutral cannon setup abuse damage
