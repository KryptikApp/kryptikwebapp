---
title: "Asymmetric Cryptography"
oneLiner: "Public-private key pairs give everyone access to privacy and ownership."
image: "/blog/publicKeyGradient.jpg"
lastUpdate: "2022-10-23"
category: "Technology"
contributorId: "jett"
tags: ["cryptography", "internet", "computers"]
---

For the past fifty years, many of the smartest humans on Earth have been building the internet. So far, change has been rapid. Million dollar mainframes have become front-pocket mainstays, iphones are as common as toasters, and conversations that once took weeks and a postage stamp now take milliseconds and an internet connection. Distances are shrinking, opportunities are opening and none of it would be possible without asymmetric cryptography.

## History of a Secret

Humans have been keeping secrets long before the internet. In Rome, Julius Caesar shared secrets by shifting the alphabet three spaces. The ‘Caesar Cipher’ uses the same key to encrypt and decrypt messages and is a form of symmetric cryptography.

In the 1940's, the Germans used symmetric cryptography to share battle plans and war strategy. The [Enigma](https://bletchleypark.org.uk/our-story/enigma/) cipher was eventually broken by a global team of scientists and supercomputers that included Alan Turing and Polish ‘Bombas’. While the Nazi cipher system kept secrets for over two deades, it required daily key lists and top-secret code books. In addition, the Enigma relied on custom machinery that cost millions of dollars to manufacture. The Enigma may have been useful for a national bureaucracy run by the Nazis, but it was completely unusable for regular people.

**Enigma Requirements:**

- Custom Machinery
- Top Secret Codebooks
- Daily Key Lists
- National coordination
- Multiple secure channels

In 1974, Whitfield Diffie and Martin Hellman changed everything. Their new system— [asymmetric cryptography](https://ee.stanford.edu/~hellman/publications/24.pdf)— allowed public keys to be shared with anyone, eliminating the need for custom hardware and code books. With a bit of math and a dash of insight, Diffie and Hillman created a way for peers to share secrets without the burden of bureaucracy. Public key cryptography is now embedded within the fabric of the internet and used by billions people around the world.

## Public Crypto 101

Asymmetric cryptography uses public-private key pairs. The two primary functions of key pairs are encryption and digital signatures.

#### Encryption

Public keys can be shared and are used to encrypt messages, but only those who know the private key can decrypt the incoming message. Encryption helps preserve privacy and draws a strong boundary between what is personal and what is public.

#### Digital Signatures

Private keys can be used to create unique signatures that verify the authenticity of messages. Signatures prove ownership and can be validated by anyone who has access to the sender’s public key.

| Public Key        | Private Key      |
| ----------------- | ---------------- |
| Share with anyone | Keep to yourself |
| Encrypt Message   | Decrypt Message  |
| Verify Signature  | Create Signature |

When combined, public-private key pairs provide ownership and privacy: both of which are essential for interacting online.

## Applications

Public-private key pairs are woven into the fabric of the internet and for good reason: privacy and ownership make the internet a better place to protect value and share ideas. Here are a few examples of applications that use asymmetric cryptography.

- **HTTPS:** HTTPS uses public key encryption to send messages between websites and your browser. HTTPS is essential for sensitive activities like logging into email or your bank account.

- **Signal:** Messaging apps like [Signal](https://signal.org/) use public key encryption to ensure messages stay between you and your intended recipient.

- **Bitcoin:** Blockchains like [Bitcoin](https://bitcoin.org/bitcoin.pdf) use private keys to sign transactions. Public keys are used as payment ‘addresses’.

**Bottom Line:** If you use the internet, you use asymmetric cryptography.

## The Promise

With public-private keys, we can unlock a world where ownership and privacy are the default. Whether you’re nineteen in New York or ninety in New Delhi, you have cryptographic superpowers that were once exclusive to national bureaucracies.
Privacy and ownership in your hands. No third party handcuffs. No misplaced trust. Just verifiable ownership that you control.

## The Problem

Most of us have surrendered our right to online privacy and ownership. We’re back to a permissioned society that relies on third party gatekeepers:

- Google can read your messages, but it's still the most popular email system.

- Facebook has a horrendous privacy track record, but it’s still the most popular social network.

- Blockchains offer a peer-to-peer cash system, but the majority of transfers are between custodial exchanges.

The internet relies on a peer to peer connection between computers. But the majority of services we use everyday are centralized. We surrender our privacy and ownership to corporations, because it’s easy. Because companies like Google, Facebook, and Coinbase offer a tremendous amount of value for free.

As consumers, we have surrendered our keys and the gatekeepers became kings. Our content, our messages, and our value are controlled by someone else with different incentives. When we rely on gatekeepers to manage our online experience, we trust they won’t close the gate. We trust they won’t read our messages. We trust they won’t share our data. We trust, we trust, we trust.

## What if….

But what if we had…

- Private messages by default
- Portable social profiles that we control
- Global money transfers in seconds, for pennies

Asymmetric cryptography has given us the keys to an online kingdom: a world where we control what we share and what we own. But it’s up to us as builders to make this dream a reality. The status quo won’t change until everyone has a public-private key pair that can be used with ease.

If we don’t take action soon, then third party gates will become a cage and we won’t be able to get out, because we let someone else hold our asymmetric keys.
