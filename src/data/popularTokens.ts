import type { Token } from '@/store/walletStore';

export type PopularToken = Omit<Token, 'id' | 'balance'>;

/**
 * Curated lists of popular tokens per chain.
 * Contract addresses are checksummed mainnet addresses.
 */
export const POPULAR_TOKENS: Record<number, PopularToken[]> = {
  // ─── Ethereum (1) ──────────────────────────────────────────────
  1: [
    { name: 'USD Coin', symbol: 'USDC', contractAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', decimals: 6, chainId: 1 },
    { name: 'Tether USD', symbol: 'USDT', contractAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7', decimals: 6, chainId: 1 },
    { name: 'Dai', symbol: 'DAI', contractAddress: '0x6B175474E89094C44Da98b954EedeAC495271d0F', decimals: 18, chainId: 1 },
    { name: 'Wrapped BTC', symbol: 'WBTC', contractAddress: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', decimals: 8, chainId: 1 },
    { name: 'Wrapped Ether', symbol: 'WETH', contractAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', decimals: 18, chainId: 1 },
    { name: 'Chainlink', symbol: 'LINK', contractAddress: '0x514910771AF9Ca656af840dff83E8264EcF986CA', decimals: 18, chainId: 1 },
    { name: 'Uniswap', symbol: 'UNI', contractAddress: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', decimals: 18, chainId: 1 },
    { name: 'Aave', symbol: 'AAVE', contractAddress: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9', decimals: 18, chainId: 1 },
    { name: 'Lido DAO', symbol: 'LDO', contractAddress: '0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32', decimals: 18, chainId: 1 },
    { name: 'Arbitrum', symbol: 'ARB', contractAddress: '0xB50721BCf8d664c30412Cfbc6cf7a15145234ad1', decimals: 18, chainId: 1 },
    { name: 'Maker', symbol: 'MKR', contractAddress: '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2', decimals: 18, chainId: 1 },
    { name: 'Curve DAO', symbol: 'CRV', contractAddress: '0xD533a949740bb3306d119CC777fa900bA034cd52', decimals: 18, chainId: 1 },
    { name: 'Pepe', symbol: 'PEPE', contractAddress: '0x6982508145454Ce325dDbE47a25d4ec3d2311933', decimals: 18, chainId: 1 },
    { name: 'Shiba Inu', symbol: 'SHIB', contractAddress: '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE', decimals: 18, chainId: 1 },
  ],

  // ─── Polygon (137) ─────────────────────────────────────────────
  137: [
    { name: 'USD Coin', symbol: 'USDC', contractAddress: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359', decimals: 6, chainId: 137 },
    { name: 'Tether USD', symbol: 'USDT', contractAddress: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', decimals: 6, chainId: 137 },
    { name: 'Wrapped Ether', symbol: 'WETH', contractAddress: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619', decimals: 18, chainId: 137 },
    { name: 'Wrapped MATIC', symbol: 'WMATIC', contractAddress: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270', decimals: 18, chainId: 137 },
    { name: 'Aave', symbol: 'AAVE', contractAddress: '0xD6DF932A45C0f255f85145f286eA0b292B21C90B', decimals: 18, chainId: 137 },
    { name: 'Chainlink', symbol: 'LINK', contractAddress: '0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39', decimals: 18, chainId: 137 },
    { name: 'QuickSwap', symbol: 'QUICK', contractAddress: '0xB5C064F955D8e7F38fE0460C556a72987494eE17', decimals: 18, chainId: 137 },
    { name: 'Dai', symbol: 'DAI', contractAddress: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063', decimals: 18, chainId: 137 },
  ],

  // ─── Arbitrum One (42161) ──────────────────────────────────────
  42161: [
    { name: 'USD Coin', symbol: 'USDC', contractAddress: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', decimals: 6, chainId: 42161 },
    { name: 'Tether USD', symbol: 'USDT', contractAddress: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', decimals: 6, chainId: 42161 },
    { name: 'Wrapped Ether', symbol: 'WETH', contractAddress: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', decimals: 18, chainId: 42161 },
    { name: 'Arbitrum', symbol: 'ARB', contractAddress: '0x912CE59144191C1204E64559FE8253a0e49E6548', decimals: 18, chainId: 42161 },
    { name: 'GMX', symbol: 'GMX', contractAddress: '0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a', decimals: 18, chainId: 42161 },
    { name: 'MAGIC', symbol: 'MAGIC', contractAddress: '0x539bdE0d7Dbd336b79148AA742883198BBF60342', decimals: 18, chainId: 42161 },
    { name: 'Dai', symbol: 'DAI', contractAddress: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1', decimals: 18, chainId: 42161 },
  ],

  // ─── Optimism (10) ─────────────────────────────────────────────
  10: [
    { name: 'USD Coin', symbol: 'USDC', contractAddress: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85', decimals: 6, chainId: 10 },
    { name: 'Tether USD', symbol: 'USDT', contractAddress: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58', decimals: 6, chainId: 10 },
    { name: 'Wrapped Ether', symbol: 'WETH', contractAddress: '0x4200000000000000000000000000000000000006', decimals: 18, chainId: 10 },
    { name: 'Optimism', symbol: 'OP', contractAddress: '0x4200000000000000000000000000000000000042', decimals: 18, chainId: 10 },
    { name: 'Dai', symbol: 'DAI', contractAddress: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1', decimals: 18, chainId: 10 },
    { name: 'Chainlink', symbol: 'LINK', contractAddress: '0x350a791Bfc2C21F9Ed5d10980Dad2e2638ffa7f6', decimals: 18, chainId: 10 },
  ],

  // ─── BNB Smart Chain (56) ──────────────────────────────────────
  56: [
    { name: 'Tether USD', symbol: 'USDT', contractAddress: '0x55d398326f99059fF775485246999027B3197955', decimals: 18, chainId: 56 },
    { name: 'USD Coin', symbol: 'USDC', contractAddress: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', decimals: 18, chainId: 56 },
    { name: 'Wrapped BNB', symbol: 'WBNB', contractAddress: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', decimals: 18, chainId: 56 },
    { name: 'PancakeSwap', symbol: 'CAKE', contractAddress: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82', decimals: 18, chainId: 56 },
    { name: 'Dai', symbol: 'DAI', contractAddress: '0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3', decimals: 18, chainId: 56 },
    { name: 'Chainlink', symbol: 'LINK', contractAddress: '0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD', decimals: 18, chainId: 56 },
  ],

  // ─── Avalanche C-Chain (43114) ─────────────────────────────────
  43114: [
    { name: 'USD Coin', symbol: 'USDC', contractAddress: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E', decimals: 6, chainId: 43114 },
    { name: 'Tether USD', symbol: 'USDT', contractAddress: '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7', decimals: 6, chainId: 43114 },
    { name: 'Wrapped AVAX', symbol: 'WAVAX', contractAddress: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7', decimals: 18, chainId: 43114 },
    { name: 'Wrapped Ether', symbol: 'WETH.e', contractAddress: '0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB', decimals: 18, chainId: 43114 },
    { name: 'Chainlink', symbol: 'LINK.e', contractAddress: '0x5947BB275c521040051D82396571985b38CC5e51', decimals: 18, chainId: 43114 },
  ],

  // ─── Base (8453) ───────────────────────────────────────────────
  8453: [
    { name: 'USD Coin', symbol: 'USDC', contractAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', decimals: 6, chainId: 8453 },
    { name: 'Wrapped Ether', symbol: 'WETH', contractAddress: '0x4200000000000000000000000000000000000006', decimals: 18, chainId: 8453 },
    { name: 'Dai', symbol: 'DAI', contractAddress: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb', decimals: 18, chainId: 8453 },
    { name: 'Coinbase Wrapped BTC', symbol: 'cbBTC', contractAddress: '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf', decimals: 8, chainId: 8453 },
  ],

  // ─── Fantom (250) ──────────────────────────────────────────────
  250: [
    { name: 'USD Coin', symbol: 'USDC', contractAddress: '0x04068DA6C83AFCFA0e13ba15A6696662335D5B75', decimals: 6, chainId: 250 },
    { name: 'Wrapped FTM', symbol: 'WFTM', contractAddress: '0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83', decimals: 18, chainId: 250 },
    { name: 'Wrapped Ether', symbol: 'WETH', contractAddress: '0x74b23882a30290451A17c44f4F05243b6b58C76d', decimals: 18, chainId: 250 },
    { name: 'Dai', symbol: 'DAI', contractAddress: '0x8D11eC38a3EB5E956B052f67Da8Bdc9bef8Abf3E', decimals: 18, chainId: 250 },
  ],

  // ─── Gnosis (100) ──────────────────────────────────────────────
  100: [
    { name: 'USD Coin', symbol: 'USDC', contractAddress: '0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83', decimals: 6, chainId: 100 },
    { name: 'Wrapped xDAI', symbol: 'WXDAI', contractAddress: '0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d', decimals: 18, chainId: 100 },
    { name: 'Wrapped Ether', symbol: 'WETH', contractAddress: '0x6A023CCd1ff6F2045C3309768eAd9E68F978f6e1', decimals: 18, chainId: 100 },
  ],
};
