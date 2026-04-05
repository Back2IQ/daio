/**
 * WalletConnect v2 integration via Reown WalletKit.
 * Manages WC sessions, handles sign requests, and dispatches
 * transaction signing using the wallet's derived private key.
 */

import { WalletKit, type WalletKitTypes } from '@reown/walletkit';
import { Core } from '@walletconnect/core';
import { buildApprovedNamespaces, getSdkError } from '@walletconnect/utils';

// ─── Types ───────────────────────────────────────────────────────

export interface WCSession {
  topic: string;
  peerName: string;
  peerUrl: string;
  peerIcon?: string;
  chains: string[];
  connectedAt: number;
}

export interface WCSignRequest {
  id: number;
  topic: string;
  method: string;
  params: unknown[];
  peerName: string;
  chainId?: string;
}

type EventCallback = (data: unknown) => void;

// ─── Singleton manager ───────────────────────────────────────────

let walletKit: InstanceType<typeof WalletKit> | null = null;
const listeners = new Map<string, Set<EventCallback>>();

function emit(event: string, data: unknown) {
  listeners.get(event)?.forEach((cb) => cb(data));
}

export function onWCEvent(event: string, cb: EventCallback) {
  if (!listeners.has(event)) listeners.set(event, new Set());
  listeners.get(event)!.add(cb);
  return () => { listeners.get(event)?.delete(cb); };
}

// ─── Init ────────────────────────────────────────────────────────

const PROJECT_ID = 'daio-wallet-wc-project'; // Replace with real Reown project ID for production

export async function initWalletKit(): Promise<InstanceType<typeof WalletKit>> {
  if (walletKit) return walletKit;

  const core = new Core({ projectId: PROJECT_ID });

  walletKit = await WalletKit.init({
    core,
    metadata: {
      name: 'DAIO Wallet',
      description: 'Digital Asset Inheritance Orchestration Wallet',
      url: 'https://daio.wallet',
      icons: ['https://daio.wallet/icon.png'],
    },
  });

  // Relay WC events to our event bus
  walletKit.on('session_proposal', (proposal: WalletKitTypes.SessionProposal) => {
    emit('session_proposal', proposal);
  });

  walletKit.on('session_request', (request: WalletKitTypes.SessionRequest) => {
    emit('session_request', request);
  });

  walletKit.on('session_delete', (event: { topic: string }) => {
    emit('session_delete', event);
  });

  return walletKit;
}

export function getWalletKit() {
  return walletKit;
}

// ─── Pairing (QR / URI) ─────────────────────────────────────────

export async function pairWithUri(uri: string): Promise<void> {
  const kit = await initWalletKit();
  await kit.pair({ uri });
}

// ─── Session approval ────────────────────────────────────────────

export async function approveSession(
  proposal: WalletKitTypes.SessionProposal,
  accounts: string[],       // e.g. ["0xABC..."]
  supportedChainIds: number[] // e.g. [1, 137, 42161]
): Promise<WCSession> {
  const kit = await initWalletKit();

  const eipChains = supportedChainIds.map((id) => `eip155:${id}`);
  const eipAccounts = accounts.flatMap((addr) =>
    supportedChainIds.map((id) => `eip155:${id}:${addr}`)
  );

  const namespaces = buildApprovedNamespaces({
    proposal: proposal.params,
    supportedNamespaces: {
      eip155: {
        chains: eipChains,
        methods: [
          'personal_sign',
          'eth_signTypedData',
          'eth_signTypedData_v4',
        ],
        events: ['chainChanged', 'accountsChanged'],
        accounts: eipAccounts,
      },
    },
  });

  const session = await kit.approveSession({
    id: proposal.id,
    namespaces,
  });

  const peer = proposal.params.proposer.metadata;
  return {
    topic: session.topic,
    peerName: peer.name,
    peerUrl: peer.url,
    peerIcon: peer.icons?.[0],
    chains: eipChains,
    connectedAt: Date.now(),
  };
}

export async function rejectSession(proposalId: number): Promise<void> {
  const kit = await initWalletKit();
  await kit.rejectSession({
    id: proposalId,
    reason: getSdkError('USER_REJECTED'),
  });
}

// ─── Request handling ────────────────────────────────────────────

export async function approveRequest(
  topic: string,
  id: number,
  result: unknown
): Promise<void> {
  const kit = await initWalletKit();
  await kit.respondSessionRequest({ topic, response: { id, jsonrpc: '2.0', result } });
}

export async function rejectRequest(
  topic: string,
  id: number
): Promise<void> {
  const kit = await initWalletKit();
  await kit.respondSessionRequest({
    topic,
    response: {
      id,
      jsonrpc: '2.0',
      error: getSdkError('USER_REJECTED'),
    },
  });
}

// ─── Session management ──────────────────────────────────────────

export function getActiveSessions(): WCSession[] {
  if (!walletKit) return [];
  const sessions = walletKit.getActiveSessions();
  return Object.values(sessions).map((s) => ({
    topic: s.topic,
    peerName: s.peer.metadata.name,
    peerUrl: s.peer.metadata.url,
    peerIcon: s.peer.metadata.icons?.[0],
    chains: Object.keys(s.namespaces).flatMap(
      (ns) => s.namespaces[ns].chains || []
    ),
    connectedAt: s.expiry ? s.expiry * 1000 - 7 * 24 * 60 * 60 * 1000 : Date.now(),
  }));
}

export async function disconnectSession(topic: string): Promise<void> {
  const kit = await initWalletKit();
  await kit.disconnectSession({
    topic,
    reason: getSdkError('USER_DISCONNECTED'),
  });
}

// ─── Helpers: sign with private key ──────────────────────────────

export function parseSignRequest(
  request: WalletKitTypes.SessionRequest
): WCSignRequest {
  const { id, topic } = request;
  const { request: req, chainId } = request.params;
  return {
    id,
    topic,
    method: req.method,
    params: req.params,
    peerName: '', // filled by component via session lookup
    chainId,
  };
}
