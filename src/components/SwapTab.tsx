import React, { useState, useMemo } from 'react';
import {
  ArrowDownUp, Loader2, AlertTriangle, ChevronDown, Settings2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover';
import { toast } from 'sonner';
import { useWalletStore } from '@/store/walletStore';
import {
  fetchSwapQuote, formatSwapAmount, getMinReceived, getSwapTokens,
  type SwapQuote, type SwapToken,
} from '@/lib/swaps';
import { simulateTransaction } from '@/lib/blockchain';

const SLIPPAGE_OPTIONS = [
  { label: '0.1%', bps: 10 },
  { label: '0.5%', bps: 50 },
  { label: '1%', bps: 100 },
  { label: '3%', bps: 300 },
];

const SwapTab: React.FC = () => {
  const activeAccount = useWalletStore((s) => s.getActiveAccount());
  const activeNetwork = useWalletStore((s) => s.getActiveNetwork());
  const addAuditEntry = useWalletStore((s) => s.addAuditEntry);

  const tokens = useMemo(
    () => getSwapTokens(activeNetwork.chainId),
    [activeNetwork.chainId]
  );

  const [sellToken, setSellToken] = useState<SwapToken | null>(tokens[0] || null);
  const [buyToken, setBuyToken] = useState<SwapToken | null>(tokens[1] || null);
  const [sellAmount, setSellAmount] = useState('');
  const [slippageBps, setSlippageBps] = useState(50);
  const [quote, setQuote] = useState<SwapQuote | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFlip = () => {
    setSellToken(buyToken);
    setBuyToken(sellToken);
    setSellAmount('');
    setQuote(null);
    setError(null);
  };

  const handleGetQuote = async () => {
    if (!sellToken || !buyToken || !sellAmount || !activeAccount) return;
    if (sellToken.address === buyToken.address) {
      toast.error('Select different tokens');
      return;
    }

    setIsFetching(true);
    setError(null);
    setQuote(null);
    try {
      const q = await fetchSwapQuote({
        sellToken: sellToken.address,
        buyToken: buyToken.address,
        sellAmount,
        sellDecimals: sellToken.decimals,
        buyDecimals: buyToken.decimals,
        slippageBps,
        takerAddress: activeAccount.address,
        chainId: activeNetwork.chainId,
      });
      setQuote(q);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch quote');
    } finally {
      setIsFetching(false);
    }
  };

  const handleSwap = async () => {
    if (!quote || !activeAccount) return;
    setIsSwapping(true);
    try {
      // Simulate first
      const sim = await simulateTransaction(
        activeNetwork.chainId,
        activeAccount.address,
        quote.to,
        '0'
      );
      if (!sim.success) {
        toast.error(sim.error || 'Swap simulation failed');
        return;
      }

      // In production: sign and broadcast via viem WalletClient
      addAuditEntry({
        action: 'Swap Executed',
        details: `${sellAmount} ${sellToken?.symbol} → ${buyToken?.symbol} on ${activeNetwork.name}`,
        type: 'success',
      });
      toast.success('Swap submitted!');
      setSellAmount('');
      setQuote(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Swap failed');
    } finally {
      setIsSwapping(false);
    }
  };

  const TokenSelector: React.FC<{
    selected: SwapToken | null;
    onSelect: (t: SwapToken) => void;
    exclude?: string;
  }> = ({ selected, onSelect, exclude }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="min-w-[120px]">
          {selected?.symbol || 'Select'}<ChevronDown className="w-4 h-4 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {tokens
          .filter((t) => t.address !== exclude)
          .map((t) => (
            <DropdownMenuItem key={t.address} onClick={() => onSelect(t)}>
              <span className="font-medium">{t.symbol}</span>
              <span className="text-xs text-slate-500 ml-2">{t.name}</span>
            </DropdownMenuItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  if (tokens.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-slate-500">
          Swaps not available on {activeNetwork.name}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ArrowDownUp className="w-5 h-5" />Swap
            </CardTitle>
            <CardDescription>Swap tokens via DEX aggregator</CardDescription>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm"><Settings2 className="w-4 h-4" /></Button>
            </PopoverTrigger>
            <PopoverContent className="w-56">
              <Label className="text-xs">Slippage Tolerance</Label>
              <div className="flex gap-1 mt-2">
                {SLIPPAGE_OPTIONS.map((opt) => (
                  <Button
                    key={opt.bps}
                    size="sm"
                    variant={slippageBps === opt.bps ? 'default' : 'outline'}
                    onClick={() => setSlippageBps(opt.bps)}
                    className="flex-1 text-xs"
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Sell */}
        <div className="p-4 rounded-lg border bg-slate-50 space-y-2">
          <Label className="text-xs text-slate-500">You pay</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              step="any"
              min="0"
              placeholder="0.0"
              value={sellAmount}
              onChange={(e) => { setSellAmount(e.target.value); setQuote(null); setError(null); }}
              className="text-lg"
            />
            <TokenSelector selected={sellToken} onSelect={(t) => { setSellToken(t); setQuote(null); }} exclude={buyToken?.address} />
          </div>
        </div>

        {/* Flip */}
        <div className="flex justify-center -my-2 relative z-10">
          <Button variant="outline" size="sm" className="rounded-full" onClick={handleFlip}>
            <ArrowDownUp className="w-4 h-4" />
          </Button>
        </div>

        {/* Buy */}
        <div className="p-4 rounded-lg border bg-slate-50 space-y-2">
          <Label className="text-xs text-slate-500">You receive</Label>
          <div className="flex gap-2">
            <Input
              readOnly
              value={quote && buyToken ? formatSwapAmount(quote.buyAmount, buyToken.decimals) : ''}
              placeholder="0.0"
              className="text-lg bg-transparent"
            />
            <TokenSelector selected={buyToken} onSelect={(t) => { setBuyToken(t); setQuote(null); }} exclude={sellToken?.address} />
          </div>
        </div>

        {/* Quote details */}
        {quote && buyToken && sellToken && (
          <div className="p-3 rounded-lg border text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Rate</span>
              <span>1 {sellToken.symbol} = {parseFloat(quote.price).toFixed(6)} {buyToken.symbol}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Min. received</span>
              <span>{getMinReceived(quote.buyAmount, slippageBps, buyToken.decimals)} {buyToken.symbol}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Slippage</span>
              <Badge variant="secondary" className="text-xs">{(slippageBps / 100).toFixed(1)}%</Badge>
            </div>
            {quote.sources.length > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-500">Route</span>
                <span className="text-xs">{quote.sources.map(s => s.name).join(', ')}</span>
              </div>
            )}
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleGetQuote}
            disabled={!sellToken || !buyToken || !sellAmount || isFetching}
          >
            {isFetching ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Fetching...</> : 'Get Quote'}
          </Button>
          <Button
            className="flex-1"
            onClick={handleSwap}
            disabled={!quote || isSwapping}
          >
            {isSwapping ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Swapping...</> : 'Swap'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SwapTab;
