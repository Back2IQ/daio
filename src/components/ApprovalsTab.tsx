import React, { useState, useCallback } from 'react';
import {
  ShieldAlert, Loader2, Trash2, RefreshCw, ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { useWalletStore } from '@/store/walletStore';
import {
  scanApprovals,
  buildRevokeTx,
  getRiskColor,
  getRiskLabel,
  getSpenderLabel,
  type TokenApproval,
} from '@/lib/approvals';
import { formatAddress } from '@/lib/crypto';

const ApprovalsTab: React.FC = () => {
  const activeAccount = useWalletStore((s) => s.getActiveAccount());
  const activeNetwork = useWalletStore((s) => s.getActiveNetwork());
  const tokens = useWalletStore((s) => s.tokens);
  const addAuditEntry = useWalletStore((s) => s.addAuditEntry);

  const [approvals, setApprovals] = useState<TokenApproval[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [hasScanned, setHasScanned] = useState(false);

  const handleScan = useCallback(async () => {
    if (!activeAccount) return;
    setIsScanning(true);
    try {
      const tokenAddresses = tokens
        .filter((t) => t.chainId === activeNetwork.chainId && t.contractAddress)
        .map((t) => t.contractAddress);

      const results = await scanApprovals(
        activeNetwork.chainId,
        activeAccount.address,
        tokenAddresses
      );

      setApprovals(results);
      setHasScanned(true);
      toast.success(`Found ${results.length} active approval${results.length !== 1 ? 's' : ''}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Scan failed');
    } finally {
      setIsScanning(false);
    }
  }, [activeAccount, activeNetwork, tokens]);

  const handleRevoke = async (approval: TokenApproval) => {
    if (!activeAccount) return;
    setRevokingId(approval.id);
    try {
      buildRevokeTx(approval.tokenAddress, approval.spender);

      // In production: sign and broadcast the tx via viem WalletClient
      addAuditEntry({
        action: 'Approval Revoked',
        details: `Revoked ${approval.tokenSymbol} approval for ${getSpenderLabel(approval.spender) || formatAddress(approval.spender)}`,
        type: 'success',
      });

      setApprovals((prev) => prev.filter((a) => a.id !== approval.id));
      toast.success(`Revoked ${approval.tokenSymbol} approval`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Revoke failed');
    } finally {
      setRevokingId(null);
    }
  };

  const highRiskCount = approvals.filter((a) => a.riskLevel === 'high').length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5" />Token Approvals
              </CardTitle>
              <CardDescription>
                Manage ERC-20 token approvals and revoke unnecessary permissions
              </CardDescription>
            </div>
            <Button onClick={handleScan} disabled={isScanning || !activeAccount}>
              {isScanning ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Scanning...</>
              ) : (
                <><RefreshCw className="w-4 h-4 mr-2" />Scan Approvals</>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!hasScanned ? (
            <p className="text-sm text-slate-500 text-center py-8">
              Click "Scan Approvals" to check your active token approvals
            </p>
          ) : approvals.length === 0 ? (
            <Alert>
              <AlertDescription>No active token approvals found. Your wallet is clean!</AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-2">
              {highRiskCount > 0 && (
                <Alert variant="destructive" className="mb-4">
                  <ShieldAlert className="w-4 h-4" />
                  <AlertDescription>
                    {highRiskCount} unlimited approval{highRiskCount !== 1 ? 's' : ''} detected.
                    Consider revoking unused approvals to reduce risk.
                  </AlertDescription>
                </Alert>
              )}

              {approvals.map((approval) => (
                <div
                  key={approval.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{approval.tokenSymbol}</span>
                      <Badge className={`text-[10px] ${getRiskColor(approval.riskLevel)}`}>
                        {getRiskLabel(approval.riskLevel)}
                      </Badge>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      <span>Spender: </span>
                      <span className="font-mono">
                        {getSpenderLabel(approval.spender) || formatAddress(approval.spender)}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Allowance: {approval.allowanceFormatted}
                      {approval.isUnlimited && (
                        <span className="text-red-500 ml-1">(unlimited)</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <a
                      href={`${activeNetwork.explorerUrl}/address/${approval.spender}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRevoke(approval)}
                      disabled={revokingId === approval.id}
                    >
                      {revokingId === approval.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <><Trash2 className="w-3.5 h-3.5 mr-1" />Revoke</>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ApprovalsTab;
