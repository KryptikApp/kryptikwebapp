---
title: "Installation"
oneLiner: "Get the Kryptik software up and running on your computer."
emoji: "🔌"
lastUpdate: "2022-10-10"
category: "getting started"
---

Kryptik is completely open source. Anyone can download the Kryptik software from Github and begin making modifications. There are two primary repositories for developers: the Kryptik seedloop and the Kryptik web interface. This guide will cover the installation process for both repositories.

Note: this guide assumes you have a working version of Yarn, a common package manager. If you do not have Yarn, you can follow the Yarn [installation guide](https://classic.yarnpkg.com/lang/en/docs/install/#windows-stable).

# Kryptik Seedloop

Kryptik Seedloop is an asymmetric key manager. The code allows users to sign transactions and generate addresses across multiple networks from a single seed. Kryptik Seedloop can be downloaded as an NPM package for immediate integration within your project. Otherwise, you can follow the steps below to start contributing to the Kryptik Seedloop codebase.

### 1. Clone the Repository

```bash
git clone [repo url]
```

You can also fork the repository using 'git fork'.

### 2. Install Dependencies

```bash
yarn
```

### 3. Test the Installation

```bash
yarn test
```

This will run unit tests on the codebase. If installation was successful, there should be all green checkmarks.

# Kryptik Web Wallet

The Kryptik Web Wallet is a browser based wallet that allows users to send, save, and collect digital assets. The current web interface can be found [here](https://kryptik.app/). The steps below will help you begin development on the Kryptik Web Wallet.

### 1. Clone the Repository

```bash
git clone [repo url]
```

You can also fork the repository using 'git fork'.

### 2. Install Dependencies

```bash
yarn
```

### 3. Add .env File

This file will contain variables required to run the app. Follow the [example .env file](https://github.com/KryptikApp/kryptikwebapp/blob/main/.env.example) to structure your variables.

### 4. Run Locally

```bash
yarn dev
```

This command will pop open a local version of the wallet.

You can also fork the repository using 'git fork'.

> ### You're All Set
>
> You can now begin contributing to the Kryptik wallet. Keep exploring the dev docs for a better understanding of how Kryptik works.
