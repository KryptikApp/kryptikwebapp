export interface INamespace {
  chainId: number | string;
  name: string;
  logo: string;
  rgb: string;
  rpc: string;
}

export const defaultNamespace: INamespace = {
  chainId: 0,
  name: "Unknown",
  logo: "",
  rgb: "",
  rpc: "",
};

export const caipNamespaces: { [key: string]: INamespace } = {
  // eip155 namespaces
  "eip155:1": {
    chainId: 1,
    name: "Ethereum",
    logo: "/chain-logos/eip155-1.png",
    rgb: "99, 125, 234",
    rpc: "https://cloudflare-eth.com/",
  },
  "eip155:43114": {
    chainId: 43114,
    name: "Avalanche C-Chain",
    logo: "/chain-logos/eip155-43113.png",
    rgb: "232, 65, 66",
    rpc: "https://api.avax.network/ext/bc/C/rpc",
  },
  "eip155:137": {
    chainId: 137,
    name: "Polygon",
    logo: "/chain-logos/eip155-137.png",
    rgb: "130, 71, 229",
    rpc: "https://polygon-rpc.com/",
  },
  "eip155:10": {
    chainId: 10,
    name: "Optimism",
    logo: "/chain-logos/eip155-10.png",
    rgb: "235, 0, 25",
    rpc: "https://mainnet.optimism.io",
  },
  "eip155:5": {
    chainId: 5,
    name: "Ethereum Goerli",
    logo: "/chain-logos/eip155-1.png",
    rgb: "99, 125, 234",
    rpc: "https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
  },
  "eip155:43113": {
    chainId: 43113,
    name: "Avalanche Fuji",
    logo: "/chain-logos/eip155-43113.png",
    rgb: "232, 65, 66",
    rpc: "https://api.avax-test.network/ext/bc/C/rpc",
  },
  "eip155:80001": {
    chainId: 80001,
    name: "Polygon Mumbai",
    logo: "/chain-logos/eip155-137.png",
    rgb: "130, 71, 229",
    rpc: "https://matic-mumbai.chainstacklabs.com",
  },
  "eip155:420": {
    chainId: 420,
    name: "Optimism Goerli",
    logo: "/chain-logos/eip155-10.png",
    rgb: "235, 0, 25",
    rpc: "https://goerli.optimism.io",
  },
  // near namespaces
  "near:testnet": {
    chainId: "testnet",
    name: "NEAR Testnet",
    logo: "/chain-logos/near.png",
    rgb: "99, 125, 234",
    rpc: "https://rpc.testnet.near.org",
  },
  // solana namespaces
  "solana:4sGjMW1sUnHzSxGspuhpqLDx6wiyjNtZ": {
    chainId: "4sGjMW1sUnHzSxGspuhpqLDx6wiyjNtZ",
    name: "Solana",
    logo: "/chain-logos/solana-4sGjMW1sUnHzSxGspuhpqLDx6wiyjNtZ.png",
    rgb: "30, 240, 166",
    rpc: "",
  },
  "solana:8E9rvCKLFQia2Y35HXjjpWzj8weVo44K": {
    chainId: "8E9rvCKLFQia2Y35HXjjpWzj8weVo44K",
    name: "Solana Devnet",
    logo: "/chain-logos/solana-4sGjMW1sUnHzSxGspuhpqLDx6wiyjNtZ.png",
    rgb: "30, 240, 166",
    rpc: "",
  },
};
