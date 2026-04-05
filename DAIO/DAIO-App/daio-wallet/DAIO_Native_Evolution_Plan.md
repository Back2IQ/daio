# DAIO Wallet (Native) – Evolution Plan

This plan outlines the "waterproof" refinement and future expansion of the DAIO Wallet (Expo/React Native). The focus is on moving from a feature-rich prototype to a production-ready, blockchain-integrated mobile application.

## 1. Essential Basics (Current Core)
- **DAIO Score System**: 0-100 readiness assessment based on inheritance configuration.
- **5-Role Ecosystem**: Owner, Heir, Guardian, Notary, and Manager.
- **Waterproof DMS**: 4-stage escalation chain with "Proof of Life" (PoL) grace period.
- **Inheritance Container**: Multi-level digital legacy metadata (Levels 1-3).
- **Transfer Gate Protocol**: Structured vertical timeline for inheritance execution.

## 2. Improvements (Roadmap)

### Phase 1: Real-World Readiness
- **Blockchain Integration**:
  - Replace mock data in `wallet-store.ts` with real RPC calls using `viem` or `ethers.js`.
  - Support for 7 networks (Ethereum, Sepolia, Polygon, BNB, Avalanche, Optimism, Arbitrum).
- **Language Unification**:
  - Transition all UI and logic from German to English (Global-First approach).
- **Transaction Simulation**:
  - Implement gas estimation and pre-transaction simulation (viem `simulateContract`).

### Phase 2: Security & UX Polish
- **Security Features**:
  - **Visibility Auto-Lock**: Automatically lock the wallet after 30s in the background.
  - **Delete Confirmations**: Add "AlertDialog" prompts for removing beneficiaries/guardians.
- **Validation**:
  - EIP-55 checksum validation for all addresses.

### Phase 3: Advanced Ecosystem (Competitive Edge)
- **Connectivity**: WalletConnect integration via Reown (Web3Wallet).
- **DEX Integration**: Built-in swaps (0x / 1inch aggregator).
- **Notifications**: Mobile Push Notifications for DMS warnings and transaction alerts.
- **Social Recovery**: Guardian-based key reconstruction UI.

## 3. Implementation Checklist

- [ ] Transition `app/` and `components/` to English.
- [ ] Add `viem` and configure RPC clients in `lib/blockchain.ts`.
- [ ] Implement `visibilitychange` auto-lock in `app/_layout.tsx`.
- [ ] Replace `MOCK_TOKENS` with live balance fetching.
- [ ] Add delete confirmation dialogs to `app/(tabs)/shield.tsx`.
