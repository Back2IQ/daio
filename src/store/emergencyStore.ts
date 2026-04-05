import { useWalletStore } from './walletStore';
import type { EmergencyProtocol, AuditEntry, Transaction } from './walletStore';

export interface EmergencyStoreSlice {
  emergencyProtocol: EmergencyProtocol;
  auditTrail: AuditEntry[];
  transactions: Transaction[];
  pendingTransactions: Transaction[];
  addAuditEntry: (entry: Omit<AuditEntry, 'id' | 'timestamp'>) => void;
  setEmergencyProtocol: (protocol: Partial<EmergencyProtocol>) => void;
}

export const useEmergencyStore = <T>(
  selector: (slice: EmergencyStoreSlice) => T,
): T =>
  useWalletStore((state) =>
    selector({
      emergencyProtocol: state.emergencyProtocol,
      auditTrail: state.auditTrail,
      transactions: state.transactions,
      pendingTransactions: state.pendingTransactions,
      addAuditEntry: state.addAuditEntry,
      setEmergencyProtocol: state.setEmergencyProtocol,
    }),
  );

