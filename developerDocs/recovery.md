---
title: "Recovery"
oneLiner: "Kryptik uses secret sharing to facilitate account recovery."
emoji: "🪀"
lastUpdate: "2022-12-9"
category: "core concepts"
---

Cryptocurrency wallets rely on a single seed to protect assets. Lost or stolen seeds have cost innocent users billions of dollars. Account recovery and multifactor authentication are essential safeguards for any wallet that promises to protect user funds.

## Cloud Backups are Insecure

Most wallets offer the ability to back up your seed phrase with a cloud provider like Google Drive or iCloud. However, while backups are encrypted, the encryption key is often a user-generated password. This system is not secure, given the widespread reuse of low-entropy passwords across the internet.

## Distributed Key Management

Kryptik’s web application provides passwordless authentication and account recovery. Instead of relying on trusted cloud backups, Kryptik distributes shares of an encryption key to a group of shareholders; k of n shares are required to reconstruct the original secret. The encryption key creates an encrypted version of the wallet. Whenever a user wants to regain access to their wallet, the shares are reassembled, and the wallet is decrypted.

Kryptik key management has several favorable properties:

1. **Quick recovery.** Account recovery takes seconds instead of days. Just login like you would for any other app. Creating a new shareholder is also fast.
2. **Multi-factor Authentication.** Verify ownership of your account with a combination of any standard authentication scheme like 2fa.
3. **Many Accounts.** The same device can support multiple accounts. However, only authenticated users can unlock their encrypted wallet.

## Authentication

Kryptik uses an authentication provider to generate a decentralized identifier (DID) token, which is shared via email. After validation, the DID is exchanged with the database for an access token, and the user session begins. No passwords are required.

| **Kryptik Authentication Flow**                                                                                                                 |
| :---------------------------------------------------------------------------------------------------------------------------------------------- |
| ![Kryptik Authentication Flow](/blog/authenticationFlowPlain.png)                                                                               |
| _Kryptik’s passwordless authentication flow. The DID token is sent via email. After validation, the user can access the server’s secret share._ |

## Recovery

When a new user session begins, Kryptik retrieves the database share and combines it locally to recover the original encryption secret. The wallet is then decrypted and made available for use. This arrangement results in a two-of-two security scheme, where an attacker must compromise both systems to obtain a user’s private seed.

## Implementation

The Kryptik source code is open source and implements distributed key management. A standalone reference implementation is coming soon.
