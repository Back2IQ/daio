# DAIO Wallet – Design Specification

## Brand Identity
- **App Name**: DAIO Wallet
- **Tagline**: "Orchestration without Custody. Governance with Defined Liability."
- **Color Palette**:
  - Primary: `#0A0E1A` (Deep Navy Black) – main background
  - Secondary: `#111827` (Dark Slate) – card backgrounds
  - Accent: `#3B82F6` (Electric Blue) – primary actions, highlights
  - Success: `#10B981` (Emerald Green) – positive states, active
  - Warning: `#F59E0B` (Amber) – warnings, pending states
  - Danger: `#EF4444` (Red) – emergency, critical alerts
  - Gold: `#F59E0B` – premium features, DAIO Score
  - Text Primary: `#F9FAFB`
  - Text Secondary: `#9CA3AF`
  - Border: `#1F2937`

## Screen List

### Onboarding & Auth
1. **Splash Screen** – Animated DAIO logo with tagline
2. **Welcome Screen** – Role selection (Owner, Erbe, Verwalter, Notar, Guardian)
3. **Create Wallet** – Seed phrase generation, backup confirmation
4. **Import Wallet** – Seed phrase import, private key import
5. **PIN Setup** – 6-digit PIN creation with biometric option
6. **Biometric Auth** – Face ID / Touch ID setup

### Main App (Tab Navigation)
7. **Dashboard (Home)** – Portfolio overview, quick actions, alerts
8. **Assets** – Multi-chain token list with balances
9. **Send/Receive** – Transaction flow with QR scanner
10. **DAIO Shield** – Inheritance & emergency protocols hub
11. **Settings** – Account, security, preferences

### Wallet Screens
12. **Token Detail** – Price chart, transaction history, send/receive
13. **Send Transaction** – Address input, amount, gas fee, confirmation
14. **Receive** – QR code display, address copy
15. **Transaction History** – Filterable list with status
16. **Swap** – Token swap interface
17. **NFT Gallery** – NFT collection display

### DAIO Shield Screens
18. **Inheritance Container** – Level 1/2/3 container setup
19. **Dead Man's Switch** – Timer configuration (3/6/12 months)
20. **Key Distribution** – Shamir Secret Sharing setup (2-of-3, 3-of-5)
21. **Emergency Protocol** – Notfall-Button configuration
22. **Beneficiaries** – Heir management with roles
23. **Multisig Setup** – Notarial Multisig Trigger configuration
24. **Audit Trail** – Complete activity log
25. **DAIO Score** – Readiness assessment (0-100)
26. **Proof of Life** – Check-in confirmation screen

### Role-Specific Screens
27. **Guardian Dashboard** – External emergency trigger
28. **Heir Portal** – Inheritance claim interface
29. **Notary Interface** – Key 1 management, death certificate upload
30. **Verwalter Panel** – Managed accounts overview

## Key User Flows

### Flow 1: Wallet Creation & Setup
Splash → Welcome (select Owner) → Create Wallet → Seed Phrase Display → Confirm Backup → PIN Setup → Biometric → Dashboard

### Flow 2: Send Crypto
Dashboard → Assets → Token Detail → Send → Enter Address → Enter Amount → Review → Biometric Confirm → Success

### Flow 3: Dead Man's Switch Setup
DAIO Shield → Dead Man's Switch → Set Timer (e.g., 6 months) → Add Warning Contacts → Configure Shamir Shares → Assign Recipients → Activate

### Flow 4: Emergency Protocol (Notfall-Button)
Guardian App → Emergency Button → Confirm Identity → Enter Reason → Send Alert → Owner gets 3 warnings → Final Trigger → Encrypted Key Fragments Sent

### Flow 5: Inheritance Claim
Heir Portal → Upload Death Certificate → Notary Verification → Multisig Activation → Key Reconstruction → Asset Transfer Gate

## Navigation Structure
```
Tab Bar:
├── Home (Dashboard)
├── Assets (Portfolio)
├── DAIO Shield (Inheritance Hub) [center, prominent]
├── History (Transactions)
└── Settings
```

## Design Principles
- **Dark Mode First**: Deep navy background for premium crypto feel
- **Security-First UX**: Biometric prompts for all sensitive actions
- **Progressive Disclosure**: Complex DAIO features revealed step-by-step
- **Status Indicators**: Color-coded DAIO Score prominently displayed
- **One-Handed Operation**: Critical actions within thumb reach
- **iOS HIG Compliance**: Native feel with SF Symbols, haptic feedback
