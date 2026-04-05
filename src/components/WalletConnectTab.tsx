import React, { useState, useEffect, useCallback } from 'react';
import {
  Link2, Unlink, QrCode, Check, X, Loader2, ExternalLink, Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useWalletStore } from '@/store/walletStore';
import {
  initWalletKit,
  pairWithUri,
  approveSession,
  rejectSession,
  approveRequest,
  rejectRequest,
  getActiveSessions,
  disconnectSession,
  parseSignRequest,
  onWCEvent,
  type WCSession,
  type WCSignRequest,
} from '@/lib/walletconnect';
import { decodeCalldata, type DecodedAction } from '@/lib/blockchain';
import type { WalletKitTypes } from '@reown/walletkit';
import { keccak_256 } from '@noble/hashes/sha3.js';
import { bytesToHex, hexToBytes } from '@noble/hashes/utils.js';
import * as secp256k1 from '@noble/secp256k1';
import { hashTypedData, createWalletClient, http, type Chain } from 'viem';
import { mainnet, sepolia, polygon, bsc, avalanche, optimism, arbitrum } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

// ─── Sign helper ─────────────────────────────────────────────────

function signMessage(message: Uint8Array, privateKeyHex: string): string {
  const msgHash = keccak_256(message);
  const privBytes = hexToBytes(privateKeyHex);
  // Use 'recovered' format to get 65-byte signature (r||s||v)
  const sig = secp256k1.sign(msgHash, privBytes, { format: 'recovered' as const });
  const sigHex = bytesToHex(sig);
  // 'recovered' format: 65 bytes = r(32) || s(32) || recovery(1)
  // Ethereum expects v = recovery + 27
  const rsPart = sigHex.slice(0, 128); // 64 hex chars = 32 bytes r + 32 bytes s
  const recoveryByte = parseInt(sigHex.slice(128, 130), 16);
  const v = (recoveryByte + 27).toString(16).padStart(2, '0');
  return '0x' + rsPart + v;
}

function personalSign(message: string, privateKeyHex: string): string {
  const msgBytes = typeof message === 'string' && message.startsWith('0x')
    ? hexToBytes(message.slice(2))
    : new TextEncoder().encode(message);
  const prefix = new TextEncoder().encode(`\x19Ethereum Signed Message:\n${msgBytes.length}`);
  const full = new Uint8Array(prefix.length + msgBytes.length);
  full.set(prefix);
  full.set(msgBytes, prefix.length);
  return signMessage(full, privateKeyHex);
}

// Chain map for WalletClient
const viemChains: Record<number, Chain> = {
  1: mainnet, 11155111: sepolia, 137: polygon,
  56: bsc, 43114: avalanche, 10: optimism, 42161: arbitrum,
};

// ─── Component ───────────────────────────────────────────────────

const WalletConnectTab: React.FC = () => {
  const [wcUri, setWcUri] = useState('');
  const [isPairing, setIsPairing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [sessions, setSessions] = useState<WCSession[]>([]);

  // Pending proposal / request
  const [pendingProposal, setPendingProposal] = useState<WalletKitTypes.SessionProposal | null>(null);
  const [pendingRequest, setPendingRequest] = useState<WCSignRequest | null>(null);
  const [decodedActions, setDecodedActions] = useState<DecodedAction[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const activeAccount = useWalletStore((s) => s.getActiveAccount());
  const networks = useWalletStore((s) => s.networks);
  const addAuditEntry = useWalletStore((s) => s.addAuditEntry);

  const supportedChainIds = networks.filter((n) => !n.isTestnet).map((n) => n.chainId);

  const refreshSessions = useCallback(() => {
    setSessions(getActiveSessions());
  }, []);

  // Init WalletKit on mount
  useEffect(() => {
    let cancelled = false;
    initWalletKit()
      .then(() => {
        if (!cancelled) {
          setIsInitialized(true);
          refreshSessions();
        }
      })
      .catch((err) => {
        console.error('WalletKit init failed:', err);
        toast.error('WalletConnect initialization failed');
      });
    return () => { cancelled = true; };
  }, [refreshSessions]);

  // Subscribe to WC events
  useEffect(() => {
    const unsubs = [
      onWCEvent('session_proposal', (data) => {
        setPendingProposal(data as WalletKitTypes.SessionProposal);
      }),
      onWCEvent('session_request', (data) => {
        const req = parseSignRequest(data as WalletKitTypes.SessionRequest);
        // Enrich with peer name from active sessions
        const session = sessions.find((s) => s.topic === req.topic);
        if (session) req.peerName = session.peerName;
        // Decode transaction actions for eth_sendTransaction
        if (req.method === 'eth_sendTransaction' && req.params[0]) {
          const txParams = req.params[0] as Record<string, string>;
          const actions = decodeCalldata(txParams.data, txParams.value || '0', txParams.to || '');
          setDecodedActions(actions);
        } else {
          setDecodedActions([]);
        }
        setPendingRequest(req);
      }),
      onWCEvent('session_delete', () => {
        refreshSessions();
        toast.info('dApp disconnected');
      }),
    ];
    return () => unsubs.forEach((u) => u());
  }, [sessions, refreshSessions]);

  // ─── Pair ────────────────────────────────────────────────────────

  const handlePair = async () => {
    if (!wcUri.trim()) { toast.error('Enter a WalletConnect URI'); return; }
    setIsPairing(true);
    try {
      await pairWithUri(wcUri.trim());
      setWcUri('');
      toast.success('Pairing initiated — waiting for dApp proposal');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Pairing failed');
    } finally {
      setIsPairing(false);
    }
  };

  // ─── Approve / Reject proposal ──────────────────────────────────

  const handleApproveSession = async () => {
    if (!pendingProposal || !activeAccount) return;
    setIsProcessing(true);
    try {
      const newSession = await approveSession(
        pendingProposal,
        [activeAccount.address],
        supportedChainIds
      );
      setSessions((prev) => [...prev, newSession]);
      addAuditEntry({
        action: 'WalletConnect Session',
        details: `Connected to ${newSession.peerName}`,
        type: 'info',
      });
      toast.success(`Connected to ${newSession.peerName}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Session approval failed');
    } finally {
      setPendingProposal(null);
      setIsProcessing(false);
    }
  };

  const handleRejectSession = async () => {
    if (!pendingProposal) return;
    try {
      await rejectSession(pendingProposal.id);
    } catch { /* ignore */ }
    setPendingProposal(null);
  };

  // ─── Approve / Reject sign request ──────────────────────────────

  const handleApproveRequest = async () => {
    if (!pendingRequest || !activeAccount) return;

    // Chain ID validation: ensure request chain matches a session-approved chain
    if (pendingRequest.chainId) {
      const requestedChainId = parseInt(pendingRequest.chainId.split(':')[1] || '0', 10);
      if (requestedChainId && !supportedChainIds.includes(requestedChainId)) {
        toast.error(`Unsupported chain: ${pendingRequest.chainId}`);
        return;
      }
    }

    setIsProcessing(true);
    try {
      let result: string;
      const { method, params } = pendingRequest;

      if (method === 'personal_sign') {
        const [message] = params as [string, string];
        result = personalSign(message, activeAccount.privateKey);
      } else if (method === 'eth_signTypedData' || method === 'eth_signTypedData_v4') {
        // Proper EIP-712: parse typed data and use viem's hashTypedData
        const rawTypedData = typeof params[1] === 'string' ? JSON.parse(params[1]) : params[1];
        const typedDataObj = rawTypedData as {
          domain: Record<string, unknown>;
          types: Record<string, Array<{ name: string; type: string }>>;
          primaryType: string;
          message: Record<string, unknown>;
        };

        // Validate domain chainId matches request chainId
        if (pendingRequest.chainId && typedDataObj.domain?.chainId) {
          const requestedChain = parseInt(pendingRequest.chainId.split(':')[1] || '0', 10);
          const domainChain = Number(typedDataObj.domain.chainId);
          if (requestedChain && domainChain && requestedChain !== domainChain) {
            throw new Error(`Chain ID mismatch: request=${requestedChain}, domain=${domainChain}`);
          }
        }

        // Compute proper EIP-712 hash
        const typedHash = hashTypedData({
          domain: typedDataObj.domain,
          types: typedDataObj.types,
          primaryType: typedDataObj.primaryType,
          message: typedDataObj.message,
        });

        // Sign the EIP-712 hash directly (not wrapped in personal_sign prefix)
        const privBytes = hexToBytes(activeAccount.privateKey);
        const sig = secp256k1.sign(hexToBytes(typedHash.slice(2)), privBytes, { format: 'recovered' as const });
        const sigHex = bytesToHex(sig);
        const rsPart = sigHex.slice(0, 128);
        const recoveryByte = parseInt(sigHex.slice(128, 130), 16);
        const v = (recoveryByte + 27).toString(16).padStart(2, '0');
        result = '0x' + rsPart + v;
      } else if (method === 'eth_sendTransaction') {
        // Real transaction signing via viem WalletClient
        const txParams = params[0] as Record<string, string>;
        const chainIdNum = pendingRequest.chainId
          ? parseInt(pendingRequest.chainId.split(':')[1] || '1', 10)
          : 1;
        const chain = viemChains[chainIdNum];
        if (!chain) throw new Error(`Unsupported chain for transaction: ${chainIdNum}`);

        const account = privateKeyToAccount(`0x${activeAccount.privateKey}` as `0x${string}`);
        const client = createWalletClient({
          account,
          chain,
          transport: http(),
        });

        const txHash = await client.sendTransaction({
          to: txParams.to as `0x${string}`,
          data: (txParams.data || '0x') as `0x${string}`,
          value: txParams.value ? BigInt(txParams.value) : 0n,
          ...(txParams.gas ? { gas: BigInt(txParams.gas) } : {}),
          ...(txParams.gasPrice ? { gasPrice: BigInt(txParams.gasPrice) } : {}),
        });
        result = txHash;
      } else {
        throw new Error(`Unsupported method: ${method}`);
      }

      await approveRequest(pendingRequest.topic, pendingRequest.id, result);
      addAuditEntry({
        action: 'WC Request Signed',
        details: `${method} for ${pendingRequest.peerName}`,
        type: 'info',
      });
      toast.success('Request signed');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Signing failed');
    } finally {
      setPendingRequest(null);
      setIsProcessing(false);
    }
  };

  const handleRejectRequest = async () => {
    if (!pendingRequest) return;
    try {
      await rejectRequest(pendingRequest.topic, pendingRequest.id);
    } catch { /* ignore */ }
    setPendingRequest(null);
  };

  // ─── Disconnect ──────────────────────────────────────────────────

  const handleDisconnect = async (topic: string) => {
    try {
      await disconnectSession(topic);
      setSessions((prev) => prev.filter((s) => s.topic !== topic));
      addAuditEntry({
        action: 'WC Disconnected',
        details: `Session ${topic.slice(0, 8)}… disconnected`,
        type: 'info',
      });
      toast.success('Disconnected');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Disconnect failed');
    }
  };

  // ─── Render ──────────────────────────────────────────────────────

  if (!isInitialized) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>Initializing WalletConnect...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Connect */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="w-5 h-5" />WalletConnect
          </CardTitle>
          <CardDescription>
            Connect to dApps by pasting a WalletConnect URI
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="wc-uri">WalletConnect URI</Label>
            <div className="flex gap-2">
              <Input
                id="wc-uri"
                placeholder="wc:..."
                value={wcUri}
                onChange={(e) => setWcUri(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handlePair()}
              />
              <Button onClick={handlePair} disabled={isPairing || !wcUri.trim()}>
                {isPairing ? <Loader2 className="w-4 h-4 animate-spin" /> : <QrCode className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {activeAccount && (
            <Alert>
              <Shield className="w-4 h-4" />
              <AlertDescription>
                Connected account: <span className="font-mono text-xs">{activeAccount.address}</span>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Active Sessions ({sessions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">No active sessions</p>
          ) : (
            <div className="space-y-3">
              {sessions.map((s) => (
                <div key={s.topic} className="flex items-center justify-between p-3 rounded-lg border bg-slate-50">
                  <div className="flex items-center gap-3">
                    {s.peerIcon ? (
                      <img src={s.peerIcon} alt={s.peerName} className="w-8 h-8 rounded" />
                    ) : (
                      <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center">
                        <ExternalLink className="w-4 h-4 text-blue-600" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-sm">{s.peerName}</p>
                      <p className="text-xs text-slate-500">{s.peerUrl}</p>
                      <div className="flex gap-1 mt-1">
                        {s.chains.map((c) => (
                          <Badge key={c} variant="secondary" className="text-[10px]">{c}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleDisconnect(s.topic)}>
                    <Unlink className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Session Proposal Dialog */}
      <Dialog open={!!pendingProposal} onOpenChange={() => !isProcessing && setPendingProposal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Session Request</DialogTitle>
            <DialogDescription>
              {pendingProposal?.params.proposer.metadata.name} wants to connect
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <div className="flex items-center gap-3">
              {pendingProposal?.params.proposer.metadata.icons?.[0] && (
                <img
                  src={pendingProposal.params.proposer.metadata.icons[0]}
                  alt="dApp"
                  className="w-12 h-12 rounded"
                />
              )}
              <div>
                <p className="font-medium">{pendingProposal?.params.proposer.metadata.name}</p>
                <p className="text-sm text-slate-500">{pendingProposal?.params.proposer.metadata.url}</p>
              </div>
            </div>
            <p className="text-sm text-slate-600">
              {pendingProposal?.params.proposer.metadata.description}
            </p>
            <Alert>
              <AlertDescription className="text-xs">
                This dApp will be able to request signatures and transactions from your wallet.
                Always review requests before approving.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleRejectSession} disabled={isProcessing}>
              <X className="w-4 h-4 mr-1" />Reject
            </Button>
            <Button onClick={handleApproveSession} disabled={isProcessing}>
              {isProcessing ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Check className="w-4 h-4 mr-1" />}
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sign Request Dialog */}
      <Dialog open={!!pendingRequest} onOpenChange={() => !isProcessing && setPendingRequest(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign Request</DialogTitle>
            <DialogDescription>
              {pendingRequest?.peerName || 'dApp'} requests: {pendingRequest?.method}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3">
            {decodedActions.length > 0 && (
              <div className="space-y-2">
                {decodedActions.map((action, i) => (
                  <div key={i} className={`p-2 rounded border text-xs ${
                    action.riskLevel === 'high' ? 'border-red-300 bg-red-50' :
                    action.riskLevel === 'medium' ? 'border-yellow-300 bg-yellow-50' :
                    'border-green-300 bg-green-50'
                  }`}>
                    <span className="font-semibold">{action.label}</span>
                    {Object.entries(action.details).map(([k, v]) => (
                      <div key={k} className="font-mono break-all">{k}: {v}</div>
                    ))}
                  </div>
                ))}
                {decodedActions.some(a => a.riskLevel === 'high') && (
                  <Alert>
                    <AlertDescription className="text-xs text-red-600 font-medium">
                      Warning: This transaction contains high-risk actions. Review carefully before signing.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
            <div className="p-3 bg-slate-100 rounded-lg font-mono text-xs max-h-48 overflow-auto break-all">
              {JSON.stringify(pendingRequest?.params, null, 2)}
            </div>
            {pendingRequest?.chainId && (
              <Badge variant="outline" className="mt-2">{pendingRequest.chainId}</Badge>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleRejectRequest} disabled={isProcessing}>
              <X className="w-4 h-4 mr-1" />Reject
            </Button>
            <Button onClick={handleApproveRequest} disabled={isProcessing}>
              {isProcessing ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Check className="w-4 h-4 mr-1" />}
              Sign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WalletConnectTab;
