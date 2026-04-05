/**
 * Social Recovery + Guardian Key Reconstruction.
 * Extends guardian role to initiate recovery via Shamir key fragments.
 * Implements time-locked recovery with owner veto period.
 */

// ─── Types ───────────────────────────────────────────────────────

export type RecoveryStatus =
  | 'idle'
  | 'initiated'
  | 'pending_fragments'
  | 'fragments_collected'
  | 'veto_period'
  | 'executing'
  | 'completed'
  | 'vetoed'
  | 'expired';

export interface RecoveryRequest {
  id: string;
  initiatedBy: string;        // guardian ID
  initiatorName: string;
  reason: string;
  createdAt: number;
  vetoDeadline: number;       // owner can veto until this timestamp
  status: RecoveryStatus;
  fragmentsRequired: number;
  fragmentsCollected: string[];  // share hex strings
  guardianApprovals: string[];   // guardian IDs who approved
  completedAt?: number;
}

export interface RecoveryConfig {
  enabled: boolean;
  vetoPeriodHours: number;     // owner veto window (default: 48h)
  requiredGuardians: number;   // min guardians to approve (default: 2)
  maxRecoveryAttempts: number; // max attempts before lockout
  currentAttempts: number;
}

// ─── Default config ──────────────────────────────────────────────

export const DEFAULT_RECOVERY_CONFIG: RecoveryConfig = {
  enabled: false,
  vetoPeriodHours: 48,
  requiredGuardians: 2,
  maxRecoveryAttempts: 3,
  currentAttempts: 0,
};

// ─── Recovery lifecycle ──────────────────────────────────────────

/**
 * Create a new recovery request initiated by a guardian.
 */
export function createRecoveryRequest(
  guardianId: string,
  guardianName: string,
  reason: string,
  config: RecoveryConfig
): { request: RecoveryRequest; updatedConfig: RecoveryConfig } {
  if (!config.enabled) {
    throw new Error('Social recovery is not enabled');
  }
  if (config.currentAttempts >= config.maxRecoveryAttempts) {
    throw new Error('Maximum recovery attempts exceeded');
  }

  const now = Date.now();
  const vetoDeadline = now + config.vetoPeriodHours * 60 * 60 * 1000;

  // Return updated config immutably (no mutation of input)
  const updatedConfig: RecoveryConfig = {
    ...config,
    currentAttempts: config.currentAttempts + 1,
  };

  return {
    request: {
      id: crypto.randomUUID(),
      initiatedBy: guardianId,
      initiatorName: guardianName,
      reason,
      createdAt: now,
      vetoDeadline,
      status: 'initiated',
      fragmentsRequired: config.requiredGuardians,
      fragmentsCollected: [],
      guardianApprovals: [guardianId],
    },
    updatedConfig,
  };
}

/**
 * Guardian submits their key fragment to the recovery request.
 */
export function submitFragment(
  request: RecoveryRequest,
  guardianId: string,
  fragment: string,
  validGuardianIds?: string[]
): RecoveryRequest {
  if (request.status !== 'initiated' && request.status !== 'pending_fragments') {
    throw new Error(`Cannot submit fragment in state: ${request.status}`);
  }
  if (request.guardianApprovals.includes(guardianId)) {
    throw new Error('Guardian has already submitted their fragment');
  }
  // Validate guardian identity if allowlist is provided
  if (validGuardianIds && !validGuardianIds.includes(guardianId)) {
    throw new Error('Unrecognised guardian ID');
  }
  // Validate fragment format: must be non-empty hex string
  const trimmed = fragment.trim();
  if (!trimmed || !/^[0-9a-fA-F]+$/.test(trimmed)) {
    throw new Error('Invalid fragment format: must be a hex string');
  }
  // Minimum length check — Shamir shares should have meaningful entropy
  if (trimmed.length < 4) {
    throw new Error('Fragment too short to be a valid Shamir share');
  }

  const updated: RecoveryRequest = {
    ...request,
    status: 'pending_fragments',
    fragmentsCollected: [...request.fragmentsCollected, trimmed],
    guardianApprovals: [...request.guardianApprovals, guardianId],
  };

  // Check if enough fragments collected
  if (updated.fragmentsCollected.length >= updated.fragmentsRequired) {
    updated.status = 'fragments_collected';
  }

  return updated;
}

/**
 * Move to veto period after fragments are collected.
 */
export function startVetoPeriod(request: RecoveryRequest): RecoveryRequest {
  if (request.status !== 'fragments_collected') {
    throw new Error('Not enough fragments collected');
  }
  return {
    ...request,
    status: 'veto_period',
  };
}

/**
 * Owner vetoes the recovery request during the veto period.
 */
export function vetoRecovery(request: RecoveryRequest): RecoveryRequest {
  if (request.status !== 'veto_period' && request.status !== 'fragments_collected') {
    throw new Error('Cannot veto in current state');
  }
  if (Date.now() > request.vetoDeadline) {
    throw new Error('Veto period has expired');
  }
  return {
    ...request,
    status: 'vetoed',
    completedAt: Date.now(),
  };
}

/**
 * Execute recovery after veto period expires without owner intervention.
 */
export function executeRecovery(request: RecoveryRequest): RecoveryRequest {
  if (request.status !== 'veto_period') {
    throw new Error('Recovery must be in veto period to execute');
  }
  if (Date.now() < request.vetoDeadline) {
    throw new Error('Veto period has not expired yet');
  }
  return {
    ...request,
    status: 'executing',
  };
}

/**
 * Mark recovery as completed after secret reconstruction.
 */
export function completeRecovery(request: RecoveryRequest): RecoveryRequest {
  if (request.status !== 'executing') {
    throw new Error('Recovery must be executing to complete');
  }
  return {
    ...request,
    status: 'completed',
    completedAt: Date.now(),
  };
}

// ─── Validation helpers ──────────────────────────────────────────

export function isVetoPeriodExpired(request: RecoveryRequest): boolean {
  return Date.now() > request.vetoDeadline;
}

export function getVetoTimeRemaining(request: RecoveryRequest): number {
  return Math.max(0, request.vetoDeadline - Date.now());
}

export function formatTimeRemaining(ms: number): string {
  if (ms <= 0) return 'Expired';
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function getRecoveryStatusColor(status: RecoveryStatus): string {
  switch (status) {
    case 'idle': return 'bg-slate-100 text-slate-600';
    case 'initiated':
    case 'pending_fragments': return 'bg-blue-100 text-blue-700';
    case 'fragments_collected': return 'bg-amber-100 text-amber-700';
    case 'veto_period': return 'bg-yellow-100 text-yellow-700';
    case 'executing': return 'bg-purple-100 text-purple-700';
    case 'completed': return 'bg-green-100 text-green-700';
    case 'vetoed': return 'bg-red-100 text-red-700';
    case 'expired': return 'bg-slate-100 text-slate-500';
  }
}

export function getRecoveryStatusLabel(status: RecoveryStatus): string {
  switch (status) {
    case 'idle': return 'No Active Recovery';
    case 'initiated': return 'Recovery Initiated';
    case 'pending_fragments': return 'Collecting Fragments';
    case 'fragments_collected': return 'Fragments Collected';
    case 'veto_period': return 'Veto Period Active';
    case 'executing': return 'Executing Recovery';
    case 'completed': return 'Recovery Complete';
    case 'vetoed': return 'Vetoed by Owner';
    case 'expired': return 'Recovery Expired';
  }
}
