---
title: "Kryptik Research Questions"
oneLiner: "Kryptik has created a novel way to manage private keys online. These are the questions we're exploring as we continue to refine key management."
image: "/blog/questions.jpg"
lastUpdate: "2022-10-13"
category: "Research"
authorName: "Jett Hays"
authorAvatar: "/blog/contributors/jett.png"
authorRole: "Creator"
tags: [""]
---

The Kryptik wallet relies on distributed key management. Every Kryptik wallet is encrypted using a random encryption key. The encryption key is then shared between the user's device and a server using two-of-two shamir secret sharing. When a user authenticates, shares are recombined and the wallet is decrypted.

While this system has worked well, there are still open questions to explore. For the next few months, we will be continuing research on distributed key management with the goal of providing users a simple and secure wallet experience. Our primary research questions are shown below.

### Should the wallet seed or encryption key be split into shares?

Right now, wallet seeds are stored in a vault with account metadata. Vaults are locked and the encryption key is split into shamir secret shares. However, splitting and sharing the wallet seed itself may be advantageous when syncing between devices.

### What type of authentication should release the remote share?

There are many valid ways to authenticate with the remote server. Kryptik currently uses passwordless email verification to authenticate users. However, passwords and two factor authentication may be considered for additional security.

### How can the model be extended beyond a two of two threshold scheme?

Shamir secret sharing supports any _k of n_ threshold, where _k-1_ shares provide zero information on the secret. Kryptik currently uses a two of two threshold. We're interested in increasing _n_, and allowing users to store additional shares as backups across their devices.

### What are the implications for social recovery?

Social recovery allows a community to recover wallets that have been lost or stolen. Social recovery is a delicate problem that has yet to be solved, but secret sharing may provide a solution.

### Are there any applications beyond wallets that would benefit from distributed key management?

Wallets are not the only applications that rely on high value secrets. Our research will explore additional domains like identity that would benefit from distributed key management.
