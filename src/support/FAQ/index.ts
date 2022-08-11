import { IQuestionAnswer } from "./models";

export const FAQs:IQuestionAnswer[] = [
    {
        question:"Is the Kryptik Wallet noncustodial?",
        answer:"Yes! Absolutely. We never touch your private keys. All actions that require your permission (like sending money or swapping coins) are done on your device."
    },
    {
        question:"How many networks does the Kryptik wallet support?",
        answer:"The Kryptik wallet supports over ten different blockchains. Supported chains include layer one networks like Ethereum, Solana, Avalanche, and Near and ‘layer twos’ like Optimism and Arbitrum. "
    },
    {
        question:"Is the code open source?",
        answer:"Absolutely! Every single line of code is available to the public via Github. This helps with security and providing users the best possible experience. "
    },
    {
        question:"Are there fees?",
        answer:"Nope. The Kryptik wallet is free to use. "
    },
    {
        question:"Why do I need an email? ",
        answer:"Your email is used to help with authentication. Instead of reusing an old password, you can login with email verification. When combined with on device encryption, this helps keep your funds secure. You can also make your account ‘public’, so other Kryptik wallets can pay you via your email address."
    },
    {
        question:"Can I connect to other applications (DApps)?",
        answer:"Not right now. This will be possible when we launch a mobile app."
    },
    {
        question:"What can I do with the Kryptik wallet?",
        answer:"With the Kryptik wallet, you can send money, collect NFTs, swap tokens, and earn yield. Oh yea, and you can do this across 10+ blockchains from a single interface!"
    },
    {
        question:"Will there be a mobile Kryptik wallet?",
        answer:"Yes! We are working on a simple, secure mobile app. For now, you can use the web wallet, which works well across all of your devices."
    }
]