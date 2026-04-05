import { useWalletStore } from './walletStore';
import type {
  Heir,
  Guardian,
  KeyFragment,
  Beneficiary,
  InheritanceContainer,
} from './walletStore';

export interface InheritanceStoreSlice {
  heirs: Heir[];
  guardians: Guardian[];
  keyFragments: KeyFragment[];
  beneficiaries: Beneficiary[];
  inheritanceContainer: InheritanceContainer | null;
  daiScore: number;
  addHeir: (heir: Omit<Heir, 'id' | 'keyFragment'>) => void;
  removeHeir: (id: string) => void;
  addGuardian: (guardian: Omit<Guardian, 'id'>) => void;
  removeGuardian: (id: string) => void;
  addBeneficiary: (b: Omit<Beneficiary, 'id' | 'notified'>) => void;
  removeBeneficiary: (id: string) => void;
  generateKeyFragments: () => void;
  setInheritanceContainer: (container: InheritanceContainer) => void;
  getDaiScore: () => number;
}

export const useInheritanceStore = <T>(
  selector: (slice: InheritanceStoreSlice) => T,
): T =>
  useWalletStore((state) =>
    selector({
      heirs: state.heirs,
      guardians: state.guardians,
      keyFragments: state.keyFragments,
      beneficiaries: state.beneficiaries,
      inheritanceContainer: state.inheritanceContainer,
      daiScore: state.daiScore,
      addHeir: state.addHeir,
      removeHeir: state.removeHeir,
      addGuardian: state.addGuardian,
      removeGuardian: state.removeGuardian,
      addBeneficiary: state.addBeneficiary,
      removeBeneficiary: state.removeBeneficiary,
      generateKeyFragments: state.generateKeyFragments,
      setInheritanceContainer: state.setInheritanceContainer,
      getDaiScore: state.getDaiScore,
    }),
  );

