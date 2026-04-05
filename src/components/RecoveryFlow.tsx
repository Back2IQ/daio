import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Key, Plus, Trash2, CheckCircle, AlertTriangle } from 'lucide-react';
import { reconstructSecret, isValidMnemonicPhrase } from '@/lib/crypto';
import { isValidHex } from '@/lib/utils';

const AUTO_CLEAR_MS = 120_000; // auto-clear mnemonic after 2 minutes

const RecoveryFlow: React.FC = () => {
  const [shares, setShares] = useState<string[]>(['', '', '']);
  const [result, setResult] = useState<{ success: boolean; mnemonic?: string; error?: string } | null>(null);
  const clearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-clear sensitive result after timeout
  useEffect(() => {
    if (result?.success && result.mnemonic) {
      clearTimerRef.current = setTimeout(() => setResult(null), AUTO_CLEAR_MS);
    }
    return () => {
      if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
    };
  }, [result]);

  const addShare = () => setShares(prev => [...prev, '']);
  const removeShare = (i: number) => setShares(prev => prev.filter((_, idx) => idx !== i));
  const updateShare = (i: number, value: string) => {
    setShares(prev => prev.map((s, idx) => idx === i ? value.trim() : s));
  };

  const handleRecovery = () => {
    const filledShares = shares.filter(s => s.length > 0);
    if (filledShares.length < 2) {
      setResult({ success: false, error: 'At least 2 key fragments are required' });
      return;
    }
    // Validate hex format of each share
    for (let i = 0; i < filledShares.length; i++) {
      if (!isValidHex(filledShares[i])) {
        setResult({ success: false, error: `Fragment ${i + 1} is not valid hex` });
        return;
      }
    }
    try {
      const mnemonic = reconstructSecret(filledShares);
      // Validate the recovered mnemonic is a valid BIP-39 phrase
      if (!isValidMnemonicPhrase(mnemonic)) {
        setResult({ success: false, error: 'Reconstruction produced an invalid mnemonic. Ensure you have the correct fragments and sufficient threshold.' });
        return;
      }
      setResult({ success: true, mnemonic });
    } catch (err) {
      setResult({ success: false, error: err instanceof Error ? err.message : 'Recovery failed' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Key className="w-8 h-8 text-indigo-600" />
        <div>
          <h2 className="text-2xl font-bold">Key Fragment Recovery</h2>
          <p className="text-slate-500">Reconstruct your mnemonic from Shamir key fragments</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Enter Key Fragments</CardTitle>
          <CardDescription>Enter the threshold number of key fragments to reconstruct your recovery phrase</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {shares.map((share, i) => (
            <div key={i} className="flex items-center gap-2">
              <Badge variant="outline" className="w-8 h-8 flex items-center justify-center flex-shrink-0">{i + 1}</Badge>
              <div className="flex-1">
                <Label className="sr-only">Fragment {i + 1}</Label>
                <Input
                  placeholder={`Key fragment ${i + 1} (hex)...`}
                  value={share}
                  onChange={e => updateShare(i, e.target.value)}
                  className="font-mono text-sm"
                />
              </div>
              {shares.length > 2 && (
                <Button variant="ghost" size="icon" onClick={() => removeShare(i)}>
                  <Trash2 className="w-4 h-4 text-slate-400" />
                </Button>
              )}
            </div>
          ))}

          <Button variant="outline" className="w-full" onClick={addShare}>
            <Plus className="w-4 h-4 mr-2" />Add Fragment
          </Button>

          <Button className="w-full" onClick={handleRecovery} disabled={shares.filter(s => s).length < 2}>
            Reconstruct Recovery Phrase
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Alert variant={result.success ? 'default' : 'destructive'}>
          {result.success ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          <AlertDescription>
            {result.success ? (
              <div className="space-y-2">
                <p className="font-medium text-green-700">Recovery successful!</p>
                <p className="font-mono text-sm bg-green-50 p-3 rounded break-all select-all">{result.mnemonic}</p>
                <p className="text-xs text-slate-500">Store this recovery phrase securely. Do not share it.</p>
                <p className="text-xs text-amber-600">This will auto-clear in 2 minutes for security.</p>
                <Button variant="outline" size="sm" onClick={() => setResult(null)}>Clear Now</Button>
              </div>
            ) : (
              <p>{result.error}</p>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default RecoveryFlow;
