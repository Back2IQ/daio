# DAIO Dead Man's Switch – "Waterproof" Specification

This document defines the technical and regulatory-compliant architecture for the DAIO Dead Man's Switch (DMS), ensuring "Orchestration without Custody" (MiCA-compliant) and high failure tolerance through tiered escalation and "Proof of Life" (PoL).

## 1. Principles of "Waterproof" Governance

To avoid being classified as a **CASP (Crypto-Asset Service Provider)** under **MiCA** (Custody/Administration of Assets), the DAIO DMS follows these core principles:

- **No Custody**: The server never holds the full private key or seed phrase.
- **Client-Side Orchestration**: Key fragments are encrypted on-device (AES-256) and split via Shamir's Secret Sharing (SSS) before being dispatched.
- **Regulatory Honesty**: The system acts as a decentralized notification and delivery service, not a financial intermediary.

## 2. Escalation & Proof of Life (PoL)

The DMS operates on a 4-stage escalation chain to prevent irreversible accidental triggers.

### Stage 1: Warning 1 (Soft Alert)
- **Trigger**: 75% of the selected interval passed (e.g., 2.25 months for a 3-month timer).
- **Action**: Push Notification + Email alert.
- **Reset**: Any app open or active "Check-In" resets the timer to zero.

### Stage 2: Warning 2 (Critical Alert)
- **Trigger**: 90% of the interval passed.
- **Action**: High-priority Email + SMS (if configured). Dashboard displays a prominent warning banner.
- **Reset**: PIN/Biometric authentication required to reset.

### Stage 3: Proof of Life (Hard Block)
- **Trigger**: 100% of the interval passed.
- **Status**: `warning_3` (Proof of Life Required).
- **Grace Period**: 14 days.
- **Requirement**: The user **must** perform a "Proof of Life" confirmation (e.g., Biometric Auth + Signing a non-custodial message).
- **Failure**: If PoL is not provided within the grace period, the system moves to the Final Trigger.

### Stage 4: Final Trigger (Irreversible)
- **Trigger**: PoL grace period expired.
- **Action**: Encrypted SSS fragments are sent to defined beneficiaries (Heirs, Notaries, Guardians).
- **Audit**: Log entry created: "DMS_TRIGGERED_SUCCESS".

## 3. Key Distribution (SSS Architecture)

1. **Splitting**: Seed phrase split into $n$ fragments (e.g., 5) with a threshold $k$ (e.g., 3).
2. **Encryption**: Each fragment is encrypted with a unique **Inheritance Password** (chosen by the user and shared offline with heirs).
3. **Storage**: Fragments are stored in the "Orchestration Gate" (Encrypted on server/S3).
4. **Release**: Only upon Stage 4 firing, the server releases the download URLs/keys to the heirs' registered communication channels.

## 4. Failure Mitigation

- **Vacation Mode**: User can set a "Travel Pause" which requires a future re-activation date, preventing DMS firing during long offline periods.
- **Multi-Channel Warning**: Mail, Push, and optionally SMS or automated voice call to ensure the user is reached.
- **Guardian Override**: If configured, a "Guardian" can pause the countdown for 30 days if they know the user is safe but offline.

## 5. Implementation Roadmap (Technical)

- [x] Define `DeadManSwitchStatus` types.
- [ ] Implement `checkDmsStatus()` logic in `wallet-store.ts`.
- [ ] Create `ProofOfLife` component in `app/daio-shield/`.
- [ ] Backend cron job for checking `nextCheckIn` timestamps and triggering alerts.
