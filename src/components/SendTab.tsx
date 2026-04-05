import React, { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { useWalletStore } from '@/store/walletStore';
import { isValidAddress } from '@/lib/crypto';
import { simulateTransaction } from '@/lib/blockchain';
import { formatEther } from 'viem';

interface SimResult {
  success: boolean;
  gasEstimate?: bigint;
  error?: string;
}

const SendTab: React.FC = () => {
  const [sendTo, setSendTo] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simResult, setSimResult] = useState<SimResult | null>(null);

  const sendTransaction = useWalletStore(s => s.sendTransaction);
  const activeAccount = useWalletStore(s => s.getActiveAccount());
  const activeNetwork = useWalletStore(s => s.getActiveNetwork());
  const storedPrices = useWalletStore(s => s.tokenPrices);

  const nativePrice = storedPrices[activeNetwork.symbol] ?? 0;

  const handleSimulate = async () => {
    if (!isValidAddress(sendTo)) { toast.error('Invalid address'); return; }
    if (!sendAmount || parseFloat(sendAmount) <= 0) { toast.error('Invalid amount'); return; }

    setIsSimulating(true);
    setSimResult(null);
    try {
      const result = await simulateTransaction(
        activeNetwork.chainId,
        activeAccount?.address || '',
        sendTo,
        sendAmount
      );
      setSimResult(result);
    } catch {
      setSimResult({ success: false, error: 'Simulation unavailable' });
    } finally {
      setIsSimulating(false);
    }
  };

  const handleSend = async () => {
    if (isSending) return;
    if (!isValidAddress(sendTo)) { toast.error('Invalid address'); return; }
    if (!sendAmount || parseFloat(sendAmount) <= 0) { toast.error('Invalid amount'); return; }

    const balance = parseFloat(activeAccount?.balance || '0');
    if (parseFloat(sendAmount) > balance) {
      toast.error('Insufficient balance');
      return;
    }

    setIsSending(true);
    try {
      await sendTransaction(sendTo, sendAmount);
      toast.success('Transaction sent!');
      setSendTo('');
      setSendAmount('');
      setSimResult(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Transaction failed');
    } finally {
      setIsSending(false);
    }
  };

  const gasFeeEth = simResult?.gasEstimate ? formatEther(simResult.gasEstimate * 30000000000n) : null;
  const gasFeeUsd = gasFeeEth ? (parseFloat(gasFeeEth) * nativePrice).toFixed(2) : null;

  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Send {activeNetwork.symbol}</CardTitle>
        <CardDescription>Send {activeNetwork.symbol} to any address</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="send-to">Recipient Address</Label>
          <Input id="send-to" placeholder="0x..." value={sendTo} onChange={(e) => { setSendTo(e.target.value); setSimResult(null); }} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="send-amount">Amount ({activeNetwork.symbol})</Label>
          <Input id="send-amount" type="number" step="0.001" min="0" placeholder="0.0" value={sendAmount} onChange={(e) => { setSendAmount(e.target.value); setSimResult(null); }} />
          <p className="text-sm text-slate-500">Available: {activeAccount?.balance || '0'} {activeNetwork.symbol}</p>
        </div>

        {simResult && (
          <Alert variant={simResult.success ? 'default' : 'destructive'}>
            <AlertDescription>
              {simResult.success ? (
                <div className="space-y-1">
                  <p className="font-medium text-green-700">Simulation passed</p>
                  {gasFeeEth && (
                    <p className="text-sm">Estimated gas: {parseFloat(gasFeeEth).toFixed(6)} {activeNetwork.symbol} (~${gasFeeUsd})</p>
                  )}
                </div>
              ) : (
                <p>{simResult.error || 'Transaction would fail'}</p>
              )}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={handleSimulate} disabled={!sendTo || !sendAmount || isSimulating}>
            {isSimulating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Simulating...</> : 'Preview'}
          </Button>
          <Button className="flex-1" onClick={handleSend} disabled={!sendTo || !sendAmount || isSending}>
            <Send className="w-4 h-4 mr-2" />{isSending ? 'Sending...' : 'Send'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SendTab;
