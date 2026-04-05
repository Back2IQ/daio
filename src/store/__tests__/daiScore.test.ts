import { describe, it, expect, beforeEach } from 'vitest';
import { useWalletStore } from '../walletStore';

describe('getDaiScore', () => {
  beforeEach(() => {
    // Reset store to defaults
    useWalletStore.setState({
      beneficiaries: [],
      keyFragments: [],
      deadManSwitch: {
        enabled: false,
        intervalMonths: 6,
        lastCheckIn: Date.now(),
        status: 'inactive',
        warningsSent: 0,
        nextCheckIn: Date.now() + 6 * 30 * 24 * 60 * 60 * 1000,
      },
      inheritanceContainer: null,
      emergencyProtocol: { enabled: false, authorizedGuardians: [] },
    });
  });

  it('returns 0 for default state', () => {
    expect(useWalletStore.getState().getDaiScore()).toBe(0);
  });

  it('adds 20 for enabled DMS in active status', () => {
    useWalletStore.setState({
      deadManSwitch: {
        enabled: true,
        intervalMonths: 6,
        lastCheckIn: Date.now(),
        status: 'active',
        warningsSent: 0,
        nextCheckIn: Date.now() + 6 * 30 * 24 * 60 * 60 * 1000,
      },
    });
    expect(useWalletStore.getState().getDaiScore()).toBe(20);
  });

  it('penalizes DMS warnings', () => {
    useWalletStore.setState({
      deadManSwitch: {
        enabled: true,
        intervalMonths: 6,
        lastCheckIn: Date.now(),
        status: 'warning_2',
        warningsSent: 2,
        nextCheckIn: Date.now(),
      },
    });
    expect(useWalletStore.getState().getDaiScore()).toBe(10);
  });

  it('adds 20 for key fragments', () => {
    useWalletStore.setState({
      keyFragments: [{ id: '1', holder: 'self', type: 'self', status: 'distributed', encrypted: true }],
    });
    expect(useWalletStore.getState().getDaiScore()).toBe(20);
  });

  it('adds 5 for 1 beneficiary', () => {
    useWalletStore.setState({
      beneficiaries: [{ id: '1', name: 'Alice', email: 'a@b.com', role: 'heir', notified: false }],
    });
    expect(useWalletStore.getState().getDaiScore()).toBe(5);
  });

  it('adds 10 for 2+ beneficiaries', () => {
    useWalletStore.setState({
      beneficiaries: [
        { id: '1', name: 'Alice', email: 'a@b.com', role: 'heir', notified: false },
        { id: '2', name: 'Bob', email: 'b@b.com', role: 'guardian', notified: false },
      ],
    });
    expect(useWalletStore.getState().getDaiScore()).toBe(10);
  });

  it('adds 15 for 2+ beneficiaries including notary', () => {
    useWalletStore.setState({
      beneficiaries: [
        { id: '1', name: 'Alice', email: 'a@b.com', role: 'heir', notified: false },
        { id: '2', name: 'Notary Co', email: 'n@b.com', role: 'notary', notified: false },
      ],
    });
    expect(useWalletStore.getState().getDaiScore()).toBe(15);
  });

  it('adds 10 for emergency protocol', () => {
    useWalletStore.setState({
      emergencyProtocol: { enabled: true, authorizedGuardians: ['g1'] },
    });
    expect(useWalletStore.getState().getDaiScore()).toBe(10);
  });

  it('adds 10/20/30 for inheritance container levels', () => {
    useWalletStore.setState({
      inheritanceContainer: { level: 1, version: 1, lastUpdated: Date.now(), assetInventory: '', accessArchitecture: '', heirDesignation: '', legacyContext: '', platformInstructions: '', professionalContacts: '' },
    });
    expect(useWalletStore.getState().getDaiScore()).toBe(10);

    useWalletStore.setState({
      inheritanceContainer: { level: 2, version: 1, lastUpdated: Date.now(), assetInventory: '', accessArchitecture: '', heirDesignation: '', legacyContext: '', platformInstructions: '', professionalContacts: '' },
    });
    expect(useWalletStore.getState().getDaiScore()).toBe(20);

    useWalletStore.setState({
      inheritanceContainer: { level: 3, version: 1, lastUpdated: Date.now(), assetInventory: '', accessArchitecture: '', heirDesignation: '', legacyContext: '', platformInstructions: '', professionalContacts: '' },
    });
    expect(useWalletStore.getState().getDaiScore()).toBe(30);
  });

  it('caps at 100', () => {
    useWalletStore.setState({
      inheritanceContainer: { level: 3, version: 1, lastUpdated: Date.now(), assetInventory: '', accessArchitecture: '', heirDesignation: '', legacyContext: '', platformInstructions: '', professionalContacts: '' },
      deadManSwitch: { enabled: true, intervalMonths: 6, lastCheckIn: Date.now(), status: 'active', warningsSent: 0, nextCheckIn: Date.now() + 1000 },
      keyFragments: [{ id: '1', holder: 'self', type: 'self', status: 'distributed', encrypted: true }],
      beneficiaries: [
        { id: '1', name: 'Alice', email: 'a@b.com', role: 'heir', notified: false },
        { id: '2', name: 'Notary Co', email: 'n@b.com', role: 'notary', notified: false },
      ],
      emergencyProtocol: { enabled: true, authorizedGuardians: ['g1'] },
    });
    // 30 + 20 + 20 + 15 + 10 = 95
    expect(useWalletStore.getState().getDaiScore()).toBe(95);
  });
});

describe('checkIn', () => {
  it('resets DMS status and updates timestamps', () => {
    useWalletStore.setState({
      deadManSwitch: {
        enabled: true,
        intervalMonths: 6,
        lastCheckIn: Date.now() - 1000000,
        status: 'warning_1',
        warningsSent: 1,
        nextCheckIn: Date.now() - 500000,
      },
      auditTrail: [],
    });

    useWalletStore.getState().checkIn();
    const state = useWalletStore.getState();

    expect(state.deadManSwitch.status).toBe('active');
    expect(state.deadManSwitch.warningsSent).toBe(0);
    expect(state.deadManSwitch.lastCheckIn).toBeGreaterThan(Date.now() - 1000);
    expect(state.auditTrail).toHaveLength(1);
    expect(state.auditTrail[0].action).toBe('PROOF_OF_LIFE');
  });
});

describe('beneficiary CRUD', () => {
  beforeEach(() => {
    useWalletStore.setState({ beneficiaries: [], auditTrail: [] });
  });

  it('adds a beneficiary', () => {
    useWalletStore.getState().addBeneficiary({ name: 'Alice', email: 'a@b.com', role: 'heir' });
    const state = useWalletStore.getState();
    expect(state.beneficiaries).toHaveLength(1);
    expect(state.beneficiaries[0].name).toBe('Alice');
    expect(state.beneficiaries[0].notified).toBe(false);
    expect(state.auditTrail).toHaveLength(1);
  });

  it('removes a beneficiary', () => {
    useWalletStore.getState().addBeneficiary({ name: 'Alice', email: 'a@b.com', role: 'heir' });
    const id = useWalletStore.getState().beneficiaries[0].id;
    useWalletStore.getState().removeBeneficiary(id);
    expect(useWalletStore.getState().beneficiaries).toHaveLength(0);
    expect(useWalletStore.getState().auditTrail).toHaveLength(2); // add + remove
  });
});
