import type { AssetCategory, RiskQuestion } from "../types";

export const ASSET_CATEGORIES: AssetCategory[] = [
  {
    id: "crypto",
    name: "Cryptocurrencies",
    icon: "Bitcoin",
    description: "BTC, ETH, stablecoins, DeFi positions, staking rewards",
    examples: "Bitcoin, Ethereum, Solana, USDC, Aave positions",
    globalEstimate: "$2.5T market cap",
    hasReliableLossData: true,
  },
  {
    id: "nfts",
    name: "NFTs & Digital Collectibles",
    icon: "Image",
    description: "Art, PFPs, utility NFTs, ENS domains, on-chain assets",
    examples: "CryptoPunks, BAYC, ENS names, Art Blocks",
    globalEstimate: "$8B+ traded volume",
    hasReliableLossData: false,
  },
  {
    id: "gaming",
    name: "In-Game Assets",
    icon: "Gamepad2",
    description: "Skins, characters, virtual land, in-game currencies",
    examples: "CS2 skins, Fortnite accounts, Roblox items, Minecraft servers",
    globalEstimate: "$85B gaming economy",
    hasReliableLossData: false,
  },
  {
    id: "social-media",
    name: "Social Media Channels",
    icon: "Youtube",
    description: "Monetized channels, creator accounts, audience networks",
    examples: "YouTube, TikTok, Instagram, X, Twitch, Patreon",
    globalEstimate: "$120B creator economy",
    hasReliableLossData: false,
  },
  {
    id: "domains",
    name: "Domains & Web Properties",
    icon: "Globe",
    description: "Premium domains, web properties, DNS infrastructure",
    examples: "Portfolio domains, aged domains, parked domains",
    globalEstimate: "$15B+ domain market",
    hasReliableLossData: false,
  },
  {
    id: "digital-business",
    name: "Digital Businesses",
    icon: "Store",
    description: "SaaS products, e-commerce stores, apps, newsletters",
    examples: "Shopify stores, Stripe accounts, API products, Substack",
    globalEstimate: "$200B+ digital commerce",
    hasReliableLossData: false,
  },
  {
    id: "cloud-identity",
    name: "Cloud & Identity",
    icon: "Cloud",
    description: "Cloud storage, digital identity, subscriptions",
    examples: "iCloud, Google Workspace, Microsoft 365, e-ID",
    globalEstimate: "$95B cloud services",
    hasReliableLossData: false,
  },
  {
    id: "creative-ip",
    name: "Creative IP & Royalties",
    icon: "Music",
    description: "Music rights, code repositories, patents, royalty streams",
    examples: "Spotify royalties, GitHub repos, stock photo portfolios",
    globalEstimate: "$80B IP economy",
    hasReliableLossData: false,
  },
  {
    id: "loyalty",
    name: "Loyalty & Points",
    icon: "Ticket",
    description: "Airline miles, hotel points, cashback, reward balances",
    examples: "Miles & More, Hilton Honors, PayBack, Amazon credits",
    globalEstimate: "$25B loyalty market",
    hasReliableLossData: false,
  },
  {
    id: "communities",
    name: "Communities & DAOs",
    icon: "Users",
    description: "Discord servers, DAO governance tokens, memberships",
    examples: "Discord communities, Snapshot governance, Multisig wallets",
    globalEstimate: "$15B community assets",
    hasReliableLossData: false,
  },
  {
    id: "email-accounts",
    name: "Email & Communication",
    icon: "Mail",
    description: "Email accounts, business correspondence, 2FA recovery",
    examples: "Gmail, Outlook, ProtonMail, business email",
    hasReliableLossData: false,
  },
  {
    id: "password-vaults",
    name: "Password Vaults",
    icon: "KeyRound",
    description: "Password managers — the master key to everything else",
    examples: "1Password, Bitwarden, LastPass, KeePass",
    hasReliableLossData: false,
  },
];

export const RISK_QUESTIONS: RiskQuestion[] = [
  // Crypto
  { id: "crypto-1", category: "crypto", question: "Are your private keys / seed phrases stored in a documented, secure location?", weight: 5 },
  { id: "crypto-2", category: "crypto", question: "Does at least one trusted person know how to access your crypto wallets?", weight: 5 },
  { id: "crypto-3", category: "crypto", question: "Do you have a written succession plan for your crypto holdings?", weight: 4 },
  { id: "crypto-4", category: "crypto", question: "Are your hardware wallets and PINs documented separately?", weight: 3 },

  // NFTs
  { id: "nfts-1", category: "nfts", question: "Are your NFT wallet credentials part of your succession plan?", weight: 5 },
  { id: "nfts-2", category: "nfts", question: "Have you documented which wallets hold which NFTs?", weight: 4 },
  { id: "nfts-3", category: "nfts", question: "Are marketplace accounts (OpenSea, Blur) credentials documented?", weight: 3 },

  // Gaming
  { id: "gaming-1", category: "gaming", question: "Are login credentials for gaming platforms documented?", weight: 4 },
  { id: "gaming-2", category: "gaming", question: "Does someone know the estimated value of your in-game assets?", weight: 3 },
  { id: "gaming-3", category: "gaming", question: "Are trade-locked or platform-specific transfer rules documented?", weight: 3 },

  // Social Media
  { id: "social-1", category: "social-media", question: "Are login credentials for all monetized channels documented?", weight: 5 },
  { id: "social-2", category: "social-media", question: "Is there a designated person with channel manager/admin access?", weight: 5 },
  { id: "social-3", category: "social-media", question: "Are revenue streams (AdSense, sponsorships) documented with access?", weight: 4 },
  { id: "social-4", category: "social-media", question: "Have you checked platform-specific legacy/memorialization policies?", weight: 3 },

  // Domains
  { id: "domains-1", category: "domains", question: "Are your domain registrar credentials documented?", weight: 5 },
  { id: "domains-2", category: "domains", question: "Is auto-renewal enabled and payment method succession-proof?", weight: 4 },
  { id: "domains-3", category: "domains", question: "Are DNS configurations and hosting access documented?", weight: 3 },

  // Digital Business
  { id: "biz-1", category: "digital-business", question: "Are business-critical SaaS credentials documented?", weight: 5 },
  { id: "biz-2", category: "digital-business", question: "Is there a documented handover process for your digital business?", weight: 5 },
  { id: "biz-3", category: "digital-business", question: "Are payment processor (Stripe, PayPal) accounts succession-ready?", weight: 4 },

  // Cloud & Identity
  { id: "cloud-1", category: "cloud-identity", question: "Are master credentials for cloud accounts (Google, Apple, Microsoft) documented?", weight: 5 },
  { id: "cloud-2", category: "cloud-identity", question: "Have you configured legacy contacts / inactive account managers?", weight: 4 },
  { id: "cloud-3", category: "cloud-identity", question: "Are subscription payments tied to a succession-proof payment method?", weight: 3 },

  // Creative IP
  { id: "ip-1", category: "creative-ip", question: "Are royalty stream access credentials documented?", weight: 5 },
  { id: "ip-2", category: "creative-ip", question: "Are code repositories, patents, or IP registrations in your succession plan?", weight: 4 },
  { id: "ip-3", category: "creative-ip", question: "Is there a legal assignment or licensing plan for your IP assets?", weight: 4 },

  // Loyalty
  { id: "loyalty-1", category: "loyalty", question: "Are loyalty program credentials documented?", weight: 3 },
  { id: "loyalty-2", category: "loyalty", question: "Do you know which programs allow point transfer upon death?", weight: 3 },

  // Communities
  { id: "comm-1", category: "communities", question: "Are admin/owner credentials for communities documented?", weight: 4 },
  { id: "comm-2", category: "communities", question: "Is there a co-owner or succession admin for your Discord/DAO?", weight: 4 },
  { id: "comm-3", category: "communities", question: "Are multisig wallet co-signers aware of succession protocols?", weight: 5 },

  // Email
  { id: "email-1", category: "email-accounts", question: "Are email account credentials documented in a secure location?", weight: 5 },
  { id: "email-2", category: "email-accounts", question: "Have you configured recovery contacts or legacy access?", weight: 4 },

  // Password Vaults
  { id: "vault-1", category: "password-vaults", question: "Does a trusted person have access to your master password or emergency kit?", weight: 5 },
  { id: "vault-2", category: "password-vaults", question: "Have you set up the vault's built-in emergency access feature?", weight: 5 },
];
