import { describe, it, expect, beforeEach } from 'vitest';
import { useWalletStore } from '../walletStore';

describe('DMS escalation helpers', () => {
  beforeEach(() => {
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
  });

  it('getTimeUntilTrigger returns time string when active', () => {
    const time = useWalletStore.getState().getTimeUntilTrigger();
    expect(time).toMatch(/\d+d \d+h/);
  });

  it('getTimeUntilTrigger returns Inactive when disabled', () => {
    useWalletStore.setState({
      deadManSwitch: {
        enabled: false, intervalMonths: 6, lastCheckIn: Date.now(),
        status: 'inactive', warningsSent: 0, nextCheckIn: Date.now(),
      },
    });
    expect(useWalletStore.getState().getTimeUntilTrigger()).toBe('Inactive');
  });

  it('getTimeUntilTrigger returns Triggered when triggered', () => {
    useWalletStore.setState({
      deadManSwitch: {
        enabled: true, intervalMonths: 6, lastCheckIn: Date.now() - 1000000000,
        status: 'triggered', warningsSent: 3, nextCheckIn: Date.now() - 500000000,
      },
    });
    expect(useWalletStore.getState().getTimeUntilTrigger()).toBe('Triggered');
  });

  it('getDmsStatusColor returns correct color per status', () => {
    useWalletStore.setState({
      deadManSwitch: { ...useWalletStore.getState().deadManSwitch, status: 'active' },
    });
    expect(useWalletStore.getState().getDmsStatusColor()).toBe('text-green-600');

    useWalletStore.setState({
      deadManSwitch: { ...useWalletStore.getState().deadManSwitch, status: 'warning_2' },
    });
    expect(useWalletStore.getState().getDmsStatusColor()).toBe('text-orange-500');

    useWalletStore.setState({
      deadManSwitch: { ...useWalletStore.getState().deadManSwitch, status: 'triggered' },
    });
    expect(useWalletStore.getState().getDmsStatusColor()).toBe('text-red-700');
  });
});

describe('inheritance container', () => {
  beforeEach(() => {
    useWalletStore.setState({ inheritanceContainer: null, auditTrail: [] });
  });

  it('setInheritanceContainer stores container and creates audit entry', () => {
    useWalletStore.getState().setInheritanceContainer({
      level: 1, version: 1, lastUpdated: Date.now(),
      assetInventory: 'BTC, ETH',
      accessArchitecture: 'Hardware wallet',
      heirDesignation: 'Alice',
      legacyContext: '',
      platformInstructions: '',
      professionalContacts: '',
    });

    const state = useWalletStore.getState();
    expect(state.inheritanceContainer).not.toBeNull();
    expect(state.inheritanceContainer!.level).toBe(1);
    expect(state.inheritanceContainer!.assetInventory).toBe('BTC, ETH');
    expect(state.auditTrail).toHaveLength(1);
    expect(state.auditTrail[0].action).toBe('UPDATE_INHERITANCE_CONTAINER');
  });

  it('upgrading level preserves data', () => {
    useWalletStore.getState().setInheritanceContainer({
      level: 1, version: 1, lastUpdated: Date.now(),
      assetInventory: 'BTC', accessArchitecture: 'HW', heirDesignation: 'Alice',
      legacyContext: '', platformInstructions: '', professionalContacts: '',
    });

    useWalletStore.getState().setInheritanceContainer({
      level: 2, version: 2, lastUpdated: Date.now(),
      assetInventory: 'BTC', accessArchitecture: 'HW', heirDesignation: 'Alice',
      legacyContext: 'My story', platformInstructions: 'Step 1',
      professionalContacts: '',
    });

    expect(useWalletStore.getState().inheritanceContainer!.level).toBe(2);
    expect(useWalletStore.getState().inheritanceContainer!.legacyContext).toBe('My story');
  });
});

describe('emergency protocol', () => {
  beforeEach(() => {
    useWalletStore.setState({
      emergencyProtocol: { enabled: false, authorizedGuardians: [] },
      auditTrail: [],
    });
  });

  it('setEmergencyProtocol enables and records', () => {
    useWalletStore.getState().setEmergencyProtocol({
      enabled: true,
      reason: 'Theft detected',
      lastTriggered: Date.now(),
    });

    const state = useWalletStore.getState();
    expect(state.emergencyProtocol.enabled).toBe(true);
    expect(state.emergencyProtocol.reason).toBe('Theft detected');
    expect(state.auditTrail).toHaveLength(1);
    expect(state.auditTrail[0].type).toBe('warning');
  });

  it('partial update preserves existing fields', () => {
    useWalletStore.getState().setEmergencyProtocol({
      enabled: true,
      authorizedGuardians: ['g1', 'g2'],
    });
    useWalletStore.getState().setEmergencyProtocol({
      reason: 'Updated reason',
    });

    const ep = useWalletStore.getState().emergencyProtocol;
    expect(ep.enabled).toBe(true);
    expect(ep.authorizedGuardians).toEqual(['g1', 'g2']);
    expect(ep.reason).toBe('Updated reason');
  });
});

describe('transfer gate steps', () => {
  it('has 5 default steps all pending', () => {
    const steps = useWalletStore.getState().transferGateSteps;
    expect(steps).toHaveLength(5);
    steps.forEach((step, i) => {
      expect(step.step).toBe(i + 1);
      expect(step.status).toBe('pending');
      expect(step.label).toBeTruthy();
      expect(step.description).toBeTruthy();
    });
  });
});

describe('user role', () => {
  it('defaults to owner', () => {
    expect(useWalletStore.getState().userRole).toBe('owner');
  });
});
