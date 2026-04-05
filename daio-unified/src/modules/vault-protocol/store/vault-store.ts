// DAIO Vault Protocol — Zustand Store
// Persists metadata only — NEVER stores secrets or shards

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  VaultState,
  VaultMetadata,
  HoneypotVault,
  HoneypotTrigger,
  ReconstructionAttempt,
} from "../types";
import { verifyVaultMetadataIntegrity } from "../utils/vault-crypto";

export const useVaultStore = create<VaultState>()(
  persist(
    (set) => ({
      vaults: [],
      honeypots: [],
      attempts: [],

      addVault: (metadata: VaultMetadata) =>
        set((state) => ({
          vaults: [...state.vaults, metadata],
        })),

      removeVault: (vaultId: string) =>
        set((state) => ({
          vaults: state.vaults.filter((v) => v.id !== vaultId),
          honeypots: state.honeypots.filter((h) => h.parentVaultId !== vaultId),
        })),

      addHoneypot: (honeypot: HoneypotVault) =>
        set((state) => ({
          honeypots: [...state.honeypots, honeypot],
        })),

      recordAttempt: (attempt: ReconstructionAttempt) =>
        set((state) => ({
          attempts: [...state.attempts, attempt],
        })),

      triggerHoneypot: (honeypotId: string, trigger: HoneypotTrigger) =>
        set((state) => ({
          honeypots: state.honeypots.map((h) =>
            h.id === honeypotId
              ? {
                  ...h,
                  triggered: true,
                  triggerLog: [...h.triggerLog, trigger],
                }
              : h
          ),
        })),

      clearAll: () =>
        set({
          vaults: [],
          honeypots: [],
          attempts: [],
        }),
    }),
    {
      name: "daio-vault-protocol",
      partialize: (state) => ({
        vaults: state.vaults,
        honeypots: state.honeypots,
        attempts: state.attempts,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        // Verify metadata integrity on load — flag tampered vaults
        for (const vault of state.vaults) {
          verifyVaultMetadataIntegrity(vault).then((valid) => {
            if (!valid) {
              console.error(
                `[DAIO] Vault ${vault.id} metadata integrity check FAILED — possible tampering`
              );
            }
          }).catch(() => {
            console.error(`[DAIO] Vault ${vault.id} integrity check error`);
          });
        }
      },
    }
  )
);
